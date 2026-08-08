import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetasPredefinidas } from "@/components/metas/metas-predefinidas";
import { MetaCard } from "@/components/metas/meta-card";
import { MetaForm } from "@/components/metas/meta-form";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Metas() {
  const { dados, adicionarMeta, editarMeta } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOverrides, setEditingOverrides] = useState<{ valorAlvo?: number; meses?: number; percentual?: number | null } | null>(null);
  const [editingMetaName, setEditingMetaName] = useState<string | undefined>(undefined);

  const metasPersonalizadas = dados?.metas.filter((m) => m.tipo === "personalizado") ?? [];

  function handleEditar(id: string, overrides?: { valorAlvo?: number; meses?: number; percentual?: number | null }, metaName?: string) {
    setEditingId(id);
    setEditingOverrides(overrides ?? null);
    setEditingMetaName(metaName);
    setOpen(true);
  }

  function handleNovo() {
    setEditingId(null);
    setEditingOverrides(null);
    setOpen(true);
  }

  function handleSubmit(data: { nome: string; valorAlvo: number; meses: number; receitasBase: string[] }) {
    const hoje = new Date();
    const dataInicio = hoje.toISOString().split("T")[0];
    const dataFim = new Date(
      hoje.getFullYear() + Math.floor(data.meses / 12),
      hoje.getMonth() + (data.meses % 12),
      hoje.getDate()
    )
      .toISOString()
      .split("T")[0];

    const parcelaMensal = data.valorAlvo / data.meses;

    if (editingId) {
      editarMeta(editingId, {
        ...data,
        dataFim,
        parcelaMensal,
      });
    } else {
      adicionarMeta({
        ...data,
        tipo: "personalizado",
        ativo: true,
        valorAtual: 0,
        dataInicio,
        dataFim,
        parcelaMensal,
        status: "em_andamento",
        receitasBase: data.receitasBase ?? [],
      });
    }
  }

  const metaEditando = editingId
    ? {
        ...dados?.metas.find((m) => m.id === editingId),
        ...(editingOverrides?.valorAlvo !== undefined && { valorAlvo: editingOverrides.valorAlvo }),
        ...(editingOverrides?.meses !== undefined && { meses: editingOverrides.meses }),
        ...(editingOverrides?.percentual !== undefined && { percentual: editingOverrides.percentual }),
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Metas</h2>
          <p className="text-muted-foreground">
            Acompanhe seus objetivos financeiros
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <MetasPredefinidas onEditar={handleEditar} />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Metas Personalizadas</h3>
        {metasPersonalizadas.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Nenhuma meta personalizada cadastrada
            </p>
            <Button onClick={handleNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira meta
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metasPersonalizadas.map((meta) => (
              <MetaCard key={meta.id} meta={meta} onEditar={handleEditar} />
            ))}
          </div>
        )}
      </div>

      <MetaForm
        open={open}
        onOpenChange={setOpen}
        initialData={metaEditando}
        metaName={editingMetaName}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
