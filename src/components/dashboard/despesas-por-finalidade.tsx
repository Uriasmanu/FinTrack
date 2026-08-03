import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

const CATEGORIA_LAZER = "cat-004";
const CATEGORIA_EDUCACAO = "cat-006";

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

  const valorGastosFixos = despesasMes
    .filter((t) => t.categoriaId !== CATEGORIA_LAZER)
    .reduce((acc, t) => acc + t.valor, 0);

  const percentualLazer = totalDespesas > 0 ? (valorLazer / totalDespesas) * 100 : 0;
  const percentualEducacao = totalDespesas > 0 ? (valorEducacao / totalDespesas) * 100 : 0;
  const percentualGastosFixos = totalDespesas > 0 ? (valorGastosFixos / totalDespesas) * 100 : 0;

  const categorias = [
    {
      nome: "Gastos Fixos",
      valor: valorGastosFixos,
      percentual: percentualGastosFixos,
      cor: "#3B82F6",
      descricao: "Todas as despesas exceto lazer",
    },
    {
      nome: "Lazer",
      valor: valorLazer,
      percentual: percentualLazer,
      cor: "#EC4899",
      descricao: "Transações da categoria Lazer",
    },
    {
      nome: "Educação",
      valor: valorEducacao,
      percentual: percentualEducacao,
      cor: "#06B6D4",
      descricao: "Transações da categoria Educação",
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
