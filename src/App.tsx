import "./App.css";
import ScrollToTop from "./components/ScrollTop";
import { TauriProvider } from "./context/TauriContext";
import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./layouts/AppLayout";
import AppRoutes from "./routes/AppRoutes";
import StorageGate from "./features/storage/StorageGate";

function App() {
  return (
    <StorageGate><TauriProvider>
      <ToastProvider>
          <AppLayout>
            <ScrollToTop/>
            <AppRoutes />
          </AppLayout>
      </ToastProvider>
    </TauriProvider></StorageGate>
  )
}

export default App;
