import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { matchPath, useLocation, useNavigate } from 'react-router';
import { isDev } from '../config';
import { useInferenceContext } from '../context/inference.context';
import StorageUtils from '../utils/storage';
import {
  CanvasData,
  Conversation,
  Message,
  MessageExtra,
  PendingMessage,
  ViewingChat,
} from '../utils/types';

interface MessageContextValue {
  // canvas
  canvasData: CanvasData | null;
  setCanvasData: (data: CanvasData | null) => void;

  // conversations and messages
  viewingChat: ViewingChat | null;
  pendingMessages: Record<Conversation['id'], PendingMessage>;
  isGenerating: (convId: string) => boolean;
  sendMessage: (
    convId: string | null,
    leafNodeId: Message['id'] | null,
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
}

// this callback is used for scrolling to the bottom of the chat and switching to the last node
export type CallbackGeneratedChunk = (currLeafNodeId?: Message['id']) => void;

const MessageContext = createContext<MessageContextValue>({
  viewingChat: null,
  pendingMessages: {},
  isGenerating: () => false,
  sendMessage: async () => false,
  stopGenerating: () => {},
  replaceMessage: async () => {},
  replaceMessageAndGenerate: async () => {},
  canvasData: null,
  setCanvasData: () => {},
});

const getViewingChat = async (convId: string): Promise<ViewingChat | null> => {
  const conv = await StorageUtils.getOneConversation(convId);
  if (!conv) return null;
  return {
    conv: conv,
    // all messages from all branches, not filtered by last node
    messages: await StorageUtils.getMessages(convId),
  };
};

export const MessageContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const params = matchPath('/chat/:convId', pathname);
  const convId = params?.params?.convId;

  const [viewingChat, setViewingChat] = useState<ViewingChat | null>(null);
  const [pendingMessages, setPendingMessages] = useState<
    Record<Conversation['id'], PendingMessage>
  >({});
  const [aborts, setAborts] = useState<
    Record<Conversation['id'], AbortController>
  >({});
  const { api } = useInferenceContext();
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);

  // handle change when the convId from URL is changed
  useEffect(() => {
    // also reset the canvas data
    setCanvasData(null);
    const handleConversationChange = async (changedConvId: string) => {
      if (changedConvId !== convId) return;
      setViewingChat(await getViewingChat(changedConvId));
    };
    StorageUtils.onConversationChanged(handleConversationChange);
    getViewingChat(convId ?? '').then(setViewingChat);
    return () => {
      StorageUtils.offConversationChanged(handleConversationChange);
    };
  }, [convId]);

  const setPending = (convId: string, pendingMsg: PendingMessage | null) => {
    // if pendingMsg is null, remove the key from the object
    if (!pendingMsg) {
      setPendingMessages((prev) => {
        const newState = { ...prev };
        delete newState[convId];
        return newState;
      });
    } else {
      setPendingMessages((prev) => ({ ...prev, [convId]: pendingMsg }));
    }
  };

  const setAbort = (convId: string, controller: AbortController | null) => {
    if (!controller) {
      setAborts((prev) => {
        const newState = { ...prev };
        delete newState[convId];
        return newState;
      });
    } else {
      setAborts((prev) => ({ ...prev, [convId]: controller }));
    }
  };

  ////////////////////////////////////////////////////////////////////////
  // public functions

  const isGenerating = (convId: string) => !!pendingMessages[convId];

  const generateMessage = async (
    convId: string,
    leafNodeId: Message['id'],
    onChunk: CallbackGeneratedChunk
  ) => {
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
      const chunks = await api.v1ChatCompletions(
        currMessages,
        abortController.signal
      );
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

        const chunkChoice = chunk.choices[0];
        const addedContent = chunkChoice.delta.content;
        if (addedContent) {
          const lastContent = pendingMsg.content || '';
          pendingMsg = {
            ...pendingMsg,
            content: lastContent + addedContent,
          };
        }
        const reasoningContent =
          chunkChoice.delta.reasoning_content || chunkChoice.delta.reasoning;
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
        onChunk(); // don't need to switch node for pending message
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
  };

  const sendMessage = async (
    convId: string | null,
    leafNodeId: Message['id'] | null,
    content: string,
    extra: Message['extra'],
    onChunk: CallbackGeneratedChunk
  ): Promise<boolean> => {
    if (isGenerating(convId ?? '') || content.trim().length === 0) return false;

    if (convId === null || convId.length === 0 || leafNodeId === null) {
      const conv = await StorageUtils.createConversation(
        content.substring(0, 256)
      );
      convId = conv.id;
      leafNodeId = conv.currNode;
      // if user is creating a new conversation, redirect to the new conversation
      navigate(`/chat/${convId}`);
    }

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
  };

  const stopGenerating = (convId: string) => {
    setPending(convId, null);
    aborts[convId]?.abort();
  };

  const replaceMessage = async (
    convId: string,
    msg: Message,
    content: string | null,
    onChunk: CallbackGeneratedChunk
  ) => {
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
  };

  // if content is null, we remove last assistant message
  const replaceMessageAndGenerate = async (
    convId: string,
    msg: Message,
    content: string | null,
    extra: MessageExtra[] | undefined,
    onChunk: CallbackGeneratedChunk
  ) => {
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
  };

  return (
    <MessageContext.Provider
      value={{
        viewingChat,
        pendingMessages,
        isGenerating,
        sendMessage,
        stopGenerating,
        replaceMessage,
        replaceMessageAndGenerate,
        canvasData,
        setCanvasData,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error(
      'useMessageContext must be used within a MessageContextProvider'
    );
  }
  return context;
};
