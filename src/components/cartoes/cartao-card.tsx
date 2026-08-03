import { Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";
import type { Cartao } from "@/types";

interface CartaoCardProps {
  cartao: Cartao;
  onEditar: (id: string) => void;
}

export function CartaoCard({ cartao, onEditar }: CartaoCardProps) {
  const { excluirCartao, dadosAno } = useFinanceStore();

  const faturaAtual =
    dadosAno?.transacoes
      .filter((t) => t.cartaoId === cartao.id && t.tipo === "despesa")
      .reduce((acc, t) => acc + t.valor, 0) ?? 0;

  const percentualUtilizado = cartao.limite > 0
    ? (faturaAtual / cartao.limite) * 100
    : 0;

  const transacoesNoCartao = dadosAno?.transacoes.filter(
    (t) => t.cartaoId === cartao.id
  ).length ?? 0;

  function handleExcluir() {
    if (transacoesNoCartao > 0) {
      alert("Não é possível excluir um cartão com transações vinculadas.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este cartão?")) {
      excluirCartao(cartao.id);
    }
  }

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {cartao.bandeira.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium">{cartao.nome}</p>
            <p className="text-sm text-muted-foreground">{cartao.bandeira}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none">
              ⋮
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditar(cartao.id)}>
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

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Fatura atual</span>
          <span className="font-medium">{formatarMoeda(faturaAtual)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Limite</span>
          <span className="font-medium">{formatarMoeda(cartao.limite)}</span>
        </div>
        <Progress value={percentualUtilizado} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {percentualUtilizado.toFixed(1)}% utilizado
        </p>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Fechamento: dia {cartao.diaFechamento}</span>
        <span>Vencimento: dia {cartao.diaVencimento}</span>
      </div>
    </div>
  );
}
