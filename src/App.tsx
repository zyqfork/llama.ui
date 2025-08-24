import { FC } from 'react';
import { Toast, Toaster, toast } from 'react-hot-toast';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import ChatScreen from './components/ChatScreen';
import { Footer } from './components/Footer';
import Header from './components/Header';
import { ModalProvider } from './components/ModalProvider';
import SettingDialog from './components/SettingDialog';
import Sidebar from './components/Sidebar';
import { usePWAUpdatePrompt } from './components/usePWAUpdatePrompt';
import { AppContextProvider, useAppContext } from './context/app.context';
import { InferenceContextProvider } from './context/inference.context';
import { MessageContextProvider } from './context/message.context';
import * as lang from './lang/en.json';

const App: FC = () => {
  return (
    <ModalProvider>
      <BrowserRouter>
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
  const { showSettings, setShowSettings } = useAppContext();
  const { isNewVersion, handleUpdate } = usePWAUpdatePrompt();

  if (isNewVersion) {
    toast((t) => <NewVersionPopup t={t} handleUpdate={handleUpdate} />, {
      id: 'pwa-update',
      duration: Infinity,
      position: 'top-center',
    });
  }

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

const NewVersionPopup: FC<{ t: Toast; handleUpdate: () => Promise<void> }> = ({
  t,
  handleUpdate,
}) => (
  <div className="flex flex-col gap-2">
    <p className="font-medium">{lang.newVersion.title}</p>
    <p className="text-sm">{lang.newVersion.description}</p>
    <div className="flex justify-center gap-2 mt-1">
      <button
        onClick={() => {
          handleUpdate();
          toast.dismiss(t.id);
        }}
        className="btn btn-neutral btn-sm"
      >
        {lang.newVersion.updateBtnLabel}
      </button>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="btn btn-ghost btn-sm"
      >
        {lang.newVersion.skipBtnLabel}
      </button>
    </div>
  </div>
);

export default App;
