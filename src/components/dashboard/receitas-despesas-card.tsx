import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";
import { CATEGORIA_GUARDAR } from "@/lib/categorias-ids";

interface ReceitasDespesasCardProps {
  mes: number;
  ano: number;
}

export function ReceitasDespesasCard({ mes, ano }: ReceitasDespesasCardProps) {
  const { dados } = useFinanceStore();

  const transacoesMes = (dados?.transacoes ?? []).filter((t) => {
    const data = new Date(t.data);
    return data.getMonth() === mes && data.getFullYear() === ano;
  });

  const receitasAtual = transacoesMes
    .filter((t) => t.tipo === "receita")
    .reduce((total, t) => total + t.valor, 0);

  const despesasAtual = transacoesMes
    .filter((t) => t.tipo === "despesa")
    .reduce((total, t) => total + t.valor, 0);

  const guardarMes = transacoesMes
    .filter((t) => t.categoriaId === CATEGORIA_GUARDAR)
    .reduce((total, t) => total + t.valor, 0);

  const percentualGuardado = receitasAtual > 0 ? (guardarMes / receitasAtual) * 100 : 0;

  const mostrarComparacao = mes > 0;
  const mesAnterior = mes === 0 ? 11 : mes - 1;

  const transacoesAnterior = (dados?.transacoes ?? []).filter((t) => {
    const data = new Date(t.data);
    return data.getMonth() === mesAnterior && data.getFullYear() === ano;
  });

  const receitasAnterior = mostrarComparacao
    ? transacoesAnterior.filter((t) => t.tipo === "receita").reduce((total, t) => total + t.valor, 0)
    : 0;
  const despesasAnterior = mostrarComparacao
    ? transacoesAnterior.filter((t) => t.tipo === "despesa").reduce((total, t) => total + t.valor, 0)
    : 0;

  const variacaoReceitas =
    receitasAnterior !== 0
      ? ((receitasAtual - receitasAnterior) / receitasAnterior) * 100
      : 0;

  const variacaoDespesas =
    despesasAnterior !== 0
      ? ((despesasAtual - despesasAnterior) / despesasAnterior) * 100
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Receitas vs Despesas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
                <PiggyBank className="h-3 w-3 text-warning" />
              </div>
              <span className="text-xs text-muted-foreground">Guardado</span>
            </div>
            <div className="text-lg font-bold text-warning">
              {formatarMoeda(guardarMes)}
            </div>
            <div className="text-xs text-muted-foreground">
              {percentualGuardado.toFixed(1)}% da receita
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
