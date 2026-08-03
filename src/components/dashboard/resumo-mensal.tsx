import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

export function ResumoMensal() {
  const { obterTransacoesMes, obterReceitasMes, obterDespesasMes } =
    useFinanceStore();

  const mesAtual = new Date().getMonth();
  const diasPassados = new Date().getDate();

  const transacoes = obterTransacoesMes(mesAtual);
  const receitas = obterReceitasMes(mesAtual);
  const despesas = obterDespesasMes(mesAtual);

  const quantidadeTransacoes = transacoes.length;

  const mediaGastoDiario =
    diasPassados > 0 ? despesas / diasPassados : 0;

  const maiorTransacao =
    transacoes.length > 0
      ? transacoes.reduce((maior, t) => (t.valor > maior.valor ? t : maior))
      : null;

  const percentualEconomia =
    receitas > 0 ? ((receitas - despesas) / receitas) * 100 : 0;

  const economiaIcone =
    percentualEconomia > 0
      ? TrendingUp
      : percentualEconomia < 0
      ? TrendingDown
      : Minus;

  const EconomiaIcon = economiaIcone;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resumo Mensal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Transações no mês
          </span>
          <span className="font-medium">{quantidadeTransacoes}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Média gasto/dia
          </span>
          <span className="font-medium">{formatarMoeda(mediaGastoDiario)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Maior transação
          </span>
          <span className="font-medium">
            {maiorTransacao ? formatarMoeda(maiorTransacao.valor) : "R$ 0,00"}
          </span>
        </div>
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-sm text-muted-foreground">
            Percentual de economia
          </span>
          <div className="flex items-center gap-2">
            <EconomiaIcon
              className={`h-4 w-4 ${
                percentualEconomia > 0
                  ? "text-success"
                  : percentualEconomia < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            />
            <span
              className={`font-medium ${
                percentualEconomia > 0
                  ? "text-success"
                  : percentualEconomia < 0
                  ? "text-destructive"
                  : ""
              }`}
            >
              {percentualEconomia.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
