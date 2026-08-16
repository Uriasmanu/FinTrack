import { useMemo } from "react";
import { MoreVertical, Pencil, Trash2, ArrowUpDown, Coins, Eye, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { calcularIndicadoresFii } from "@/lib/calculos-fii";
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

const statusColors: Record<string, string> = {
  desconto: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  justo: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  agio_moderado: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  agio_excessivo: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<string, string> = {
  desconto: "Desconto",
  justo: "Justo",
  agio_moderado: "Ágio Moderado",
  agio_excessivo: "Ágio Excessivo",
};

interface FiiCardProps {
  ativo: AtivoFii;
  temVinculos: boolean;
  onEditar: (ativo: AtivoFii) => void;
  onExcluir: (ativo: AtivoFii) => void;
  onOperacao: (ativo: AtivoFii) => void;
  onDividendo: (ativo: AtivoFii) => void;
  onDetalhes: (ativo: AtivoFii) => void;
}

export function FiiCard({
  ativo,
  temVinculos,
  onEditar,
  onExcluir,
  onOperacao,
  onDividendo,
  onDetalhes,
}: FiiCardProps) {
  const { dados } = useFinanceStore();

  const indicadores = useMemo(
    () => calcularIndicadoresFii(ativo, dados?.dividendosFii ?? []),
    [ativo, dados?.dividendosFii]
  );

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarPercentual = (v: number) => `${v.toFixed(2)}%`;

  const valorPosicao = ativo.cotasAtuais * ativo.precoAtualMercado;

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg">{ativo.ticker}</h3>
              <Badge className={cn("text-xs", tipoColors[ativo.tipo])} variant="secondary">
                {tipoLabels[ativo.tipo]}
              </Badge>
              <Badge className={cn("text-xs", statusColors[indicadores.statusPreco])} variant="secondary">
                {statusLabels[indicadores.statusPreco]}
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
              <DropdownMenuItem onClick={() => onDetalhes(ativo)}>
                <Eye className="mr-2 h-4 w-4" />
                Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOperacao(ativo)}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Registrar Operação
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDividendo(ativo)}>
                <Coins className="mr-2 h-4 w-4" />
                Registrar Dividendo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

        {indicadores.alertaVenda && (
          <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            Ágio excessivo — possível ponto de venda
          </div>
        )}
        {indicadores.alertaGanhoNaoRecorrente && (
          <div className="mt-1 flex items-center gap-1 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            Dividendo pode não ser recorrente
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Preço Médio</p>
            <p className="font-medium">{formatarMoeda(ativo.precoMedioCompra)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Preço Mercado</p>
            <p className="font-medium">{formatarMoeda(ativo.precoAtualMercado)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">P/VP</p>
            <p className="font-medium">{indicadores.pVp.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">DY Mensal</p>
            <p className="font-medium text-success">{formatarPercentual(indicadores.dyMensal)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">DY Anual</p>
            <p className="font-medium text-success">{formatarPercentual(indicadores.dyAnual)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">YoC</p>
            <p className="font-medium">{formatarPercentual(indicadores.yieldOnCost)}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm border-t pt-2">
          <div>
            <p className="text-muted-foreground text-xs">Preço Teto</p>
            <p className={cn(
              "font-medium",
              ativo.precoAtualMercado <= indicadores.precoTeto ? "text-success" : "text-destructive"
            )}>
              {formatarMoeda(indicadores.precoTeto)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Cotas</p>
            <p className="font-medium">{ativo.cotasAtuais}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Valor Posição</p>
            <p className="font-bold">{formatarMoeda(valorPosicao)}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <div>
            {indicadores.lucroPrejuizoValor >= 0 ? (
              <span className="flex items-center gap-1 text-success text-xs">
                <TrendingUp className="h-3 w-3" />
                +{formatarMoeda(indicadores.lucroPrejuizoValor)} ({indicadores.lucroPrejuizoPercentual.toFixed(1)}%)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-destructive text-xs">
                <TrendingDown className="h-3 w-3" />
                {formatarMoeda(indicadores.lucroPrejuizoValor)} ({indicadores.lucroPrejuizoPercentual.toFixed(1)}%)
              </span>
            )}
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
