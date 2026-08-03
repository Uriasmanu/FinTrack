import { useFinanceStore } from "@/stores/useFinanceStore";
import { MetaCard } from "./meta-card";

interface MetasPredefinidasProps {
  onEditar: (id: string) => void;
}

export function MetasPredefinidas({ onEditar }: MetasPredefinidasProps) {
  const { dadosAno } = useFinanceStore();

  const metasPadrao = dadosAno?.metas.filter((m) => m.tipo === "padrao") ?? [];

  if (metasPadrao.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Metas Padrão</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metasPadrao.map((meta) => (
          <MetaCard key={meta.id} meta={meta} onEditar={onEditar} />
        ))}
      </div>
    </div>
  );
}
