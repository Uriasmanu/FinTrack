import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dadosAno, atualizarConfig } = useFinanceStore();

  const tema = dadosAno?.config.tema ?? "claro";

  useEffect(() => {
    const root = document.documentElement;
    if (tema === "escuro") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("fintrack-tema", tema);
  }, [tema]);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("fintrack-tema") as "claro" | "escuro" | null;
    if (temaSalvo && temaSalvo !== tema) {
      atualizarConfig({ tema: temaSalvo });
    }
  }, []);

  const handleTemaChange = () => {
    const novoTema = tema === "claro" ? "escuro" : "claro";
    atualizarConfig({ tema: novoTema });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          tema={tema}
          onTemaChange={handleTemaChange}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
