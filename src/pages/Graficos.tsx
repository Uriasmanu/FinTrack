import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const MESES_COMPLETOS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

type TipoGrafico = "pizza" | "barra" | "linhas";
type TipoDado = "despesas_categoria" | "receitas_categoria" | "evolucao_mensal";

const CORES = [
  "#F97316", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981",
  "#06B6D4", "#16A34A", "#6366F1", "#F59E0B", "#6B7280",
  "#DC2626", "#059669",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
};

export function Graficos() {
  const { dadosAno } = useFinanceStore();
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("pizza");
  const [tipoDado, setTipoDado] = useState<TipoDado>("despesas_categoria");
  const [contaId, setContaId] = useState<string>("todas");

  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  const mesAtual = mesSelecionado;
  const anoAtual = anoSelecionado;
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

  const dadosGrafico = useMemo(() => {
    if (!dadosAno) return [];

    const filtrarPorConta = (t: { contaId: string }) => {
      if (contaId === "todas") return true;
      return t.contaId === contaId;
    };

    if (tipoDado === "despesas_categoria") {
      const despesas = dadosAno.transacoes.filter(
        (t) => t.tipo === "despesa" && new Date(t.data).getMonth() === mesAtual && new Date(t.data).getFullYear() === anoAtual && filtrarPorConta(t)
      );
      const porCategoria: Record<string, number> = {};
      despesas.forEach((t) => {
        const cat = dadosAno.categorias.find((c) => c.id === t.categoriaId);
        const nome = cat?.nome ?? "Sem categoria";
        porCategoria[nome] = (porCategoria[nome] ?? 0) + t.valor;
      });
      return Object.entries(porCategoria).map(([name, value]) => ({ name, value }));
    }

    if (tipoDado === "receitas_categoria") {
      const receitas = dadosAno.transacoes.filter(
        (t) => t.tipo === "receita" && new Date(t.data).getMonth() === mesAtual && new Date(t.data).getFullYear() === anoAtual && filtrarPorConta(t)
      );
      const porCategoria: Record<string, number> = {};
      receitas.forEach((t) => {
        const cat = dadosAno.categorias.find((c) => c.id === t.categoriaId);
        const nome = cat?.nome ?? "Sem categoria";
        porCategoria[nome] = (porCategoria[nome] ?? 0) + t.valor;
      });
      return Object.entries(porCategoria).map(([name, value]) => ({ name, value }));
    }

    if (tipoDado === "evolucao_mensal") {
      return MESES.map((mes, i) => {
        const receitas = dadosAno.transacoes
          .filter((t) => t.tipo === "receita" && new Date(t.data).getMonth() === i && new Date(t.data).getFullYear() === anoAtual && filtrarPorConta(t))
          .reduce((acc, t) => acc + t.valor, 0);
        const despesas = dadosAno.transacoes
          .filter((t) => t.tipo === "despesa" && new Date(t.data).getMonth() === i && new Date(t.data).getFullYear() === anoAtual && filtrarPorConta(t))
          .reduce((acc, t) => acc + t.valor, 0);
        return { name: mes, receitas, despesas };
      });
    }

    return [];
  }, [dadosAno, tipoDado, mesAtual, anoAtual, contaId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderGrafico = () => {
    if (dadosGrafico.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhum dado disponível para este período</p>
        </div>
      );
    }

    if (tipoGrafico === "pizza") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            {/* @ts-ignore recharts type mismatch */}
            <Pie
              data={dadosGrafico}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {dadosGrafico.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatarMoeda(Number(value))}
              contentStyle={tooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (tipoGrafico === "barra") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          {/* @ts-ignore recharts type mismatch */}
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatarMoeda(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatarMoeda(Number(value))} />
            <Legend />
            {tipoDado === "evolucao_mensal" ? (
              <>
                <Bar dataKey="receitas" name="Receitas" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </>
            ) : (
              <Bar dataKey="value" name={tipoDado === "despesas_categoria" ? "Despesas" : "Receitas"} radius={[4, 4, 0, 0]}>
                {dadosGrafico.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (tipoGrafico === "linhas") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          {/* @ts-ignore recharts type mismatch */}
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatarMoeda(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatarMoeda(Number(value))} />
            <Legend />
            {tipoDado === "evolucao_mensal" ? (
              <>
                <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#16A34A" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} />
              </>
            ) : (
              <Line type="monotone" dataKey="value" name={tipoDado === "despesas_categoria" ? "Despesas" : "Receitas"} stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            {mesSelecionado + 1}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Gráficos - {MESES_COMPLETOS[mesSelecionado]} {anoSelecionado}</h2>
            <p className="text-muted-foreground">Visualize seus dados financeiros</p>
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

      <div className="flex flex-wrap gap-3">
        <Select value={tipoDado} onValueChange={(v) => setTipoDado(v as TipoDado)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="despesas_categoria">Despesas por Categoria</SelectItem>
            <SelectItem value="receitas_categoria">Receitas por Categoria</SelectItem>
            <SelectItem value="evolucao_mensal">Evolução Mensal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={contaId} onValueChange={setContaId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas contas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas contas</SelectItem>
            {(dadosAno?.contas ?? []).map((conta) => (
              <SelectItem key={conta.id} value={conta.id}>
                {conta.banco} ({conta.tipo === "corrente" ? "Corrente" : conta.tipo === "poupanca" ? "Poupança" : conta.tipo === "investimento" ? "Investimento" : "Ticket"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <Button
            variant={tipoGrafico === "pizza" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipoGrafico("pizza")}
          >
            Pizza
          </Button>
          <Button
            variant={tipoGrafico === "barra" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipoGrafico("barra")}
          >
            Barra
          </Button>
          <Button
            variant={tipoGrafico === "linhas" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipoGrafico("linhas")}
          >
            Linhas
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {tipoDado === "despesas_categoria" && "Despesas por Categoria"}
            {tipoDado === "receitas_categoria" && "Receitas por Categoria"}
            {tipoDado === "evolucao_mensal" && "Evolução Mensal - Receitas vs Despesas"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderGrafico()}
        </CardContent>
      </Card>

      {tipoDado === "evolucao_mensal" && (
        <div className="grid gap-4 md:grid-cols-3">
          {dadosGrafico.slice(0, 3).map((item) => {
            const data = item as { name: string; receitas: number; despesas: number };
            const saldo = data.receitas - data.despesas;
            return (
              <Card key={data.name}>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">{data.name}</p>
                  <p className={`text-lg font-bold ${saldo >= 0 ? "text-success" : "text-destructive"}`}>
                    {saldo >= 0 ? "+" : ""}{formatarMoeda(saldo)}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span className="text-success">+{formatarMoeda(data.receitas)}</span>
                    <span className="text-destructive">-{formatarMoeda(data.despesas)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
