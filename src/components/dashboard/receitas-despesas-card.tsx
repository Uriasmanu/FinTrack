import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

interface ReceitasDespesasCardProps {
  mes: number;
  ano: number;
}

export function ReceitasDespesasCard({ mes, ano }: ReceitasDespesasCardProps) {
  const { obterReceitasMes, obterDespesasMes } = useFinanceStore();

  const receitasAtual = obterReceitasMes(mes);
  const despesasAtual = obterDespesasMes(mes);
  const saldoMes = receitasAtual - despesasAtual;

  const mostrarComparacao = mes > 0;
  const mesAnterior = mes === 0 ? 11 : mes - 1;

  const receitasAnterior = mostrarComparacao ? obterReceitasMes(mesAnterior) : 0;
  const despesasAnterior = mostrarComparacao ? obterDespesasMes(mesAnterior) : 0;
  const saldoMesAnterior = receitasAnterior - despesasAnterior;

  const variacaoReceitas =
    receitasAnterior !== 0
      ? ((receitasAtual - receitasAnterior) / receitasAnterior) * 100
      : 0;

  const variacaoDespesas =
    despesasAnterior !== 0
      ? ((despesasAtual - despesasAnterior) / despesasAnterior) * 100
      : 0;

  const variacaoSaldo =
    saldoMesAnterior !== 0
      ? ((saldoMes - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Receitas vs Despesas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-3 w-3 text-success" />
              </div>
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <div className="text-lg font-bold text-success">
              {formatarMoeda(receitasAtual)}
            </div>
            {mostrarComparacao && variacaoReceitas !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  variacaoReceitas >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {variacaoReceitas >= 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(variacaoReceitas).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10">
                <TrendingDown className="h-3 w-3 text-destructive" />
              </div>
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
            <div className="text-lg font-bold text-destructive">
              {formatarMoeda(despesasAtual)}
            </div>
            {mostrarComparacao && variacaoDespesas !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  variacaoDespesas <= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {variacaoDespesas <= 0 ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )}
                {Math.abs(variacaoDespesas).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${saldoMes >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                <div className={`h-3 w-3 rounded-full ${saldoMes >= 0 ? "bg-primary" : "bg-destructive"}`} />
              </div>
              <span className="text-xs text-muted-foreground">Saldo</span>
            </div>
            <div className={`text-lg font-bold ${saldoMes >= 0 ? "text-success" : "text-destructive"}`}>
              {saldoMes >= 0 ? "+" : ""}{formatarMoeda(saldoMes)}
            </div>
            {mostrarComparacao && variacaoSaldo !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  variacaoSaldo >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {variacaoSaldo >= 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(variacaoSaldo).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
