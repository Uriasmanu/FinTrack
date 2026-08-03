import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetasPredefinidas } from "@/components/metas/metas-predefinidas";
import { MetaCard } from "@/components/metas/meta-card";
import { MetaForm } from "@/components/metas/meta-form";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Metas() {
  const { dadosAno, adicionarMeta, editarMeta } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const metasPersonalizadas = dadosAno?.metas.filter((m) => m.tipo === "personalizado") ?? [];

  function handleEditar(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function handleNovo() {
    setEditingId(null);
    setOpen(true);
  }

  function handleSubmit(data: { nome: string; valorAlvo: number; meses: number }) {
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
      });
    }
  }

  const metaEditando = editingId
    ? dadosAno?.metas.find((m) => m.id === editingId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          <p className="text-center text-muted-foreground py-8">
            Nenhuma meta personalizada cadastrada
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        onSubmit={handleSubmit}
      />
    </div>
  );
}
