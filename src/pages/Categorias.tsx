import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoriaCard } from "@/components/categorias/categoria-card";
import { CategoriaForm } from "@/components/categorias/categoria-form";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Categorias() {
  const { dados, adicionarCategoria, editarCategoria } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const categorias = dados?.categorias ?? [];

  function handleEditar(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function handleNovo() {
    setEditingId(null);
    setOpen(true);
  }

  function handleSubmit(data: { nome: string; cor: string; icone: string; tipo: "receita" | "despesa" | "ambos" }) {
    if (editingId) {
      editarCategoria(editingId, data);
    } else {
      adicionarCategoria(data);
    }
  }

  const categoriaEditando = editingId
    ? categorias.find((c) => c.id === editingId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Categorias</h2>
          <p className="text-muted-foreground">
            Gerencie suas categorias de receitas e despesas
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categorias.map((categoria) => (
          <CategoriaCard
            key={categoria.id}
            categoria={categoria}
            onEditar={handleEditar}
          />
        ))}
      </div>

      {categorias.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma categoria cadastrada
        </p>
      )}

      <CategoriaForm
        open={open}
        onOpenChange={setOpen}
        initialData={categoriaEditando}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
