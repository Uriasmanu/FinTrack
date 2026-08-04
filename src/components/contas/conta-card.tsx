import { useState } from "react";
import { Pencil, Trash2, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";
import type { Conta } from "@/types";

interface ContaCardProps {
  conta: Conta;
  onEditar: (id: string) => void;
}

export function ContaCard({ conta, onEditar }: ContaCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { excluirConta, dadosAno } = useFinanceStore();

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const saldoAtual =
    (conta.saldoInicial ?? 0) +
    (dadosAno?.transacoes
      .filter((t) => {
        if (t.contaId !== conta.id) return false;
        if (!t.confirmada) return false;
        const dataTransacao = new Date(t.data);
        return dataTransacao <= hoje;
      })
      .reduce((acc, t) => (t.tipo === "receita" ? acc + t.valor : acc - t.valor), 0) ?? 0);

  const saldoMes =
    (conta.saldoInicial ?? 0) +
    (dadosAno?.transacoes
      .filter((t) => {
        if (t.contaId !== conta.id) return false;
        const dataTransacao = new Date(t.data);
        return dataTransacao.getMonth() === mesAtual && dataTransacao.getFullYear() === anoAtual;
      })
      .reduce((acc, t) => (t.tipo === "receita" ? acc + t.valor : acc - t.valor), 0) ?? 0);

  const transacoesNaConta = dadosAno?.transacoes.filter(
    (t) => t.contaId === conta.id
  ).length ?? 0;

  function handleExcluir() {
    if (transacoesNaConta > 0) {
      alert("Não é possível excluir uma conta com transações vinculadas.");
      return;
    }
    setDialogOpen(true);
  }

  function confirmarExclusao() {
    excluirConta(conta.id);
    setDialogOpen(false);
  }

  const tipoLabel = {
    corrente: "Corrente",
    poupanca: "Poupança",
    investimento: "Investimento",
    ticket: "Ticket (Mercado)",
  };

  const tipoCor = {
    corrente: "bg-primary",
    poupanca: "bg-success",
    investimento: "bg-chart-3",
    ticket: "bg-warning",
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-card hover:shadow-md transition-all duration-200 ease-in-out">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${tipoCor[conta.tipo]} flex items-center justify-center`}>
          <Building2 className="h-5 w-5 text-white" />
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
          <p className="text-xs text-muted-foreground">Saldo hoje</p>
        </div>

        <div className="text-right">
          <p
            className={`text-sm font-medium ${
              saldoMes >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {formatarMoeda(saldoMes)}
          </p>
          <p className="text-xs text-muted-foreground">Saldo do mês</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none transition-colors duration-200 ease-in-out">
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

      <DeleteConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={confirmarExclusao}
        title="Excluir conta"
        description="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
