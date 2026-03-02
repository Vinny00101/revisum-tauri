import "./App.css";
import ScrollToTop from "./components/ScrollTop";
import { TauriProvider } from "./context/TauriContext";
import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./layouts/AppLayout";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <TauriProvider>
      <ToastProvider>
          <AppLayout>
            <ScrollToTop/>
            <AppRoutes />
          </AppLayout>
      </ToastProvider>
    </TauriProvider>
  )
}

export default App;
