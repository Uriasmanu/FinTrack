import type { OperacaoFii } from "@/types";

interface FiiHistoricoOperacoesProps {
  operacoes: OperacaoFii[];
}

export function FiiHistoricoOperacoes({ operacoes }: FiiHistoricoOperacoesProps) {
  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarData = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("pt-BR");

  const operacoesOrdenadas = [...operacoes].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  if (operacoesOrdenadas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhuma operação registrada
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {operacoesOrdenadas.map((op) => (
        <div
          key={op.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                op.tipo === "compra"
                  ? "bg-primary/10 text-primary"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {op.tipo === "compra" ? "C" : "V"}
            </div>
            <div>
              <p className="text-sm font-medium">
                {op.tipo === "compra" ? "Compra" : "Venda"} — {op.quantidade} cotas
              </p>
              <p className="text-xs text-muted-foreground">
                {formatarData(op.data)}
                {op.corretora && ` · ${op.corretora}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{formatarMoeda(op.precoUnitario)}/cota</p>
            <p className="text-xs text-muted-foreground">
              Total: {formatarMoeda(op.precoUnitario * op.quantidade + (op.taxaB3 ?? 0))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
