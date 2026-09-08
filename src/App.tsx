import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { DetalheColetiva, DetalheUnidade } from "./pages/Detalhe";
import { Home } from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-svh bg-zinc-950 text-zinc-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/unidades/:id" element={<DetalheUnidade />} />
            <Route path="/coletivas/:id" element={<DetalheColetiva />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
