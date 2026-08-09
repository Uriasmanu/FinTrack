import type { DividendoFii } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface FiiHistoricoDividendosProps {
  dividendos: DividendoFii[];
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
};

export function FiiHistoricoDividendos({ dividendos }: FiiHistoricoDividendosProps) {
  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const dividendosOrdenados = [...dividendos].sort(
    (a, b) => new Date(b.dataPagamento).getTime() - new Date(a.dataPagamento).getTime()
  );

  const dadosGrafico = [...dividendos]
    .sort((a, b) => a.competencia.localeCompare(b.competencia))
    .map((d) => ({
      name: d.competencia,
      valor: d.valorPorCota,
    }));

  if (dividendosOrdenados.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum dividendo registrado
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {dadosGrafico.length > 1 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico}>
              <XAxis dataKey="name" fontSize={10} tick={{ fill: "white" }} />
              <YAxis fontSize={10} tickFormatter={(v) => `R$ ${v}`} tick={{ fill: "white" }} />
              <Tooltip
                formatter={(value) => formatarMoeda(Number(value))}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="valor" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        {dividendosOrdenados.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div>
              <p className="text-sm font-medium">{d.competencia}</p>
              <p className="text-xs text-muted-foreground">
                {formatarMoeda(d.valorPorCota)}/cota · {d.quantidadeCotas} cotas
                {!d.recorrente && (
                  <span className="ml-1 text-warning">· Não recorrente</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-success">
                {formatarMoeda(d.totalRecebido)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
