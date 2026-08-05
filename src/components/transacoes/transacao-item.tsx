import { useState } from "react";
import { Pencil, Trash2, RefreshCw, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const { excluirTransacao, editarTransacao, dadosAno } = useFinanceStore();

  const categoria = dadosAno?.categorias.find(
    (c) => c.id === transacao.categoriaId
  );
  const subtipo = transacao.subtipoId
    ? dadosAno?.categorias.find((c) => c.id === transacao.subtipoId)
    : null;
  const conta = dadosAno?.contas.find((c) => c.id === transacao.contaId);

  function handleExcluir() {
    setDialogOpen(true);
  }

  function confirmarExclusao() {
    excluirTransacao(transacao.id);
    setDialogOpen(false);
  }

  function tipoRecorrenciaLabel(tipo: string) {
    switch (tipo) {
      case "recorrente":
        return { label: "Recorrente", variant: "default" as const };
      default:
        return { label: "Única", variant: "outline" as const };
    }
  }

  return (
    <div className="flex items-center justify-between py-3 px-2 border-b last:border-b-0 hover:bg-accent/50 transition-colors duration-150 ease-in-out rounded-lg">
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
            <Badge variant={tipoRecorrenciaLabel(transacao.tipoRecorrencia).variant} className="text-xs">
              {tipoRecorrenciaLabel(transacao.tipoRecorrencia).label}
            </Badge>
            {transacao.confirmada && (
              <Badge variant="success" className="text-xs">
                <Check className="mr-1 h-3 w-3" />
                Efetivada
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
            {subtipo && (
              <>
                <span>·</span>
                <span style={{ color: subtipo.cor }}>{subtipo.nome}</span>
              </>
            )}
            {conta && (
              <>
                <span>·</span>
                <span>{conta.banco}</span>
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
            <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none transition-colors duration-200 ease-in-out">
              ⋮
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!transacao.confirmada && (
              <DropdownMenuItem onClick={() => editarTransacao(transacao.id, { confirmada: true })}>
                <Check className="mr-2 h-4 w-4" />
                Efetivar
              </DropdownMenuItem>
            )}
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

      <DeleteConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={confirmarExclusao}
        title="Excluir transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
