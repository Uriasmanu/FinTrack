import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SaldoCard } from "@/components/dashboard/saldo-card";
import { ReceitasDespesasCard } from "@/components/dashboard/receitas-despesas-card";
import { ResumoMensal } from "@/components/dashboard/resumo-mensal";
import { ProximasTransacoes } from "@/components/dashboard/proximas-transacoes";
import { ResumoCategorias } from "@/components/dashboard/resumo-categorias";
import { ObjetivosPersonalizados } from "@/components/dashboard/objetivos-personalizados";
import { DespesasPorFinalidade } from "@/components/dashboard/despesas-por-finalidade";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function Dashboard() {
  const { dados } = useFinanceStore();
  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  const [mostrarGraficos, setMostrarGraficos] = useState(() => {
    const salvo = localStorage.getItem("fintrack_dashboard_mostrarGraficos");
    return salvo !== null ? salvo === "true" : true;
  });
  const [mostrarMetas, setMostrarMetas] = useState(() => {
    const salvo = localStorage.getItem("fintrack_dashboard_mostrarMetas");
    return salvo !== null ? salvo === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("fintrack_dashboard_mostrarGraficos", String(mostrarGraficos));
  }, [mostrarGraficos]);

  useEffect(() => {
    localStorage.setItem("fintrack_dashboard_mostrarMetas", String(mostrarMetas));
  }, [mostrarMetas]);

  const nomeMes = MESES[mesSelecionado];
  const isMesAtual = mesSelecionado === hoje.getMonth() && anoSelecionado === hoje.getFullYear();

  function navegarMes(direcao: -1 | 1) {
    let novoMes = mesSelecionado + direcao;
    let novoAno = anoSelecionado;

    if (novoMes < 0) {
      novoMes = 11;
      novoAno -= 1;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno += 1;
    }

    setMesSelecionado(novoMes);
    setAnoSelecionado(novoAno);
  }

  function irParaMesAtual() {
    setMesSelecionado(hoje.getMonth());
    setAnoSelecionado(hoje.getFullYear());
  }

  if (!dados) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            {mesSelecionado + 1}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{nomeMes} {anoSelecionado}</h2>
            <p className="text-sm text-muted-foreground">
              {isMesAtual ? "Visão geral do mês atual" : "Visão geral do período"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SaldoCard mes={mesSelecionado} ano={anoSelecionado} />
        <ReceitasDespesasCard mes={mesSelecionado} ano={anoSelecionado} />
        <ResumoMensal mes={mesSelecionado} ano={anoSelecionado} />
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-end">
        <div className="flex items-center gap-2">
          <Switch
            id="mostrar-graficos"
            checked={mostrarGraficos}
            onCheckedChange={setMostrarGraficos}
          />
          <label htmlFor="mostrar-graficos" className="text-sm text-muted-foreground cursor-pointer">
            Gráficos
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="mostrar-metas"
            checked={mostrarMetas}
            onCheckedChange={setMostrarMetas}
          />
          <label htmlFor="mostrar-metas" className="text-sm text-muted-foreground cursor-pointer">
            Metas
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ProximasTransacoes mes={mesSelecionado} ano={anoSelecionado} />
        <ResumoCategorias mes={mesSelecionado} ano={anoSelecionado} />
      </div>

      {mostrarGraficos && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DespesasPorFinalidade />
        </div>
      )}

      {mostrarMetas && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ObjetivosPersonalizados />
        </div>
      )}
    </div>
  );
}
