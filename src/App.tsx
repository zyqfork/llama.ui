import { Toaster } from 'react-hot-toast';
import { HashRouter, Outlet, Route, Routes } from 'react-router';
import ChatScreen from './components/ChatScreen';
import Header from './components/Header';
import { ModalProvider } from './components/ModalProvider';
import { Footer } from './components/Footer';
import SettingDialog from './components/SettingDialog';
import Sidebar from './components/Sidebar';
import { AppContextProvider, useAppContext } from './utils/app.context';

function App() {
  return (
    <ModalProvider>
      <HashRouter>
        <div className="flex flex-row drawer lg:drawer-open">
          <AppContextProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/chat/:convId" element={<ChatScreen />} />
                <Route path="*" element={<ChatScreen />} />
              </Route>
            </Routes>
          </AppContextProvider>
        </div>
      </HashRouter>
    </ModalProvider>
  );
}

function AppLayout() {
  const { showSettings, setShowSettings } = useAppContext();
  return (
    <>
      <Sidebar />
      <div className="drawer-content flex flex-col w-full h-screen px-2 bg-base-200">
        <Header />
        <main
          className="grow flex flex-col p-2 overflow-auto bg-base-100 rounded-xl"
          id="main-scroll"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
      <SettingDialog
        show={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <Toaster />
    </>
  );
}

export default App;
