import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router';
import { useMessageStore } from '../context/message.context';
import StorageUtils from '../utils/storage';
import ChatScreen from './ChatScreen';

export default function ChatView() {
  const { convId } = useParams();
  const loadConversation = useMessageStore((state) => state.loadConversation);

  // handle change when the convId from URL is changed
  useEffect(() => {
    const handleConversationChange = async (changedConvId: string) => {
      if (changedConvId !== convId) return;
      loadConversation(changedConvId);
    };
    StorageUtils.onConversationChanged(handleConversationChange);
    loadConversation(convId ?? '');
    return () => {
      StorageUtils.offConversationChanged(handleConversationChange);
    };
  }, [convId, loadConversation]);

  if (!convId) return <Navigate to="/" replace />;
  return <ChatScreen currConvId={convId} />;
}
