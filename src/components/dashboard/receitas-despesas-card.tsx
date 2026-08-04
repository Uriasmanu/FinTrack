import { ArrowUp, ArrowDown } from "lucide-react";
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

  const mostrarComparacao = mes > 0;
  const mesAnterior = mes === 0 ? 11 : mes - 1;
  const anoAnterior = mes === 0 ? ano - 1 : ano;

  const receitasAnterior = mostrarComparacao ? obterReceitasMes(mesAnterior) : 0;
  const despesasAnterior = mostrarComparacao ? obterDespesasMes(mesAnterior) : 0;

  const variacaoReceitas =
    receitasAnterior !== 0
      ? ((receitasAtual - receitasAnterior) / receitasAnterior) * 100
      : 0;

  const variacaoDespesas =
    despesasAnterior !== 0
      ? ((despesasAtual - despesasAnterior) / despesasAnterior) * 100
      : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Receitas vs Despesas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
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
              <div className="h-3 w-3 rounded-full bg-destructive" />
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
        </div>
      </CardContent>
    </Card>
  );
}
