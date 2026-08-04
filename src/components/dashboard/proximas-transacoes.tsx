import { Link } from "react-router-dom";
import { RefreshCw, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda, formatarData } from "@/lib/calculos";

interface ProximasTransacoesProps {
  mes: number;
  ano: number;
}

export function ProximasTransacoes({ mes, ano }: ProximasTransacoesProps) {
  const { dadosAno } = useFinanceStore();
  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  const proximasTransacoes = (dadosAno?.transacoes ?? [])
    .filter((t) => {
      const data = new Date(t.data);
      const mesTransacao = data.getMonth();
      const anoTransacao = data.getFullYear();
      return mesTransacao === mes && anoTransacao === ano && t.data >= hojeStr && !t.confirmada;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Próximas Transações
        </CardTitle>
        <Link
          to="/transacoes"
          className="text-xs text-primary hover:underline"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {proximasTransacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma transação pendente
          </p>
        ) : (
          <div className="space-y-3">
            {proximasTransacoes.map((transacao) => (
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
                    {transacao.tipoRecorrencia === "recorrente" ? (
                      <RefreshCw
                        className={`h-4 w-4 ${
                          transacao.tipo === "receita"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      />
                    ) : (
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
