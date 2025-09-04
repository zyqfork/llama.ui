import toast from 'react-hot-toast';
import { create } from 'zustand';
import { isDev } from '../config';
import StorageUtils from '../utils/storage';
import {
  CanvasData,
  Conversation,
  Message,
  MessageExtra,
  PendingMessage,
  ViewingChat,
} from '../utils/types';
import { useInferenceStore } from './inference.context';

interface MessageStoreState {
  // canvas
  canvasData: CanvasData | null;
  setCanvasData: (data: CanvasData | null) => void;

  // conversations and messages
  viewingChat: ViewingChat | null;
  pendingMessages: Record<Conversation['id'], PendingMessage>;
  aborts: Record<Conversation['id'], AbortController>;

  setViewingChat: (chat: ViewingChat | null) => void;
  setPending: (convId: string, pendingMsg: PendingMessage | null) => void;
  setAbort: (convId: string, controller: AbortController | null) => void;

  isGenerating: (convId: string) => boolean;

  loadConversation: (convId: string) => Promise<void>;
  generateMessage: (
    convId: string,
    leafNodeId: Message['id'],
    onChunk: CallbackGeneratedChunk
  ) => Promise<void>;
  sendMessage: (
    convId: string,
    leafNodeId: Message['id'],
    content: string,
    extra: Message['extra'],
    onChunk: CallbackGeneratedChunk
  ) => Promise<boolean>;
  stopGenerating: (convId: string) => void;
  replaceMessage: (
    convId: string,
    msg: Message,
    content: string | null,
    onChunk: CallbackGeneratedChunk
  ) => Promise<void>;
  replaceMessageAndGenerate: (
    convId: string,
    msg: Message, // the parent node of the message to be replaced
    content: string | null,
    extra: MessageExtra[] | undefined,
    onChunk: CallbackGeneratedChunk
  ) => Promise<void>;
  branchMessage: (msg: Message) => Promise<Conversation | null>;
}
// this callback is used for scrolling to the bottom of the chat and switching to the last node
export type CallbackGeneratedChunk = (currLeafNodeId?: Message['id']) => void;

const getViewingChat = async (convId: string): Promise<ViewingChat | null> => {
  const conv = await StorageUtils.getOneConversation(convId);
  if (!conv) return null;
  return {
    conv: conv,
    // all messages from all branches, not filtered by last node
    messages: await StorageUtils.getMessages(convId),
  };
};

export const useMessageStore = create<MessageStoreState>()((set, get) => ({
  canvasData: null,
  viewingChat: null,
  pendingMessages: {},
  aborts: {},

  setCanvasData: (data) => set({ canvasData: data }),

  setViewingChat: (chat) => set({ viewingChat: chat }),

  setPending: (convId, pendingMsg) => {
    if (!pendingMsg) {
      set((state) => {
        const newPendingMessages = { ...state.pendingMessages };
        delete newPendingMessages[convId];
        return { pendingMessages: newPendingMessages };
      });
    } else {
      set((state) => ({
        pendingMessages: { ...state.pendingMessages, [convId]: pendingMsg },
      }));
    }
  },

  setAbort: (convId, controller) => {
    if (!controller) {
      set((state) => {
        const newAborts = { ...state.aborts };
        delete newAborts[convId];
        return { aborts: newAborts };
      });
    } else {
      set((state) => ({
        aborts: { ...state.aborts, [convId]: controller },
      }));
    }
  },

  ////////////////////////////////////////////////////////////////////////
  // public functions

  isGenerating: (convId) => !!get().pendingMessages[convId],

  loadConversation: async (convId) => {
    // also reset the canvas data
    set({ canvasData: null });
    const chat = await getViewingChat(convId);
    set({ viewingChat: chat });
  },

  // Private helper method (not exposed in the interface)
  generateMessage: async (convId, leafNodeId, onChunk) => {
    const { isGenerating, setAbort, setPending } = get();

    if (isGenerating(convId)) return;

    const currConversation = await StorageUtils.getOneConversation(convId);
    if (!currConversation) {
      throw new Error('Current conversation is not found');
    }

    const currMessages = StorageUtils.filterByLeafNodeId(
      await StorageUtils.getMessages(convId),
      leafNodeId,
      false
    ).filter((m) => m.role !== 'system');
    const abortController = new AbortController();
    setAbort(convId, abortController);

    if (!currMessages) {
      throw new Error('Current messages are not found');
    }

    const pendingId = Date.now() + 1;
    let pendingMsg: PendingMessage = {
      id: pendingId,
      convId,
      type: 'text',
      timestamp: pendingId,
      role: 'assistant',
      content: null,
      reasoning_content: null,
      parent: leafNodeId,
      children: [],
    };
    setPending(convId, pendingMsg);

    try {
      const chunks = await useInferenceStore
        .getState()
        .api.v1ChatCompletions(currMessages, abortController.signal);
      for await (const chunk of chunks) {
        if (chunk.error) {
          throw new Error(chunk.error?.message || 'Unknown error');
        }
        if (!chunk.choices || !Array.isArray(chunk.choices)) {
          console.warn('Invalid chunk format received:', chunk);
          continue;
        }
        if (chunk.choices.length === 0) {
          console.warn('Empty choices array in chunk:', chunk);
          continue;
        }

        const choice = chunk.choices[0];
        const addedContent = choice.delta.content;
        if (addedContent) {
          const lastContent = pendingMsg.content || '';
          pendingMsg = {
            ...pendingMsg,
            content: lastContent + addedContent,
          };
        }
        const reasoningContent =
          choice.delta.reasoning_content || choice.delta.reasoning;
        if (reasoningContent) {
          const lastContent = pendingMsg.reasoning_content || '';
          pendingMsg = {
            ...pendingMsg,
            reasoning_content: lastContent + reasoningContent,
          };
        }
        if (chunk.model) {
          pendingMsg.model = chunk.model;
        }
        const timings = chunk.timings;
        if (timings) {
          // only extract what's really needed, to save some space
          pendingMsg.timings = {
            prompt_n: timings.prompt_n,
            prompt_ms: timings.prompt_ms,
            predicted_n: timings.predicted_n,
            predicted_ms: timings.predicted_ms,
          };
        }
        setPending(convId, pendingMsg);
      }
    } catch (err) {
      setPending(convId, null);
      if ((err as Error).name === 'AbortError') {
        // user stopped the generation via stopGeneration() function
        // we can safely ignore this error
        if (isDev) console.debug('Generation aborted by user.');
      } else {
        console.error('Error during message generation:', err);
        toast.error(
          (err as Error)?.message ?? 'Unknown error during generation'
        );
        throw err; // rethrow
      }
    }

    if (pendingMsg.content !== null) {
      await StorageUtils.appendMsg(pendingMsg as Message, leafNodeId);
    }
    setPending(convId, null);
    onChunk(pendingId); // trigger scroll to bottom and switch to the last node
  },

  sendMessage: async (convId, leafNodeId, content, extra, onChunk) => {
    const { isGenerating, generateMessage } = get();

    if (isGenerating(convId) || content.trim().length === 0) return false;

    let currMsgId;
    try {
      // save user message
      currMsgId = Date.now();
      await StorageUtils.appendMsg(
        {
          id: currMsgId,
          convId,
          type: 'text',
          role: 'user',
          content,
          extra,
          parent: leafNodeId,
          children: [],
          timestamp: currMsgId,
        },
        leafNodeId
      );
    } catch (err) {
      toast.error('Cannot save message.');
      return false;
    }
    onChunk(currMsgId);

    try {
      await generateMessage(convId, currMsgId, onChunk);
      return true;
    } catch (error) {
      console.error('Message sending failed, consider rollback:', error);
      toast.error('Failed to get response from AI.');
      // TODO: rollback
    }
    return false;
  },

  stopGenerating: (convId) => {
    const { setPending, aborts } = get();
    setPending(convId, null);
    aborts[convId]?.abort();
  },

  replaceMessage: async (convId, msg, content, onChunk) => {
    const { isGenerating } = get();

    if (isGenerating(convId)) return;

    if (content == null) {
      onChunk(msg.parent);
      return;
    }

    const now = Date.now();
    const currMsgId = now;
    await StorageUtils.appendMsg(
      {
        id: currMsgId,
        convId,
        type: msg.type,
        role: msg.role,
        content,
        extra: msg.extra,
        parent: msg.parent,
        children: [],
        timestamp: now,
      },
      msg.parent
    );
    onChunk(currMsgId);
  },

  // if content is null, we remove last assistant message
  replaceMessageAndGenerate: async (convId, msg, content, extra, onChunk) => {
    const { isGenerating, generateMessage } = get();

    if (isGenerating(convId)) return;

    let parentNodeId = msg.parent;
    if (content !== null) {
      const now = Date.now();
      const currMsgId = now;
      await StorageUtils.appendMsg(
        {
          id: currMsgId,
          convId,
          type: msg.type,
          role: msg.role,
          content,
          extra,
          parent: parentNodeId,
          children: [],
          timestamp: now,
        },
        parentNodeId
      );
      parentNodeId = currMsgId;
    }
    onChunk(parentNodeId);

    await generateMessage(convId, parentNodeId, onChunk);
  },

  branchMessage: async (msg) => {
    const { isGenerating } = get();

    if (isGenerating(msg.convId)) return null;

    let conv = null;
    try {
      conv = await StorageUtils.branchConversation(msg.convId, msg.id);
    } catch (error) {
      console.error('Conversation branch failed:', error);
      toast.error('Failed to branch conversation.');
    }
    return conv;
  },
}));
