import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

const CATEGORIA_LAZER = "cat-004";
const CATEGORIA_EDUCACAO = "cat-006";
const CATEGORIA_COMBUSTIVEL = "cat-015";
const CATEGORIA_LIMPEZA = "cat-016";
const CATEGORIA_COMIDA = "cat-017";
const CATEGORIA_BESTEIRA = "cat-018";
const CATEGORIA_ACOUGUE = "cat-019";

export function DespesasPorFinalidade() {
  const { dadosAno } = useFinanceStore();

  const mesAtual = new Date().getMonth();

  if (!dadosAno) return null;

  const despesasMes = dadosAno.transacoes.filter((t) => {
    if (t.tipo !== "despesa") return false;
    const data = new Date(t.data);
    return data.getMonth() === mesAtual && data.getFullYear() === dadosAno.ano;
  });

  const totalDespesas = despesasMes.reduce((acc, t) => acc + t.valor, 0);

  const valorLazer = despesasMes
    .filter((t) => t.categoriaId === CATEGORIA_LAZER)
    .reduce((acc, t) => acc + t.valor, 0);

  const valorEducacao = despesasMes
    .filter((t) => t.categoriaId === CATEGORIA_EDUCACAO)
    .reduce((acc, t) => acc + t.valor, 0);

  const valorCombustivel = despesasMes
    .filter((t) => t.categoriaId === CATEGORIA_COMBUSTIVEL)
    .reduce((acc, t) => acc + t.valor, 0);

  const valorLimpeza = despesasMes
    .filter((t) => t.categoriaId === CATEGORIA_LIMPEZA)
    .reduce((acc, t) => acc + t.valor, 0);

  const valorComida = despesasMes
    .filter((t) => t.categoriaId === CATEGORIA_COMIDA)
    .reduce((acc, t) => acc + t.valor, 0);

  const valorBesteira = despesasMes
    .filter((t) => t.categoriaId === CATEGORIA_BESTEIRA)
    .reduce((acc, t) => acc + t.valor, 0);

  const valorAcougue = despesasMes
    .filter((t) => t.categoriaId === CATEGORIA_ACOUGUE)
    .reduce((acc, t) => acc + t.valor, 0);

  const categoriasFixas = [CATEGORIA_LAZER, CATEGORIA_EDUCACAO, CATEGORIA_COMBUSTIVEL, CATEGORIA_LIMPEZA, CATEGORIA_COMIDA, CATEGORIA_BESTEIRA, CATEGORIA_ACOUGUE];
  const valorGastosFixos = despesasMes
    .filter((t) => !categoriasFixas.includes(t.categoriaId))
    .reduce((acc, t) => acc + t.valor, 0);

  const percentualLazer = totalDespesas > 0 ? (valorLazer / totalDespesas) * 100 : 0;
  const percentualEducacao = totalDespesas > 0 ? (valorEducacao / totalDespesas) * 100 : 0;
  const percentualCombustivel = totalDespesas > 0 ? (valorCombustivel / totalDespesas) * 100 : 0;
  const percentualLimpeza = totalDespesas > 0 ? (valorLimpeza / totalDespesas) * 100 : 0;
  const percentualComida = totalDespesas > 0 ? (valorComida / totalDespesas) * 100 : 0;
  const percentualBesteira = totalDespesas > 0 ? (valorBesteira / totalDespesas) * 100 : 0;
  const percentualAcougue = totalDespesas > 0 ? (valorAcougue / totalDespesas) * 100 : 0;
  const percentualGastosFixos = totalDespesas > 0 ? (valorGastosFixos / totalDespesas) * 100 : 0;

  const categorias = [
    {
      nome: "Gastos Fixos",
      valor: valorGastosFixos,
      percentual: percentualGastosFixos,
      cor: "#3B82F6",
      descricao: "Outras despesas",
    },
    {
      nome: "Combustivel",
      valor: valorCombustivel,
      percentual: percentualCombustivel,
      cor: "#F59E0B",
      descricao: "Gastos com combustivel",
    },
    {
      nome: "Compras para Casa",
      valor: valorLimpeza + valorComida + valorBesteira + valorAcougue,
      percentual: (valorLimpeza + valorComida + valorBesteira + valorAcougue) / totalDespesas * 100,
      cor: "#10B981",
      descricao: "Limpeza, Comida, Besteira, Acougue",
    },
    {
      nome: "Lazer",
      valor: valorLazer,
      percentual: percentualLazer,
      cor: "#EC4899",
      descricao: "Transacoes da categoria Lazer",
    },
    {
      nome: "Educacao",
      valor: valorEducacao,
      percentual: percentualEducacao,
      cor: "#06B6D4",
      descricao: "Transacoes da categoria Educacao",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Despesas por Finalidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalDespesas === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma despesa no mês
          </p>
        ) : (
          categorias.map((cat) => (
            <div key={cat.nome} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.cor }}
                  />
                  <div>
                    <span className="text-sm font-medium">{cat.nome}</span>
                    <p className="text-xs text-muted-foreground">{cat.descricao}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {formatarMoeda(cat.valor)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={cat.percentual}
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {cat.percentual.toFixed(0)}%
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
