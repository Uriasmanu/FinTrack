import { Pencil, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda, formatarData } from "@/lib/calculos";
import type { Transacao } from "@/types";

interface TransacaoItemProps {
  transacao: Transacao;
  saldoAcumulado: number;
  onEditar: (id: string) => void;
}

export function TransacaoItem({
  transacao,
  saldoAcumulado,
  onEditar,
}: TransacaoItemProps) {
  const { excluirTransacao, dadosAno } = useFinanceStore();

  const categoria = dadosAno?.categorias.find(
    (c) => c.id === transacao.categoriaId
  );
  const conta = dadosAno?.contas.find((c) => c.id === transacao.contaId);

  function handleExcluir() {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      excluirTransacao(transacao.id);
    }
  }

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            transacao.tipo === "receita"
              ? "bg-success/10"
              : "bg-destructive/10"
          }`}
        >
          {transacao.tipoRecorrencia === "recorrente" ? (
            <RefreshCw
              className={`h-4 w-4 ${
                transacao.tipo === "receita"
                  ? "text-success"
                  : "text-destructive"
              }`}
            />
          ) : (
            <span
              className={`text-xs font-medium ${
                transacao.tipo === "receita"
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {transacao.tipo === "receita" ? "R" : "D"}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{transacao.descricao}</p>
            {transacao.tipoRecorrencia === "parcelado" &&
              transacao.totalParcelas > 1 && (
                <Badge variant="outline" className="text-xs">
                  {transacao.parcelaAtual}/{transacao.totalParcelas}
                </Badge>
              )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatarData(transacao.data)}</span>
            {categoria && (
              <>
                <span>·</span>
                <span style={{ color: categoria.cor }}>{categoria.nome}</span>
              </>
            )}
            {conta && (
              <>
                <span>·</span>
                <span>{conta.nome}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`font-medium ${
            transacao.tipo === "receita" ? "text-success" : "text-destructive"
          }`}
        >
          {transacao.tipo === "receita" ? "+" : "-"}
          {formatarMoeda(transacao.valor)}
        </span>

        <span className="text-sm text-muted-foreground min-w-[100px] text-right">
          Saldo: {formatarMoeda(saldoAcumulado)}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none">
              ⋮
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditar(transacao.id)}>
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
