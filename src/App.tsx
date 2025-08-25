import { FC } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import ChatScreen from './components/ChatScreen';
import { Footer } from './components/Footer';
import Header from './components/Header';
import { ModalProvider } from './components/ModalProvider';
import SettingDialog from './components/SettingDialog';
import Sidebar from './components/Sidebar';
import { ToastPopup } from './components/ToastPopup';
import { useDebouncedCallback } from './components/useDebouncedCallback';
import { usePWAUpdatePrompt } from './components/usePWAUpdatePrompt';
import { AppContextProvider, useAppContext } from './context/app.context';
import {
  InferenceContextProvider,
  useInferenceContext,
} from './context/inference.context';
import { MessageContextProvider } from './context/message.context';
import * as lang from './lang/en.json';

const App: FC = () => {
  return (
    <ModalProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="flex flex-row drawer xl:drawer-open">
          <AppContextProvider>
            <InferenceContextProvider>
              <MessageContextProvider>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/chat/:convId" element={<ChatScreen />} />
                    <Route path="*" element={<ChatScreen />} />
                  </Route>
                </Routes>
              </MessageContextProvider>
            </InferenceContextProvider>
          </AppContextProvider>
        </div>
      </BrowserRouter>
    </ModalProvider>
  );
};

const AppLayout: FC = () => {
  const { config, showSettings, setShowSettings } = useAppContext();
  const { models } = useInferenceContext();
  const { isNewVersion, handleUpdate } = usePWAUpdatePrompt();

  const delayedNoModels = useDebouncedCallback(
    (showSettings: boolean, models: unknown[]) => {
      if (showSettings) return;
      if (Array.isArray(models) && models.length > 0) {
        toast.dismiss('provider-setup');
        return;
      }

      toast(
        (t) => {
          // initial setup
          if (config.baseUrl === '') {
            return (
              <ToastPopup
                t={t}
                onSubmit={() => setShowSettings(true)}
                title={lang.welcomePopup.title}
                description={lang.welcomePopup.description}
                submitBtn={lang.welcomePopup.submitBtnLabel}
                cancelBtn={lang.welcomePopup.cancelBtnLabel}
              />
            );
          }
          // an issue with provider
          return (
            <ToastPopup
              t={t}
              onSubmit={() => setShowSettings(true)}
              title={lang.noModelsPopup.title}
              description={lang.noModelsPopup.description}
              submitBtn={lang.noModelsPopup.submitBtnLabel}
              cancelBtn={lang.noModelsPopup.cancelBtnLabel}
            />
          );
        },
        {
          id: 'provider-setup',
          duration: config.baseUrl === '' ? Infinity : 10000,
          position: 'top-center',
        }
      );
    },
    1000
  );

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
        id: 'pwa-update',
        duration: Infinity,
        position: 'top-center',
        icon: lang.newVersion.icon,
      }
    );
  }

  delayedNoModels(showSettings, models);

  return (
    <>
      <Sidebar />
      <div className="drawer-content flex flex-col w-full h-screen px-2 bg-base-300">
        <Header />
        <main
          className="grow flex flex-col p-2 overflow-auto bg-base-100 rounded-xl"
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
