import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { calcularIndicadoresFii } from "@/lib/calculos-fii";
import { FiiHistoricoOperacoes } from "./fii-historico-operacoes";
import { FiiHistoricoDividendos } from "./fii-historico-dividendos";
import { FiiPrecoTetoCalc } from "./fii-preco-teto-calc";
import type { AtivoFii } from "@/types";

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

interface FiiDetalhesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ativo: AtivoFii;
}

export function FiiDetalhes({ open, onOpenChange, ativo }: FiiDetalhesProps) {
  const { dados } = useFinanceStore();
  const [aba, setAba] = useState<"indicadores" | "operacoes" | "dividendos" | "precoTeto">("indicadores");

  const dividendos = dados?.dividendosFii?.filter((d) => d.ativoFiiId === ativo.id) ?? [];
  const operacoes = dados?.operacoesFii?.filter((o) => o.ativoFiiId === ativo.id) ?? [];

  const indicadores = useMemo(
    () => calcularIndicadoresFii(ativo, dados?.dividendosFii ?? []),
    [ativo, dados?.dividendosFii]
  );

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarPercentual = (v: number) => `${v.toFixed(2)}%`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{ativo.ticker}</DialogTitle>
            <Badge className={statusColors[indicadores.statusPreco]} variant="secondary">
              {statusLabels[indicadores.statusPreco]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{ativo.nome}</p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Preço Mercado</p>
            <p className="font-bold">{formatarMoeda(ativo.precoAtualMercado)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">P/VP</p>
            <p className="font-bold">{indicadores.pVp.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Preço Teto</p>
            <p className="font-bold">{formatarMoeda(indicadores.precoTeto)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">DY Anual</p>
            <p className="font-bold text-success">{formatarPercentual(indicadores.dyAnual)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">YoC</p>
            <p className="font-bold">{formatarPercentual(indicadores.yieldOnCost)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lucro/Prejuízo</p>
            <p className={`font-bold ${indicadores.lucroPrejuizoValor >= 0 ? "text-success" : "text-destructive"}`}>
              {indicadores.lucroPrejuizoValor >= 0 ? "+" : ""}
              {formatarMoeda(indicadores.lucroPrejuizoValor)} ({indicadores.lucroPrejuizoPercentual.toFixed(1)}%)
            </p>
          </div>
        </div>

        {indicadores.alertaVenda && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            P/VP acima de 1,20 — possível ponto de venda (ágio excessivo).
          </div>
        )}
        {indicadores.alertaGanhoNaoRecorrente && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-warning">
            O dividendo mais recente pode não ser recorrente (possível ganho atípico). Cheque o histórico antes de considerar no DY.
          </div>
        )}

        <div className="flex gap-1 bg-muted p-1 rounded-lg mt-2">
          {(["indicadores", "operacoes", "dividendos", "precoTeto"] as const).map((a) => (
            <Button
              key={a}
              variant={aba === a ? "default" : "ghost"}
              size="sm"
              onClick={() => setAba(a)}
              className="flex-1"
            >
              {a === "indicadores" && "Resumo"}
              {a === "operacoes" && "Operações"}
              {a === "dividendos" && "Dividendos"}
              {a === "precoTeto" && "Preço Teto"}
            </Button>
          ))}
        </div>

        <div className="mt-4">
          {aba === "indicadores" && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Preço Médio</p>
                  <p className="font-medium">{formatarMoeda(ativo.precoMedioCompra)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Cotas Atuais</p>
                  <p className="font-medium">{ativo.cotasAtuais}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Valor Patrimonial</p>
                  <p className="font-medium">{formatarMoeda(ativo.valorPatrimonialCota)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">DY Mensal</p>
                  <p className="font-medium">{formatarPercentual(indicadores.dyMensal)}</p>
                </div>
              </div>
            </div>
          )}

          {aba === "operacoes" && (
            <FiiHistoricoOperacoes operacoes={operacoes} />
          )}

          {aba === "dividendos" && (
            <FiiHistoricoDividendos dividendos={dividendos} />
          )}

          {aba === "precoTeto" && (
            <FiiPrecoTetoCalc
              ticker={ativo.ticker}
              dividendoAnualAtual={
                indicadores.yieldOnCost > 0
                  ? (indicadores.yieldOnCost / 100) * ativo.precoMedioCompra
                  : 0
              }
              precoAtualMercado={ativo.precoAtualMercado}
              taxaRetornoAtual={ativo.taxaRetornoDesejada}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
