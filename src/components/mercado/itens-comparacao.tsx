import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { calcularComparacaoItens } from "@/lib/calculos-mercado";

export function ItensComparacao() {
  const { dados } = useFinanceStore();
  const compras = dados?.comprasMercado ?? [];

  const comparacao = useMemo(() => {
    const agora = new Date();
    return calcularComparacaoItens(compras, agora.getMonth(), agora.getFullYear());
  }, [compras]);

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (comparacao.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Comparativo de Preços por Item</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Registre uma compra neste mês para ver o comparativo de preços
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Comparativo de Preços por Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {comparacao.map((item) => (
          <div
            key={item.nome}
            className="flex flex-col gap-1 border-b pb-2 last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium">{item.nome}</span>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">{formatarMoeda(item.precoMedioAtual)}</span>
              {item.precoMedioAnterior === null ? (
                <Badge variant="secondary">novo</Badge>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground">
                    (antes {formatarMoeda(item.precoMedioAnterior)})
                  </span>
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      item.variacaoPercentual! > 0
                        ? "text-destructive"
                        : item.variacaoPercentual! < 0
                          ? "text-success"
                          : "text-muted-foreground"
                    }`}
                  >
                    {item.variacaoPercentual! > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : item.variacaoPercentual! < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    {Math.abs(item.variacaoPercentual!).toFixed(1)}%
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
