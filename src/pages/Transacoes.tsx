import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransacaoItem } from "@/components/transacoes/transacao-item";
import { Filtros, type FiltrosTransacao } from "@/components/transacoes/filtros";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda, formatarData } from "@/lib/calculos";

export function Transacoes() {
  const navigate = useNavigate();
  const { dadosAno } = useFinanceStore();
  const [filtros, setFiltros] = useState<FiltrosTransacao>({
    busca: "",
    tipo: "todos",
    categoriaId: "todas",
    contaId: "todas",
    dataInicio: "",
    dataFim: "",
  });

  const temContas = (dadosAno?.contas.length ?? 0) > 0;

  const transacoesFiltradas = (dadosAno?.transacoes ?? [])
    .filter((t) => {
      if (filtros.busca && !t.descricao.toLowerCase().includes(filtros.busca.toLowerCase())) {
        return false;
      }
      if (filtros.tipo !== "todos" && t.tipo !== filtros.tipo) {
        return false;
      }
      if (filtros.categoriaId !== "todas" && t.categoriaId !== filtros.categoriaId) {
        return false;
      }
      if (filtros.contaId !== "todas" && t.contaId !== filtros.contaId) {
        return false;
      }
      if (filtros.dataInicio && t.data < filtros.dataInicio) {
        return false;
      }
      if (filtros.dataFim && t.data > filtros.dataFim) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  let saldoAcumulado = 0;
  const transacoesComSaldo = transacoesFiltradas.map((t) => {
    saldoAcumulado += t.tipo === "receita" ? t.valor : -t.valor;
    return { ...t, saldoAcumulado };
  });

  const transacoesPorDia = transacoesComSaldo.reduce<Record<string, typeof transacoesComSaldo>>((acc, t) => {
    if (!acc[t.data]) {
      acc[t.data] = [];
    }
    acc[t.data].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transações</h2>
          <p className="text-muted-foreground">
            Extrato bancário com saldo acumulado
          </p>
        </div>
        <Button
          onClick={() => navigate("/transacoes/nova")}
          disabled={!temContas}
          title={!temContas ? "Cadastre pelo menos 1 conta antes de criar transações" : undefined}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {!temContas && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium">Nenhuma conta cadastrada</p>
              <p className="text-sm text-muted-foreground">
                Cadastre pelo menos 1 conta antes de criar transações.{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate("/contas")}
                >
                  Cadastrar conta
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <Filtros filtros={filtros} onFiltrosChange={setFiltros} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Extrato</CardTitle>
          <span className="text-sm text-muted-foreground">
            {transacoesFiltradas.length} transação(ões)
          </span>
        </CardHeader>
        <CardContent>
          {transacoesFiltradas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação encontrada
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(transacoesPorDia).map(([data, transacoes]) => (
                <div key={data} className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium text-sm">{formatarData(data)}</span>
                    <span className={`text-sm font-medium ${
                      transacoes[transacoes.length - 1].saldoAcumulado >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}>
                      Saldo do dia: {formatarMoeda(transacoes[transacoes.length - 1].saldoAcumulado)}
                    </span>
                  </div>
                  {transacoes.map((transacao) => (
                    <TransacaoItem
                      key={transacao.id}
                      transacao={transacao}
                      saldoAcumulado={transacao.saldoAcumulado}
                      onEditar={(id) => navigate(`/transacoes/${id}`)}
                    />
                  ))}
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <span className="font-medium">Saldo Final</span>
                <span
                  className={`text-lg font-bold ${
                    saldoAcumulado >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatarMoeda(saldoAcumulado)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
