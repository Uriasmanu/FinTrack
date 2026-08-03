import { Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";
import type { Conta } from "@/types";

interface ContaCardProps {
  conta: Conta;
  onEditar: (id: string) => void;
}

export function ContaCard({ conta, onEditar }: ContaCardProps) {
  const { excluirConta, dadosAno } = useFinanceStore();

  const saldoAtual =
    (conta.saldoInicial ?? 0) +
    (dadosAno?.transacoes
      .filter((t) => t.contaId === conta.id)
      .reduce((acc, t) => (t.tipo === "receita" ? acc + t.valor : acc - t.valor), 0) ?? 0);

  const transacoesNaConta = dadosAno?.transacoes.filter(
    (t) => t.contaId === conta.id
  ).length ?? 0;

  function handleExcluir() {
    if (transacoesNaConta > 0) {
      alert("Não é possível excluir uma conta com transações vinculadas.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      excluirConta(conta.id);
    }
  }

  const tipoLabel = {
    corrente: "Corrente",
    poupanca: "Poupança",
    investimento: "Investimento",
    ticket: "Ticket (Mercado)",
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">
            {conta.banco.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium">{conta.banco}</p>
          <p className="text-sm text-muted-foreground">
            {tipoLabel[conta.tipo]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p
            className={`font-bold ${
              saldoAtual >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {formatarMoeda(saldoAtual)}
          </p>
          <p className="text-xs text-muted-foreground">Saldo atual</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none">
              ⋮
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditar(conta.id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExcluir}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
