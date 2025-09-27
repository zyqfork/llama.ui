import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import { Conversation, PendingMessage } from '../types';

// Create a separate context for pending messages to avoid re-renders
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
  const [pendingMessages, setPendingMessages] = useReducer(
    (
      state: Record<string, PendingMessage>,
      action: {
        type: 'SET' | 'REMOVE';
        convId: string;
        pendingMsg?: PendingMessage;
      }
    ) => {
      switch (action.type) {
        case 'SET':
          return {
            ...state,
            [action.convId]: action.pendingMsg!,
          };
        case 'REMOVE': {
          const newState = { ...state };
          delete newState[action.convId];
          return newState;
        }
        default:
          return state;
      }
    },
    {}
  );

  const setPending = useCallback(
    (convId: string, pendingMsg: PendingMessage | null) => {
      if (!pendingMsg) {
        setPendingMessages({ type: 'REMOVE', convId });
      } else {
        setPendingMessages({ type: 'SET', convId, pendingMsg });
      }
    },
    []
  );

  const isGenerating = useCallback(
    (convId: string) => !!pendingMessages[convId],
    [pendingMessages]
  );

  return (
    <PendingMessagesContext.Provider
      value={{ pendingMessages, setPending, isGenerating }}
    >
      {children}
    </PendingMessagesContext.Provider>
  );
};

export const usePendingMessages = () => {
  const { pendingMessages, isGenerating } = useContext(PendingMessagesContext);
  return { pendingMessages, isGenerating };
};
