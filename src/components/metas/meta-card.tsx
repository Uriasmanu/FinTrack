import { useState } from "react";
import { Pencil, Trash2, Power, PowerOff, Target, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda, formatarPrazo } from "@/lib/calculos";
import type { Meta } from "@/types";

interface MetaCardProps {
  meta: Meta;
  percentualReceita?: number | null;
  valorGastoMes?: number | null;
  extrapolou?: boolean | null;
  breakdown?: { nome: string; valor: number }[];
  valorAtualCalculado?: number | null;
  onEditar: (id: string, overrides?: { valorAlvo?: number; meses?: number }) => void;
}

export function MetaCard({ meta, percentualReceita, valorGastoMes, extrapolou, breakdown, valorAtualCalculado, onEditar }: MetaCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { editarMeta, excluirMeta } = useFinanceStore();

  const percentual = meta.valorAlvo > 0
    ? Math.min(((valorAtualCalculado ?? meta.valorAtual) / meta.valorAlvo) * 100, 100)
    : 0;

  const statusLabel = {
    em_andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };

  const statusVariant = {
    em_andamento: "default",
    concluida: "success",
    cancelada: "destructive",
  } as const;

  function handleExcluir() {
    setDialogOpen(true);
  }

  function confirmarExclusao() {
    excluirMeta(meta.id);
    setDialogOpen(false);
  }

  function handleToggleAtivo() {
    editarMeta(meta.id, { ativo: !meta.ativo });
  }

  const progressColor = percentual >= 100
    ? "bg-success"
    : percentual >= 50
    ? "bg-primary"
    : "bg-warning";

  return (
    <div className={`p-4 border rounded-xl space-y-3 bg-card hover:shadow-md transition-all duration-200 ease-in-out ${!meta.ativo ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium">{meta.nome}</h3>
          <Badge variant={statusVariant[meta.status]}>
            {statusLabel[meta.status]}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none transition-colors duration-200 ease-in-out">
              ⋮
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditar(meta.id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleAtivo}>
              {meta.ativo ? (
                <>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Desabilitar
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Habilitar
                </>
              )}
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
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">
            {formatarMoeda(valorAtualCalculado ?? meta.valorAtual)} / {formatarMoeda(meta.valorAlvo)}
          </span>
        </div>
        <div className="relative">
          <Progress value={percentual} className="h-2" />
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {percentual.toFixed(1)}%
        </p>
      </div>

      {percentualReceita != null ? (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Meta mensal</span>
          <span className="font-medium">{percentualReceita}% da receita</span>
        </div>
      ) : (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Prazo</span>
          <span className="font-medium">{formatarPrazo(meta.meses)}</span>
        </div>
      )}

      {valorGastoMes != null && extrapolou != null && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gasto no mês</span>
          <span className={`font-medium ${extrapolou ? "text-destructive" : ""}`}>
            {formatarMoeda(valorGastoMes)}
          </span>
        </div>
      )}

      {extrapolou === true && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Extrapolou o limite de {formatarMoeda(meta.valorAlvo)}</span>
        </div>
      )}

      {meta.parcelaMensal > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Parcela mensal</span>
          <span className="font-medium">{formatarMoeda(meta.parcelaMensal)}</span>
        </div>
      )}

      {breakdown && breakdown.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Base do cálculo</span>
          <div className="flex flex-wrap gap-1">
            {breakdown.map((item) => (
              <Badge key={item.nome} variant="secondary" className="text-xs font-normal">
                {item.nome}: {formatarMoeda(item.valor)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={confirmarExclusao}
        title="Excluir meta"
        description="Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
