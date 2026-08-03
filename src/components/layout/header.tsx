import { useLocation } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/transacoes": "Transações",
  "/transacoes/nova": "Nova Transação",
  "/categorias": "Categorias",
  "/contas": "Contas",
  "/cartoes": "Cartões",
  "/graficos": "Gráficos",
  "/metas": "Metas",
  "/metas/nova": "Nova Meta",
  "/exportar": "Exportar",
  "/configuracoes": "Configurações",
};

interface HeaderProps {
  onMenuClick: () => void;
  tema: "claro" | "escuro";
  onTemaChange: () => void;
}

export function Header({ onMenuClick, tema, onTemaChange }: HeaderProps) {
  const location = useLocation();

  const getTitle = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    if (location.pathname.startsWith("/transacoes/")) {
      return "Editar Transação";
    }
    if (location.pathname.startsWith("/metas/")) {
      return "Editar Meta";
    }
    return "FinTrack";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTemaChange}
          title={tema === "claro" ? "Mudar para escuro" : "Mudar para claro"}
        >
          {tema === "claro" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
