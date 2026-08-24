import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertTriangle, ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransacaoItem } from "@/components/transacoes/transacao-item";
import { Filtros, type FiltrosTransacao } from "@/components/transacoes/filtros";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda, formatarData } from "@/lib/calculos";
import { CATEGORIA_GUARDAR } from "@/lib/categorias-ids";

const arredondar = (v: number) => Math.round(v * 100) / 100;

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function Transacoes() {
  const navigate = useNavigate();
  const { dados } = useFinanceStore();

  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  const nomeMes = MESES[mesSelecionado];
  const primeiroDiaMes = new Date(anoSelecionado, mesSelecionado, 1);
  const ultimoDiaMes = new Date(anoSelecionado, mesSelecionado + 1, 0);
  const formatarDataISO = (d: Date) => {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  const isMesAtual = mesSelecionado === hoje.getMonth() && anoSelecionado === hoje.getFullYear();

  function navegarMes(direcao: -1 | 1) {
    let novoMes = mesSelecionado + direcao;
    let novoAno = anoSelecionado;
    if (novoMes < 0) { novoMes = 11; novoAno -= 1; }
    else if (novoMes > 11) { novoMes = 0; novoAno += 1; }
    setMesSelecionado(novoMes);
    setAnoSelecionado(novoAno);
  }

  function irParaMesAtual() {
    setMesSelecionado(hoje.getMonth());
    setAnoSelecionado(hoje.getFullYear());
  }

  const [filtros, setFiltros] = useState<FiltrosTransacao>({
    busca: "",
    tipo: "todos",
    categoriaId: "todas",
    contaId: "todas",
    dataInicio: formatarDataISO(primeiroDiaMes),
    dataFim: formatarDataISO(ultimoDiaMes),
  });

  useEffect(() => {
    const primeiroDia = new Date(anoSelecionado, mesSelecionado, 1);
    const ultimoDia = new Date(anoSelecionado, mesSelecionado + 1, 0);
    setFiltros((prev) => ({
      ...prev,
      dataInicio: formatarDataISO(primeiroDia),
      dataFim: formatarDataISO(ultimoDia),
    }));
  }, [mesSelecionado, anoSelecionado]);

  const temContas = (dados?.contas.length ?? 0) > 0;

  const contasFiltradas = (dados?.contas ?? [])
    .filter((c) => filtros.contaId === "todas" || c.id === filtros.contaId)
    .filter((c) => c.tipo !== "poupanca")
    .filter((c) => c.tipo !== "ticket");

  const poupancaIds = (dados?.contas ?? [])
    .filter((c) => c.tipo === "poupanca")
    .map((c) => c.id);

  const ticketIds = (dados?.contas ?? [])
    .filter((c) => c.tipo === "ticket")
    .map((c) => c.id);

  const saldoInicialContas = contasFiltradas
    .reduce((acc, c) => {
      const dataCriacao = c.dataCriacao ? new Date(c.dataCriacao) : null;
      const primeiroDiaPeriodo = new Date(filtros.dataInicio || formatarDataISO(primeiroDiaMes));
      if (dataCriacao && dataCriacao > primeiroDiaPeriodo) return acc;
      return acc + (c.saldoInicial ?? 0);
    }, 0);

  const transacoesAnteriores = (dados?.transacoes ?? [])
    .filter((t) => {
      if (filtros.contaId !== "todas" && t.contaId !== filtros.contaId) return false;
      if (poupancaIds.includes(t.contaId) && t.tipo === "despesa") return false;
      if (ticketIds.includes(t.contaId)) return false;
      if (t.categoriaId === CATEGORIA_GUARDAR) return false;
      if (filtros.dataInicio && t.data < filtros.dataInicio) return true;
      return false;
    })
    .reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0);

  const saldoConfirmadoAnterior = (dados?.transacoes ?? [])
    .filter((t) => {
      if (filtros.contaId !== "todas" && t.contaId !== filtros.contaId) return false;
      if (poupancaIds.includes(t.contaId) && t.tipo === "despesa") return false;
      if (ticketIds.includes(t.contaId)) return false;
      if (t.categoriaId === CATEGORIA_GUARDAR) return false;
      if (!t.confirmada) return false;
      if (filtros.dataInicio && t.data < filtros.dataInicio) return true;
      return false;
    })
    .reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0);

  const transacoesFiltradas = (dados?.transacoes ?? [])
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
      if (poupancaIds.includes(t.contaId) && t.tipo === "despesa") return false;
      if (filtros.dataInicio && t.data < filtros.dataInicio) {
        return false;
      }
      if (filtros.dataFim && t.data > filtros.dataFim) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  let saldoAcumulado = saldoInicialContas + transacoesAnteriores;
  let saldoConfirmado = saldoInicialContas + saldoConfirmadoAnterior;
  const transacoesComSaldo = transacoesFiltradas.map((t) => {
    if (t.categoriaId !== CATEGORIA_GUARDAR && !ticketIds.includes(t.contaId)) {
      saldoAcumulado += t.tipo === "receita" ? t.valor : -t.valor;
      if (t.confirmada) {
        saldoConfirmado += t.tipo === "receita" ? t.valor : -t.valor;
      }
    }
    return { ...t, saldoAcumulado, saldoConfirmado };
  });

  const transacoesPorDia = transacoesComSaldo.reduce<Record<string, typeof transacoesComSaldo>>((acc, t) => {
    if (!acc[t.data]) {
      acc[t.data] = [];
    }
    acc[t.data].push(t);
    return acc;
  }, {});

  let saldoAcumuladoAnterior = saldoInicialContas + transacoesAnteriores;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            {mesSelecionado + 1}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Transações - {nomeMes} {anoSelecionado}</h2>
            <p className="text-muted-foreground">
              Extrato bancário com saldo acumulado
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navegarMes(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {!isMesAtual && (
            <Button variant="outline" size="sm" onClick={irParaMesAtual}>
              Hoje
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => navegarMes(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => navigate("/transferencia")}
            disabled={!temContas}
            title={!temContas ? "Cadastre pelo menos 1 conta antes de criar transferências" : undefined}
            variant="outline"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Transferir
          </Button>
          <Button
            onClick={() => navigate("/transacoes/nova")}
            disabled={!temContas}
            title={!temContas ? "Cadastre pelo menos 1 conta antes de criar transações" : undefined}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </div>
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
              {Object.entries(transacoesPorDia).map(([data, transacoes]) => {
                const saldoInicioDia = saldoAcumuladoAnterior;
                const saldoFimDia = transacoes[transacoes.length - 1].saldoAcumulado;
                saldoAcumuladoAnterior = saldoFimDia;
                
                return (
                  <div key={data} className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-sm">{formatarData(data)}</span>
                      <div className="flex items-center gap-3">
                        {transacoes.some((t) => !t.confirmada) && (
                          <span className={`text-xs ${
                            arredondar(transacoes[transacoes.length - 1].saldoConfirmado) >= 0
                              ? "text-success/70"
                              : "text-destructive/70"
                          }`}>
                            Efetivado: {formatarMoeda(transacoes[transacoes.length - 1].saldoConfirmado)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Início: {formatarMoeda(saldoInicioDia)}
                        </span>
                      </div>
                    </div>
                    {transacoes.map((transacao) => (
                      <TransacaoItem
                        key={transacao.id}
                        transacao={transacao}
                        saldoAcumulado={transacao.saldoAcumulado}
                        onEditar={(id) => navigate(`/transacoes/${id}`)}
                      />
                    ))}
                    <div className="flex justify-end py-2 border-t">
                      <span className={`text-sm font-medium ${
                        arredondar(saldoFimDia) >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}>
                        Saldo do dia: {formatarMoeda(saldoFimDia)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <div className="space-y-1">
                  <span className="font-medium">Saldo Final</span>
                  <p className="text-xs text-muted-foreground">
                    Projetado (todas transações)
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg font-bold ${
                      arredondar(saldoAcumulado) >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {formatarMoeda(saldoAcumulado)}
                  </span>
                  {saldoConfirmado !== saldoAcumulado && (
                    <p className={`text-xs ${
                      arredondar(saldoConfirmado) >= 0 ? "text-success/70" : "text-destructive/70"
                    }`}>
                      Efetivado: {formatarMoeda(saldoConfirmado)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
