import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/stores/useFinanceStore";
import {
  calcularTotalMes,
  calcularQuantidadeComprasMes,
  calcularVariacaoPercentual,
  obterMesAnterior,
} from "@/lib/calculos-mercado";

export function MercadoDashboard() {
  const { dados } = useFinanceStore();

  const totais = useMemo(() => {
    const compras = dados?.comprasMercado ?? [];
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    const { mes: mesAnt, ano: anoAnt } = obterMesAnterior(mesAtual, anoAtual);

    const totalMesAtual = calcularTotalMes(compras, mesAtual, anoAtual);
    const totalMesAnterior = calcularTotalMes(compras, mesAnt, anoAnt);
    const variacao = calcularVariacaoPercentual(totalMesAtual, totalMesAnterior);
    const quantidadeCompras = calcularQuantidadeComprasMes(compras, mesAtual, anoAtual);

    return { totalMesAtual, totalMesAnterior, variacao, quantidadeCompras };
  }, [dados]);

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const corVariacao =
    totais.variacao === null
      ? "text-foreground"
      : totais.variacao > 0
        ? "text-destructive"
        : totais.variacao < 0
          ? "text-success"
          : "text-foreground";

  const textoVariacao =
    totais.variacao === null ? "—" : `${totais.variacao > 0 ? "+" : ""}${totais.variacao.toFixed(1)}%`;

  const cards = [
    { titulo: "Total Mês Atual", valor: formatarMoeda(totais.totalMesAtual), cor: "text-primary" },
    { titulo: "Total Mês Anterior", valor: formatarMoeda(totais.totalMesAnterior), cor: "text-foreground" },
    { titulo: "Variação", valor: textoVariacao, cor: corVariacao },
    { titulo: "Compras no Mês", valor: String(totais.quantidadeCompras), cor: "text-foreground" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.titulo}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.cor}`}>{card.valor}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
