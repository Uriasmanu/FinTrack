import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Dashboard } from "@/pages/Dashboard";
import { Transacoes } from "@/pages/Transacoes";
import { Categorias } from "@/pages/Categorias";
import { Contas } from "@/pages/Contas";
import { Cartoes } from "@/pages/Cartoes";
import { Graficos } from "@/pages/Graficos";
import { Metas } from "@/pages/Metas";
import { Exportar } from "@/pages/Exportar";
import { Configuracoes } from "@/pages/Configuracoes";
import { useFinanceStore } from "@/stores/useFinanceStore";

function App() {
  const { inicializar } = useFinanceStore();

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/contas" element={<Contas />} />
          <Route path="/cartoes" element={<Cartoes />} />
          <Route path="/graficos" element={<Graficos />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/exportar" element={<Exportar />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
