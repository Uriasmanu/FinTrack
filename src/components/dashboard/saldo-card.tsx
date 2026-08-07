import { ArrowUp, ArrowDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

interface SaldoCardProps {
  mes: number;
  ano: number;
}

export function SaldoCard({ mes, ano }: SaldoCardProps) {
  const { obterSaldoInicialContas, dados } =
    useFinanceStore();

  const mesAnterior = mes === 0 ? 11 : mes - 1;

  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  const saldoInicialContas = obterSaldoInicialContas();

  const transacoesAteHoje = (dados?.transacoes ?? [])
    .filter((t) => t.confirmada && t.data <= hojeStr)
    .reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0);

  const saldoHoje = saldoInicialContas + transacoesAteHoje;

  const transacoesAteMesAnterior = (dados?.transacoes ?? [])
    .filter((t) => {
      if (!t.confirmada) return false;
      const dataTransacao = new Date(t.data);
      return t.data <= hojeStr && (
        dataTransacao.getFullYear() < ano ||
        (dataTransacao.getFullYear() === ano && dataTransacao.getMonth() < mes)
      );
    })
    .reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0);

  const saldoMesAnterior = saldoInicialContas + transacoesAteMesAnterior;

  const variacao =
    saldoMesAnterior !== 0
      ? ((saldoHoje - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100
      : 0;

  const isPositivo = saldoHoje >= 0;
  const variacaoPositiva = variacao >= 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div
          className={`text-2xl font-bold ${
            isPositivo ? "text-success" : "text-destructive"
          }`}
        >
          {isPositivo ? "+" : ""}
          {formatarMoeda(saldoHoje)}
        </div>
        {variacao !== 0 && (
          <div
            className={`mt-1 flex items-center gap-1 text-xs ${
              variacaoPositiva ? "text-success" : "text-destructive"
            }`}
          >
            {variacaoPositiva ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(variacao).toFixed(1)}%
            <span className="text-muted-foreground ml-1">
              {variacaoPositiva ? "Aumento" : "Redução"} vs mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
