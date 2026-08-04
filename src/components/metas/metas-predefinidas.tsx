import { useFinanceStore } from "@/stores/useFinanceStore";
import { MetaCard } from "./meta-card";
import { formatarMoeda } from "@/lib/calculos";

interface MetasPredefinidasProps {
  onEditar: (id: string) => void;
}

export function MetasPredefinidas({ onEditar }: MetasPredefinidasProps) {
  const { dadosAno } = useFinanceStore();

  const metasPadrao = dadosAno?.metas.filter((m) => m.tipo === "padrao") ?? [];

  if (metasPadrao.length === 0) {
    return null;
  }

  const salarioTransacoes = dadosAno?.transacoes.filter(
    (t) => t.categoriaId === "cat-007" && t.tipo === "receita"
  ) ?? [];

  const salarioMensal = salarioTransacoes.length > 0
    ? Math.max(...salarioTransacoes.map((t) => t.valor))
    : 0;

  const mesAtual = new Date().getMonth();
  const anoAtual = dadosAno?.ano ?? new Date().getFullYear();

  const despesasRecorrentesMes = (dadosAno?.transacoes ?? [])
    .filter((t) => {
      if (t.tipo !== "despesa") return false;
      if (t.tipoRecorrencia !== "recorrente" && t.tipoRecorrencia !== "parcelado") return false;
      const data = new Date(t.data);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    })
    .reduce((total, t) => total + t.valor, 0);

  const metasComValores = metasPadrao.map((meta) => {
    let valorAlvo = 0;
    let parcelaMensal = 0;

    if (salarioMensal > 0) {
      switch (meta.nome) {
        case "Viver de Renda":
          valorAlvo = salarioMensal * (dadosAno?.config?.multiplicadores?.viverDeRenda ?? 200);
          parcelaMensal = valorAlvo / meta.meses;
          break;
        case "Reserva de Emergência":
          valorAlvo = salarioMensal * (dadosAno?.config?.multiplicadores?.reservaEmergencia ?? 6);
          parcelaMensal = valorAlvo / meta.meses;
          break;
        case "Guardar por Mês":
          valorAlvo = salarioMensal * (dadosAno?.config?.multiplicadores?.guardarPorMes ?? 0.1);
          parcelaMensal = valorAlvo;
          break;
        case "Conta Fixa":
          valorAlvo = despesasRecorrentesMes > 0
            ? despesasRecorrentesMes
            : salarioMensal * (dadosAno?.config?.multiplicadores?.contaFixa ?? 0.6);
          parcelaMensal = valorAlvo;
          break;
        case "Lazer":
          valorAlvo = salarioMensal * (dadosAno?.config?.multiplicadores?.lazer ?? 0.3);
          parcelaMensal = valorAlvo;
          break;
      }
    }

    return {
      ...meta,
      valorAlvo,
      parcelaMensal,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Metas Padrão</h3>
        {salarioMensal > 0 && (
          <span className="text-sm text-muted-foreground">
            Baseado no salário: {formatarMoeda(salarioMensal)}
          </span>
        )}
      </div>
      {salarioMensal === 0 && (
        <p className="text-sm text-warning">
          Cadastre transações de receita com a categoria "Salário" para calcular os valores das metas automaticamente.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metasComValores.map((meta) => (
          <MetaCard key={meta.id} meta={meta} onEditar={onEditar} />
        ))}
      </div>
    </div>
  );
}
