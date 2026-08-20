import { Link } from "react-router-dom";
import { Target, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda, formatarPrazo } from "@/lib/calculos";
import { CATEGORIA_GUARDAR, CATEGORIA_LAZER } from "@/lib/categorias-ids";

function arredondar2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function ObjetivosPersonalizados() {
  const { dados, editarMeta, obterSaldoConta } = useFinanceStore();

  if (!dados) return null;

  const categoriasReceita = dados.categorias.filter(
    (c) => (c.tipo === "receita" || c.tipo === "ambos") && c.id !== CATEGORIA_GUARDAR
  );

  function obterReceitasMeta(meta: { receitasBase?: string[] }) {
    const categoriasBase = meta.receitasBase && meta.receitasBase.length > 0
      ? meta.receitasBase
      : categoriasReceita.map((c) => c.id);

    return dados.transacoes
      .filter((t) => categoriasBase.includes(t.categoriaId) && t.tipo === "receita");
  }

  function obterSalarioMensal(meta: { receitasBase?: string[] }) {
    const receitas = obterReceitasMeta(meta);
    if (receitas.length === 0) return 0;

    const receitaPorMes = receitas.reduce((acc, t) => {
      const d = new Date(t.data);
      const chave = `${d.getFullYear()}-${d.getMonth()}`;
      acc[chave] = (acc[chave] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

    const valoresMeses = Object.values(receitaPorMes);
    const soma = valoresMeses.reduce((total, v) => total + v, 0);
    return arredondar2(soma / valoresMeses.length);
  }

  function obterDespesasMesAtual(categoriaIds?: string[]) {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    return dados.transacoes
      .filter((t) => {
        if (t.tipo !== "despesa") return false;
        if (t.tipoRecorrencia !== "recorrente" && t.tipoRecorrencia !== "parcelado") return false;
        if (categoriaIds && !categoriaIds.includes(t.categoriaId)) return false;
        const data = new Date(t.data);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((total, t) => total + t.valor, 0);
  }

  function obterSaldoPoupanca(): number {
    const contasPoupanca = dados.contas.filter((c) => c.tipo === "poupanca");
    return contasPoupanca.reduce((total, conta) => {
      const saldoTransacoes = dados.transacoes
        .filter((t) => t.contaId === conta.id && t.confirmada)
        .reduce((acc, t) => (t.tipo === "receita" ? acc + t.valor : acc - t.valor), 0);
      return total + conta.saldoInicial + saldoTransacoes;
    }, 0);
  }

  function obterValorGuardadoMes(): number {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    return dados.transacoes
      .filter((t) => {
        if (t.categoriaId !== CATEGORIA_GUARDAR) return false;
        const data = new Date(t.data);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((total, t) => total + t.valor, 0);
  }

  function calcularValorMetaPredefinida(meta: typeof dados.metas[0]) {
    const salarioMensal = obterSalarioMensal(meta);
    let valorAlvo = 0;
    let valorAtualCalculado: number | null = null;

    if (salarioMensal > 0) {
      switch (meta.nome) {
        case "Viver de Renda":
          valorAlvo = arredondar2(salarioMensal * (dados.config?.multiplicadores?.viverDeRenda ?? 200));
          valorAtualCalculado = obterSaldoPoupanca();
          break;
        case "Reserva de Emergencia":
          valorAlvo = arredondar2(salarioMensal * (dados.config?.multiplicadores?.reservaEmergencia ?? 6));
          valorAtualCalculado = obterSaldoPoupanca();
          break;
        case "Guardar por Mes":
          valorAlvo = arredondar2(salarioMensal * (dados.config?.multiplicadores?.guardarPorMes ?? 0.1));
          valorAtualCalculado = obterValorGuardadoMes();
          break;
        case "Conta Fixa":
          valorAlvo = arredondar2(salarioMensal * (dados.config?.multiplicadores?.contaFixa ?? 0.6));
          valorAtualCalculado = arredondar2(obterDespesasMesAtual());
          break;
        case "Lazer":
          valorAlvo = arredondar2(salarioMensal * (dados.config?.multiplicadores?.lazer ?? 0.3));
          valorAtualCalculado = arredondar2(obterDespesasMesAtual([CATEGORIA_LAZER]));
          break;
      }
    }

    return { valorAlvo, valorAtualCalculado };
  }

  const metasAtivas = dados.metas.filter((m) => m.ativo);

  const metasComValores = metasAtivas.map((meta) => {
    if (meta.tipo === "padrao") {
      const { valorAlvo, valorAtualCalculado } = calcularValorMetaPredefinida(meta);
      return {
        ...meta,
        valorAlvoCalculado: valorAlvo,
        valorAtualCalculado,
      };
    }
    return {
      ...meta,
      valorAlvoCalculado: meta.valorAlvo,
      valorAtualCalculado: meta.contaId ? obterSaldoConta(meta.contaId) : meta.valorAtual,
    };
  });

  const handleToggleAtivo = (id: string, ativo: boolean) => {
    editarMeta(id, { ativo });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-3 w-3 text-primary" />
          </div>
          Metas
        </CardTitle>
        <Link to="/metas/nova">
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {metasComValores.length === 0 ? (
          <div className="text-center py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Nenhuma meta criada
            </p>
            <Link to="/metas/nova">
              <Button variant="outline" size="sm">
                Criar primeira meta
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {metasComValores.slice(0, 5).map((meta) => {
              const valorAtual = meta.valorAtualCalculado ?? 0;
              const valorAlvo = meta.valorAlvoCalculado ?? meta.valorAlvo;
              const percentual = valorAlvo > 0
                ? Math.min((valorAtual / valorAlvo) * 100, 100)
                : 0;

              return (
                <div key={meta.id} className="space-y-2 p-2 rounded-lg hover:bg-accent/50 transition-colors duration-150 ease-in-out">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{meta.nome}</span>
                    <Switch
                      checked={meta.ativo}
                      onCheckedChange={(checked) =>
                        handleToggleAtivo(meta.id, checked)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percentual} className="h-2 flex-1" />
                    <span className="text-xs font-medium w-12 text-right">
                      {percentual.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatarMoeda(valorAtual)} /{" "}
                      {formatarMoeda(valorAlvo)}
                    </span>
                    <span>
                      {formatarMoeda(meta.parcelaMensal)}/mês •{" "}
                      {formatarPrazo(meta.meses)}
                    </span>
                  </div>
                </div>
              );
            })}
            {metasComValores.length > 5 && (
              <Link
                to="/metas"
                className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
              >
                Ver todas ({metasComValores.length}) <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
