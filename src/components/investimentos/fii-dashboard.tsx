import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function FiiDashboard() {
  const { dados } = useFinanceStore();

  const ativos = dados?.ativosFii?.filter((a) => a.ativo) ?? [];

  const totais = useMemo(() => {
    const totalInvestido = ativos.reduce(
      (soma, a) => soma + a.quantidadeCotas * a.precoCota,
      0
    );
    const totalDividendosMensal = ativos.reduce(
      (soma, a) => soma + a.valorDividendoMensal * a.quantidadeCotas,
      0
    );
    const totalDividendosAnual = totalDividendosMensal * 12;
    const dyMedio = totalInvestido > 0
      ? (totalDividendosMensal / totalInvestido) * 100 * 12
      : 0;

    return {
      totalInvestido,
      totalDividendosMensal,
      totalDividendosAnual,
      dyMedio,
      totalAtivos: ativos.length,
    };
  }, [ativos]);

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarPercentual = (v: number) => `${v.toFixed(2)}%`;

  const cards = [
    {
      titulo: "Total Investido",
      valor: formatarMoeda(totais.totalInvestido),
      cor: "text-primary",
    },
    {
      titulo: "Dividendos/Mês",
      valor: formatarMoeda(totais.totalDividendosMensal),
      cor: "text-success",
    },
    {
      titulo: "DY Médio Anual",
      valor: formatarPercentual(totais.dyMedio),
      cor: "text-success",
    },
    {
      titulo: "FIIs Ativos",
      valor: String(totais.totalAtivos),
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
