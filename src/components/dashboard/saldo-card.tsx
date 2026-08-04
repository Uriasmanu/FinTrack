import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

interface SaldoCardProps {
  mes: number;
  ano: number;
}

export function SaldoCard({ mes, ano }: SaldoCardProps) {
  const { obterReceitasMes, obterDespesasMes, obterSaldoInicialContas, obterSaldoAtualSemTicket, dadosAno } =
    useFinanceStore();

  const mesAnterior = mes === 0 ? 11 : mes - 1;

  const receitasMesAtual = obterReceitasMes(mes);
  const receitasMesAnterior = obterReceitasMes(mesAnterior);
  const despesasMesAtual = obterDespesasMes(mes);
  const despesasMesAnterior = obterDespesasMes(mesAnterior);

  const saldoInicialContas = obterSaldoInicialContas();

  const transacoesAnteriores = (dadosAno?.transacoes ?? [])
    .filter((t) => {
      const dataTransacao = new Date(t.data);
      return dataTransacao.getFullYear() < ano || 
             (dataTransacao.getFullYear() === ano && dataTransacao.getMonth() < mes);
    })
    .reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0);

  const saldoMesAtual = saldoInicialContas + transacoesAnteriores + receitasMesAtual - despesasMesAtual;
  const saldoMesAnterior = saldoInicialContas + 
    (dadosAno?.transacoes ?? [])
      .filter((t) => {
        const dataTransacao = new Date(t.data);
        const mesRef = mesAnterior;
        const anoRef = mesAnterior === 11 ? ano - 1 : ano;
        return dataTransacao.getFullYear() < anoRef || 
               (dataTransacao.getFullYear() === anoRef && dataTransacao.getMonth() < mesRef);
      })
      .reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0) +
    receitasMesAnterior - despesasMesAnterior;

  const variacao =
    saldoMesAnterior !== 0
      ? ((saldoMesAtual - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100
      : 0;

  const isPositivo = saldoMesAtual >= 0;
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
          {formatarMoeda(saldoMesAtual)}
        </div>
        <p className="text-xs text-muted-foreground">
          {variacaoPositiva ? "Aumento" : "Redução"} em relação ao mês anterior
        </p>
      </CardContent>
    </Card>
  );
}
