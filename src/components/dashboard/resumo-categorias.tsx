import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

export function ResumoCategorias() {
  const { dadosAno, obterDespesasMes } = useFinanceStore();

  const mesAtual = new Date().getMonth();
  const despesasMes = obterDespesasMes(mesAtual);

  if (!dadosAno || despesasMes === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Top Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma despesa no mês
          </p>
        </CardContent>
      </Card>
    );
  }

  const despesasPorCategoria = dadosAno.transacoes
    .filter((t) => {
      if (t.tipo !== "despesa") return false;
      const data = new Date(t.data);
      return data.getMonth() === mesAtual && data.getFullYear() === dadosAno.ano;
    })
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoriaId] = (acc[t.categoriaId] || 0) + t.valor;
      return acc;
    }, {});

  const categoriasOrdenadas = Object.entries(despesasPorCategoria)
    .map(([categoriaId, valor]) => {
      const categoria = dadosAno.categorias.find((c) => c.id === categoriaId);
      return {
        id: categoriaId,
        nome: categoria?.nome ?? "Sem categoria",
        cor: categoria?.cor ?? "#6B7280",
        valor,
        percentual: (valor / despesasMes) * 100,
      };
    })
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Top Categorias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoriasOrdenadas.map((categoria) => (
          <div key={categoria.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: categoria.cor }}
                />
                <span className="text-sm">{categoria.nome}</span>
              </div>
              <span className="text-sm font-medium">
                {formatarMoeda(categoria.valor)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={categoria.percentual}
                className="h-2"
                style={{
                  ["--progress-color" as string]: categoria.cor,
                }}
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {categoria.percentual.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
