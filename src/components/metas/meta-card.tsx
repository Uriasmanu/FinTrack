import { useState } from "react";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";
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
  onEditar: (id: string) => void;
}

export function MetaCard({ meta, onEditar }: MetaCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { editarMeta, excluirMeta } = useFinanceStore();

  const percentual = meta.valorAlvo > 0
    ? Math.min((meta.valorAtual / meta.valorAlvo) * 100, 100)
    : 0;

  const statusLabel = {
    em_andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };

  const statusVariant = {
    em_andamento: "default",
    concluida: "default",
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

  return (
    <div className={`p-4 border rounded-lg space-y-3 ${!meta.ativo ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{meta.nome}</h3>
          <Badge variant={statusVariant[meta.status]}>
            {statusLabel[meta.status]}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none">
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
            {formatarMoeda(meta.valorAtual)} / {formatarMoeda(meta.valorAlvo)}
          </span>
        </div>
        <Progress value={percentual} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {percentual.toFixed(1)}%
        </p>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Prazo</span>
        <span className="font-medium">{formatarPrazo(meta.meses)}</span>
      </div>

      {meta.parcelaMensal > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Parcela mensal</span>
          <span className="font-medium">{formatarMoeda(meta.parcelaMensal)}</span>
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
