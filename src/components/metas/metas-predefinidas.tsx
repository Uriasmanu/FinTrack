import { useFinanceStore } from "@/stores/useFinanceStore";
import { MetaCard } from "./meta-card";

interface MetasPredefinidasProps {
  onEditar: (id: string, overrides?: { valorAlvo?: number; meses?: number }) => void;
}

export function MetasPredefinidas({ onEditar }: MetasPredefinidasProps) {
  const { dados } = useFinanceStore();

  const metasPadrao = dados?.metas.filter((m) => m.tipo === "padrao") ?? [];

  if (metasPadrao.length === 0) {
    return null;
  }

  const categoriasReceita = dados?.categorias.filter((c) => c.tipo === "receita" || c.tipo === "ambos") ?? [];

  function obterReceitasMeta(meta: typeof metasPadrao[0]) {
    const categoriasBase = meta.receitasBase && meta.receitasBase.length > 0
      ? meta.receitasBase
      : categoriasReceita.map((c) => c.id);

    return (dados?.transacoes ?? [])
      .filter((t) => categoriasBase.includes(t.categoriaId) && t.tipo === "receita");
  }

  function obterSalarioMensal(meta: typeof metasPadrao[0]) {
    const receitas = obterReceitasMeta(meta);
    if (receitas.length === 0) return 0;

    const mesesUnicos = new Set(
      receitas.map((t) => {
        const d = new Date(t.data);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    );

    const receitaPorMes = receitas.reduce((acc, t) => {
      const d = new Date(t.data);
      const chave = `${d.getFullYear()}-${d.getMonth()}`;
      acc[chave] = (acc[chave] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

    const valoresMeses = Object.values(receitaPorMes);
    return valoresMeses.length > 0
      ? Math.max(...valoresMeses)
      : 0;
  }

  const metasComValores = metasPadrao.map((meta) => {
    const salarioMensal = obterSalarioMensal(meta);
    let valorAlvo = 0;
    let parcelaMensal = 0;

    if (salarioMensal > 0) {
      switch (meta.nome) {
        case "Viver de Renda":
          valorAlvo = salarioMensal * (dados?.config?.multiplicadores?.viverDeRenda ?? 200);
          parcelaMensal = valorAlvo / meta.meses;
          break;
        case "Reserva de Emergencia":
          valorAlvo = salarioMensal * (dados?.config?.multiplicadores?.reservaEmergencia ?? 6);
          parcelaMensal = valorAlvo / meta.meses;
          break;
        case "Guardar por Mes":
          valorAlvo = salarioMensal * (dados?.config?.multiplicadores?.guardarPorMes ?? 0.1);
          parcelaMensal = valorAlvo;
          break;
        case "Conta Fixa":
          valorAlvo = salarioMensal * (dados?.config?.multiplicadores?.contaFixa ?? 0.6);
          parcelaMensal = valorAlvo;
          break;
        case "Lazer":
          valorAlvo = salarioMensal * (dados?.config?.multiplicadores?.lazer ?? 0.3);
          parcelaMensal = valorAlvo;
          break;
      }
    }

    return {
      ...meta,
      valorAlvo,
      parcelaMensal,
      salarioMensal,
    };
  });

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metasComValores.map((meta) => (
          <MetaCard
            key={meta.id}
            meta={meta}
            onEditar={(id) => onEditar(id, { valorAlvo: meta.valorAlvo, meses: meta.meses })}
          />
        ))}
      </div>
    </div>
  );
}
