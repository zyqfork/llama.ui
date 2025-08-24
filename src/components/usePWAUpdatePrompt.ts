import { useRegisterSW } from 'virtual:pwa-register/react';

export function usePWAUpdatePrompt() {
  const {
    needRefresh: [isNewVersion, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, swRegistration) {
      console.debug('SW Registered:', swUrl, swRegistration);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
    onNeedRefresh() {
      console.debug('App is need to update.');
    },
    onOfflineReady() {
      console.debug('App is ready for offline use.');
    },
  });

  const handleUpdate = async () => {
    await updateServiceWorker(true);
  };

  const handleSkip = () => {
    setNeedRefresh(false);
  };

  return { isNewVersion, handleUpdate, handleSkip };
}
