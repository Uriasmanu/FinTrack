import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useFinanceStore } from "@/stores/useFinanceStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function obterTemaInicial(): "claro" | "escuro" {
  try {
    const chave = `fintrack_${new Date().getFullYear()}`;
    const dados = localStorage.getItem(chave);
    if (dados) {
      const parse = JSON.parse(dados);
      if (parse?.config?.tema === "escuro") return "escuro";
    }
  } catch {}
  return "claro";
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dadosAno, atualizarConfig } = useFinanceStore();
  const [dialogTemaAberto, setDialogTemaAberto] = useState(false);
  const [temaPendente, setTemaPendente] = useState<"claro" | "escuro">("claro");

  const tema = dadosAno?.config.tema ?? obterTemaInicial();

  useEffect(() => {
    const root = document.documentElement;
    if (tema === "escuro") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [tema]);

  const handleTemaChange = () => {
    const novoTema = tema === "claro" ? "escuro" : "claro";
    setTemaPendente(novoTema);
    setDialogTemaAberto(true);
  };

  const confirmarTema = () => {
    atualizarConfig({ tema: temaPendente });
    setDialogTemaAberto(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          tema={tema}
          onTemaChange={handleTemaChange}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <AlertDialog open={dialogTemaAberto} onOpenChange={setDialogTemaAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar tema</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja alterar o tema para <strong>{temaPendente === "escuro" ? "escuro" : "claro"}</strong>? Esta preferência será salva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarTema}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
