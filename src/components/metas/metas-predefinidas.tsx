import { useState } from "react";
import { Eye } from "lucide-react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { MetaCard } from "./meta-card";
import { AccordionItem } from "@/components/ui/collapsible";
import { CATEGORIA_GUARDAR, CATEGORIA_LAZER } from "@/lib/categorias-ids";

interface MetasPredefinidasProps {
  onEditar: (id: string, overrides?: { valorAlvo?: number; meses?: number; percentual?: number | null }, metaName?: string, metaType?: "padrao" | "personalizado") => void;
}

function arredondar2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function MetasPredefinidas({ onEditar }: MetasPredefinidasProps) {
  const { dados } = useFinanceStore();
  const [accordionOpen, setAccordionOpen] = useState(false);

  const metasPadrao = dados?.metas.filter((m) => m.tipo === "padrao") ?? [];

  if (metasPadrao.length === 0) {
    return null;
  }

  const categoriasReceita = dados?.categorias.filter((c) => (c.tipo === "receita" || c.tipo === "ambos") && c.id !== CATEGORIA_GUARDAR) ?? [];

  function obterReceitasMeta(meta: typeof metasPadrao[0]) {
    const categoriasBase = meta.receitasBase && meta.receitasBase.length > 0
      ? meta.receitasBase
      : categoriasReceita.map((c) => c.id);

    return (dados?.transacoes ?? [])
      .filter((t) => categoriasBase.includes(t.categoriaId) && t.tipo === "receita");
  }

  function obterBreakdownReceita(meta: typeof metasPadrao[0]) {
    const categoriasBase = meta.receitasBase && meta.receitasBase.length > 0
      ? meta.receitasBase
      : categoriasReceita.map((c) => c.id);

    const receitas = (dados?.transacoes ?? [])
      .filter((t) => categoriasBase.includes(t.categoriaId) && t.tipo === "receita");

    const porCategoria = receitas.reduce((acc, t) => {
      const cat = dados?.categorias.find((c) => c.id === t.categoriaId);
      const nome = cat?.nome ?? t.categoriaId;
      acc[nome] = (acc[nome] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

    const meses = new Set(receitas.map((t) => {
      const d = new Date(t.data);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));

    const numMeses = meses.size || 1;

    return Object.entries(porCategoria)
      .map(([nome, total]) => ({ nome, valor: arredondar2(total / numMeses) }))
      .filter((item) => item.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }

  function obterSalarioMensal(meta: typeof metasPadrao[0]) {
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

    return (dados?.transacoes ?? [])
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
    if (!dados) return 0;
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

    return (dados?.transacoes ?? [])
      .filter((t) => {
        if (t.categoriaId !== CATEGORIA_GUARDAR) return false;
        const data = new Date(t.data);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((total, t) => total + t.valor, 0);
  }

  const metasComValores = metasPadrao.map((meta) => {
    const salarioMensal = obterSalarioMensal(meta);
    const breakdown = obterBreakdownReceita(meta);
    let valorAlvo = 0;
    let parcelaMensal = 0;
    let percentualReceita: number | null = null;
    let valorGastoMes: number | null = null;
    let extrapolou: boolean | null = null;
    let valorAtualCalculado: number | null = null;

    if (salarioMensal > 0) {
      switch (meta.nome) {
        case "Viver de Renda":
          valorAlvo = arredondar2(salarioMensal * (dados?.config?.multiplicadores?.viverDeRenda ?? 200));
          parcelaMensal = arredondar2(valorAlvo / meta.meses);
          valorAtualCalculado = obterSaldoPoupanca();
          break;
        case "Reserva de Emergencia":
          valorAlvo = arredondar2(salarioMensal * (dados?.config?.multiplicadores?.reservaEmergencia ?? 6));
          parcelaMensal = arredondar2(valorAlvo / meta.meses);
          valorAtualCalculado = obterSaldoPoupanca();
          break;
        case "Guardar por Mes":
          percentualReceita = (dados?.config?.multiplicadores?.guardarPorMes ?? 0.1) * 100;
          valorAlvo = arredondar2(salarioMensal * (dados?.config?.multiplicadores?.guardarPorMes ?? 0.1));
          parcelaMensal = valorAlvo;
          valorAtualCalculado = obterValorGuardadoMes();
          break;
        case "Conta Fixa": {
          percentualReceita = (dados?.config?.multiplicadores?.contaFixa ?? 0.6) * 100;
          valorAlvo = arredondar2(salarioMensal * (dados?.config?.multiplicadores?.contaFixa ?? 0.6));
          parcelaMensal = valorAlvo;
          valorGastoMes = arredondar2(obterDespesasMesAtual());
          extrapolou = valorGastoMes > valorAlvo;
          valorAtualCalculado = valorGastoMes;
          break;
        }
        case "Lazer": {
          percentualReceita = (dados?.config?.multiplicadores?.lazer ?? 0.3) * 100;
          valorAlvo = arredondar2(salarioMensal * (dados?.config?.multiplicadores?.lazer ?? 0.3));
          parcelaMensal = valorAlvo;
          valorGastoMes = arredondar2(obterDespesasMesAtual([CATEGORIA_LAZER]));
          extrapolou = valorGastoMes > valorAlvo;
          valorAtualCalculado = valorGastoMes;
          break;
        }
      }
    }

    return {
      ...meta,
      valorAlvo,
      parcelaMensal,
      salarioMensal,
      percentualReceita,
      valorGastoMes,
      extrapolou,
      breakdown,
      valorAtualCalculado,
    };
  });

  const metasAtivas = metasComValores.filter((m) => m.ativo);
  const metasDesabilitadas = metasComValores.filter((m) => !m.ativo);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Metas Padrão</h3>
      </div>
      {metasComValores.every((m) => m.salarioMensal === 0) && (
        <p className="text-sm text-warning">
          Cadastre transações de receita para calcular os valores das metas automaticamente.
        </p>
      )}

      {metasAtivas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metasAtivas.map((meta) => (
            <MetaCard
              key={meta.id}
              meta={meta}
              percentualReceita={meta.percentualReceita}
              valorGastoMes={meta.valorGastoMes}
              extrapolou={meta.extrapolou}
              breakdown={meta.breakdown}
              valorAtualCalculado={meta.valorAtualCalculado}
              onEditar={(id) => onEditar(id, { valorAlvo: meta.valorAlvo, meses: meta.meses, percentual: meta.percentualReceita }, meta.nome, "padrao")}
            />
          ))}
        </div>
      )}

      {metasDesabilitadas.length > 0 && (
        <AccordionItem
          open={accordionOpen}
          onOpenChange={setAccordionOpen}
          triggerLabel={
            <span className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              Metas Padrão Desabilitadas
            </span>
          }
          count={metasDesabilitadas.length}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metasDesabilitadas.map((meta) => (
              <MetaCard
                key={meta.id}
                meta={meta}
                percentualReceita={meta.percentualReceita}
                valorGastoMes={meta.valorGastoMes}
                extrapolou={meta.extrapolou}
                breakdown={meta.breakdown}
                valorAtualCalculado={meta.valorAtualCalculado}
              onEditar={(id) => onEditar(id, { valorAlvo: meta.valorAlvo, meses: meta.meses, percentual: meta.percentualReceita }, meta.nome, "padrao")}
              />
            ))}
          </div>
        </AccordionItem>
      )}
    </div>
  );
}
