import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

export function SaldoCard() {
  const { obterSaldoAtual, obterReceitasMes, obterDespesasMes } =
    useFinanceStore();

  const mesAtual = new Date().getMonth();
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;

  const saldo = obterSaldoAtual();
  const receitasMesAtual = obterReceitasMes(mesAtual);
  const receitasMesAnterior = obterReceitasMes(mesAnterior);
  const despesasMesAtual = obterDespesasMes(mesAtual);
  const despesasMesAnterior = obterDespesasMes(mesAnterior);

  const saldoMesAtual = receitasMesAtual - despesasMesAtual;
  const saldoMesAnterior = receitasMesAnterior - despesasMesAnterior;

  const variacao =
    saldoMesAnterior !== 0
      ? ((saldoMesAtual - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100
      : 0;

  const isPositivo = saldo >= 0;
  const variacaoPositiva = variacao >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
        {variacao !== 0 && (
          <div
            className={`flex items-center gap-1 text-xs ${
              variacaoPositiva ? "text-success" : "text-destructive"
            }`}
          >
            {variacaoPositiva ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(variacao).toFixed(1)}%
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${
            isPositivo ? "text-success" : "text-destructive"
          }`}
        >
          {isPositivo ? "+" : ""}
          {formatarMoeda(saldo)}
        </div>
        <p className="text-xs text-muted-foreground">
          {variacaoPositiva ? "Aumento" : "Redução"} em relação ao mês anterior
        </p>
      </CardContent>
    </Card>
  );
}
