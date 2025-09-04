import { FC, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import ChatView from './components/ChatView';
import { Footer } from './components/Footer';
import Header from './components/Header';
import { ModalProvider } from './components/ModalProvider';
import SettingDialog from './components/SettingDialog';
import Sidebar from './components/Sidebar';
import { ToastPopup } from './components/ToastPopup';
import { useDebouncedCallback } from './components/useDebouncedCallback';
import { usePWAUpdatePrompt } from './components/usePWAUpdatePrompt';
import WelcomeScreen from './components/WelcomeScreen';
import { useAppStore } from './context/app.context';
import { useInferenceStore } from './context/inference.context';
import * as lang from './lang/en.json';

const DEBOUNCE_DELAY = 1000;
const TOAST_IDS = {
  PROVIDER_SETUP: 'provider-setup',
  PWA_UPDATE: 'pwa-update',
};

const App: FC = () => {
  const init = useAppStore((state) => state.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <ModalProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="flex flex-row drawer xl:drawer-open">
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/chat/:convId" element={<ChatView />} />
              <Route path="*" element={<WelcomeScreen />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </ModalProvider>
  );
};

const AppLayout: FC = () => {
  const config = useAppStore((state) => state.config);
  const showSettings = useAppStore((state) => state.showSettings);
  const setShowSettings = useAppStore((state) => state.setShowSettings);
  const models = useInferenceStore((state) => state.models);
  const { isNewVersion, handleUpdate } = usePWAUpdatePrompt();

  const checkModelsAndShowToast = useCallback(
    (showSettings: boolean, models: unknown[]) => {
      if (showSettings) return;
      if (Array.isArray(models) && models.length > 0) return;

      toast(
        (t) => {
          const isInitialSetup = config.baseUrl === '';
          const popupConfig = isInitialSetup
            ? lang.welcomePopup
            : lang.noModelsPopup;

          return (
            <ToastPopup
              t={t}
              onSubmit={() => setShowSettings(true)}
              title={popupConfig.title}
              description={popupConfig.description}
              submitBtn={popupConfig.submitBtnLabel}
              cancelBtn={popupConfig.cancelBtnLabel}
            />
          );
        },
        {
          id: TOAST_IDS.PROVIDER_SETUP,
          duration: config.baseUrl === '' ? Infinity : 10000,
          position: 'top-center',
        }
      );
    },
    [config.baseUrl, setShowSettings]
  );

  const delayedNoModels = useDebouncedCallback(
    checkModelsAndShowToast,
    DEBOUNCE_DELAY
  );

  // Handle PWA updates
  useEffect(() => {
    if (isNewVersion) {
      toast(
        (t) => (
          <ToastPopup
            t={t}
            onSubmit={handleUpdate}
            title={lang.newVersion.title}
            description={lang.newVersion.description}
            submitBtn={lang.newVersion.submitBtnLabel}
            cancelBtn={lang.newVersion.cancelBtnLabel}
          />
        ),
        {
          id: TOAST_IDS.PWA_UPDATE,
          duration: Infinity,
          position: 'top-center',
          icon: lang.newVersion.icon,
        }
      );
    }
  }, [isNewVersion, handleUpdate]);

  // Handle model checking
  useEffect(() => {
    delayedNoModels(showSettings, models);
  }, [showSettings, models, delayedNoModels]);

  return (
    <>
      <Sidebar />
      <div className="drawer-content flex flex-col w-full h-screen px-2 bg-base-300">
        <Header />
        <main
          className="grow flex flex-col overflow-auto bg-base-100 rounded-xl"
          id="main-scroll"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
      {showSettings && (
        <SettingDialog
          show={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      <Toaster />
    </>
  );
};

export default App;
