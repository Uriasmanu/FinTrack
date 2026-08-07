import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AtivoFii } from "@/types";
import { cn } from "@/lib/cn";

const tipoColors: Record<string, string> = {
  tijolo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  papel: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  fof: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  misto: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  fiagro: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  desenvolvimento: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
};

const tipoLabels: Record<string, string> = {
  tijolo: "Tijolo",
  papel: "Papel",
  fof: "FOF",
  misto: "Misto",
  fiagro: "Fiagro",
  desenvolvimento: "Desenvolvimento",
};

interface FiiCardProps {
  ativo: AtivoFii;
  temVinculos: boolean;
  onEditar: (ativo: AtivoFii) => void;
  onExcluir: (ativo: AtivoFii) => void;
}

export function FiiCard({ ativo, temVinculos, onEditar, onExcluir }: FiiCardProps) {
  return (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{ativo.ticker}</h3>
              <Badge
                className={cn("text-xs", tipoColors[ativo.tipo])}
                variant="secondary"
              >
                {tipoLabels[ativo.tipo]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {ativo.nome}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditar(ativo)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExcluir(ativo)}
                disabled={temVinculos}
                className={temVinculos ? "text-muted-foreground" : "text-destructive"}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {temVinculos ? "Possui vínculos" : "Excluir"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">VP/Cota</p>
            <p className="font-medium">
              {ativo.valorPatrimonialCota.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Retorno Desejado</p>
            <p className="font-medium">{ativo.taxaRetornoDesejada}%</p>
          </div>
        </div>

        {ativo.observacoes && (
          <p className="mt-2 text-xs text-muted-foreground truncate">
            {ativo.observacoes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
