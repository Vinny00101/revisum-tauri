import "./App.css";
import { TauriProvider } from "./context/TauriContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <TauriProvider>
      <div>
        <AppRoutes/>
      </div>
    </TauriProvider>
  )
}

export default App;
