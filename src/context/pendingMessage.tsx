import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import { Conversation, PendingMessage } from '../types';

enum PendingMessagesActionType {
  SET = 'SET',
  REMOVE = 'REMOVE',
}

interface SetDataAction {
  type: PendingMessagesActionType.SET;
  payload: { convId: string; pendingMsg: PendingMessage | null };
}
interface RemoveDataAction {
  type: PendingMessagesActionType.REMOVE;
  payload: { convId: string };
}
type PendingMessagesAction = SetDataAction | RemoveDataAction;

interface PendingMessagesState {
  pendingMessages: Record<Conversation['id'], PendingMessage>;
  pendingConversations: Conversation['id'][];
}

const initialState: PendingMessagesState = {
  pendingMessages: {},
  pendingConversations: [],
};

const pendingMessagesReducer = (
  state: PendingMessagesState,
  action: PendingMessagesAction
): PendingMessagesState => {
  switch (action.type) {
    case PendingMessagesActionType.SET:
      if (state.pendingConversations.includes(action.payload.convId)) {
        return {
          ...state,
          pendingMessages: {
            ...state.pendingMessages,
            [action.payload.convId]: action.payload.pendingMsg!,
          },
        };
      }

      return {
        ...state,
        pendingConversations: [
          ...state.pendingConversations,
          action.payload.convId,
        ],
        pendingMessages: {
          ...state.pendingMessages,
          [action.payload.convId]: action.payload.pendingMsg!,
        },
      };
    case PendingMessagesActionType.REMOVE: {
      const newPendingConversations = [...state.pendingConversations].filter(
        (convId) => convId !== action.payload.convId
      );
      const newPendingMessages = { ...state.pendingMessages };
      delete newPendingMessages[action.payload.convId];
      return {
        ...state,
        pendingConversations: newPendingConversations,
        pendingMessages: newPendingMessages,
      };
    }
    default:
      return state;
  }
};

interface PendingMessagesContextValue {
  pendingMessages: Record<Conversation['id'], PendingMessage>;
  setPending: (convId: string, pendingMsg: PendingMessage | null) => void;
  isGenerating: (convId: string) => boolean;
}
export const PendingMessagesContext =
  createContext<PendingMessagesContextValue>({
    pendingMessages: {},
    setPending: () => {},
    isGenerating: () => false,
  });

// Provider for pending messages state
export const PendingMessagesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(pendingMessagesReducer, initialState);

  const setPending = useCallback(
    (convId: string, pendingMsg: PendingMessage | null) => {
      if (!pendingMsg) {
        dispatch({
          type: PendingMessagesActionType.REMOVE,
          payload: { convId },
        });
      } else {
        dispatch({
          type: PendingMessagesActionType.SET,
          payload: { convId, pendingMsg },
        });
      }
    },
    []
  );

  const isGenerating = useCallback(
    (convId: string) => state.pendingConversations.includes(convId),
    [state.pendingConversations]
  );

  return (
    <PendingMessagesContext.Provider
      value={{ ...state, setPending, isGenerating }}
    >
      {children}
    </PendingMessagesContext.Provider>
  );
};

export const usePendingMessages = () => {
  const { pendingMessages, isGenerating } = useContext(PendingMessagesContext);
  return { pendingMessages, isGenerating };
};
