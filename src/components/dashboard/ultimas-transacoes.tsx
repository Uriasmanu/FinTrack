import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda, formatarData } from "@/lib/calculos";

export function UltimasTransacoes() {
  const { dados } = useFinanceStore();
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  const transacoesMes = (dados?.transacoes ?? []).filter((t) => {
    const data = new Date(t.data);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  });
  const transacoes = [...transacoesMes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Últimas Transações
        </CardTitle>
        <Link
          to="/transacoes"
          className="text-xs text-primary hover:underline"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {transacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma transação registrada
          </p>
        ) : (
          <div className="space-y-3">
            {transacoes.map((transacao) => (
              <div
                key={transacao.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      transacao.tipo === "receita"
                        ? "bg-success/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    {transacao.tipoRecorrencia === "recorrente" && (
                      <RefreshCw
                        className={`h-4 w-4 ${
                          transacao.tipo === "receita"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      />
                    )}
                    {transacao.tipoRecorrencia !== "recorrente" && (
                      <span
                        className={`text-xs font-medium ${
                          transacao.tipo === "receita"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {transacao.tipo === "receita" ? "R" : "D"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{transacao.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatarData(transacao.data)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {transacao.tipoRecorrencia === "parcelado" &&
                    transacao.totalParcelas > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {transacao.parcelaAtual}/{transacao.totalParcelas}
                      </Badge>
                    )}
                  <span
                    className={`font-medium ${
                      transacao.tipo === "receita"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {transacao.tipo === "receita" ? "+" : "-"}
                    {formatarMoeda(transacao.valor)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
