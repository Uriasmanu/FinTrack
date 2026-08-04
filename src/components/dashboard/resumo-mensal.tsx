import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

interface ResumoMensalProps {
  mes: number;
  ano: number;
}

export function ResumoMensal({ mes, ano }: ResumoMensalProps) {
  const { obterTransacoesMes, obterReceitasMes, obterDespesasMes } =
    useFinanceStore();

  const transacoes = obterTransacoesMes(mes);
  const receitas = obterReceitasMes(mes);
  const despesas = obterDespesasMes(mes);

  const hoje = new Date();
  const isMesAtual = mes === hoje.getMonth() && ano === hoje.getFullYear();
  const diasPassados = isMesAtual ? hoje.getDate() : new Date(ano, mes + 1, 0).getDate();

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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-sm font-medium text-muted-foreground">Resumo Mensal</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
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
