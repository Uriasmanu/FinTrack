import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AtivoFii } from "@/types";

interface FiiMensalChartProps {
  ativos: AtivoFii[];
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
};

const mesesPT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function FiiMensalChart({ ativos }: FiiMensalChartProps) {
  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const dadosGrafico = useMemo(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const dados: { name: string; investido: number; dividendos: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const data = new Date(anoAtual, mesAtual - i, 1);
      const mes = data.getMonth();
      const ano = data.getFullYear();
      const nomeMes = `${mesesPT[mes]}/${String(ano).slice(2)}`;

      let totalInvestido = 0;
      let totalDividendos = 0;

      for (const ativo of ativos) {
        const dataCriacao = new Date(ativo.criadoEm);
        const mesCriacao = dataCriacao.getMonth();
        const anoCriacao = dataCriacao.getFullYear();

        if (ano < anoCriacao || (ano === anoCriacao && mes < mesCriacao)) {
          continue;
        }

        totalInvestido += ativo.quantidadeCotas * ativo.precoCota;
        totalDividendos += ativo.valorDividendoMensal * ativo.quantidadeCotas;
      }

      dados.push({
        name: nomeMes,
        investido: totalInvestido,
        dividendos: totalDividendos,
      });
    }

    return dados;
  }, [ativos]);

  const totalInvestido = dadosGrafico.reduce((soma, d) => soma + d.investido, 0);
  const totalDividendos = dadosGrafico.reduce((soma, d) => soma + d.dividendos, 0);

  if (ativos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Acompanhamento Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Cadastre um FII para ver o gráfico
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Acompanhamento Mensal — Investido vs Dividendos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico}>
              <XAxis dataKey="name" fontSize={10} tick={{ fill: "hsl(var(--foreground))" }} />
              <YAxis fontSize={10} tickFormatter={(v) => `R$ ${v}`} tick={{ fill: "hsl(var(--foreground))" }} />
              <Tooltip
                formatter={(value, name) => [
                  formatarMoeda(Number(value)),
                  name === "investido" ? "Investido" : "Dividendos"
                ]}
                contentStyle={tooltipStyle}
              />
              <Legend
                formatter={(value) => value === "investido" ? "Investido" : "Dividendos"}
              />
              <Bar dataKey="investido" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dividendos" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-muted-foreground text-xs">Total Investido (12 meses)</p>
            <p className="font-bold text-primary">{formatarMoeda(totalInvestido)}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-muted-foreground text-xs">Total Dividendos (12 meses)</p>
            <p className="font-bold text-success">{formatarMoeda(totalDividendos)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
