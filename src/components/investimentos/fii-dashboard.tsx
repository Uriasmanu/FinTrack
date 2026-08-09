import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { calcularValorCarteiraFii, calcularIndicadoresFii, calcularDyMedioCarteira, calcularTotalDividendosAno } from "@/lib/calculos-fii";

export function FiiDashboard() {
  const { dados } = useFinanceStore();

  const ativos = dados?.ativosFii?.filter((a) => a.ativo) ?? [];
  const dividendos = dados?.dividendosFii ?? [];

  const indicadoresPorAtivo = useMemo(() => {
    const map: Record<string, ReturnType<typeof calcularIndicadoresFii>> = {};
    for (const ativo of ativos) {
      map[ativo.id] = calcularIndicadoresFii(ativo, dividendos);
    }
    return map;
  }, [ativos, dividendos]);

  const valorCarteira = calcularValorCarteiraFii(ativos);
  const dyMedio = calcularDyMedioCarteira(ativos, indicadoresPorAtivo);
  const totalDividendosAno = calcularTotalDividendosAno(dividendos, new Date().getFullYear());
  const totalAtivos = ativos.length;

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarPercentual = (v: number) => `${v.toFixed(2)}%`;

  const cards = [
    {
      titulo: "Valor da Carteira",
      valor: formatarMoeda(valorCarteira),
      cor: "text-primary",
    },
    {
      titulo: "DY Médio",
      valor: formatarPercentual(dyMedio),
      cor: "text-success",
    },
    {
      titulo: "Dividendos no Ano",
      valor: formatarMoeda(totalDividendosAno),
      cor: "text-warning",
    },
    {
      titulo: "FIIs Ativos",
      valor: String(totalAtivos),
      cor: "text-foreground",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.titulo}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.cor}`}>
              {card.valor}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
