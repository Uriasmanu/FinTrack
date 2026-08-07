import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoriaCard } from "@/components/categorias/categoria-card";
import { CategoriaForm } from "@/components/categorias/categoria-form";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Configuracoes() {
  const { dados, adicionarCategoria, editarCategoria } = useFinanceStore();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const categorias = dados?.categorias ?? [];

  function handleEditar(id: string) {
    setEditandoId(id);
    setDialogAberto(true);
  }

  function handleNovo() {
    setEditandoId(null);
    setDialogAberto(true);
  }

  function handleSubmit(data: { nome: string; cor: string; icone: string; tipo: "receita" | "despesa" | "ambos" }) {
    if (editandoId) {
      editarCategoria(editandoId, data);
    } else {
      adicionarCategoria(data);
    }
    setDialogAberto(false);
    setEditandoId(null);
  }

  const categoriaEditando = editandoId
    ? categorias.find((c) => c.id === editandoId)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas categorias e configurações
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Categorias</CardTitle>
          </div>
          <Button size="sm" onClick={handleNovo}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {categorias.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma categoria cadastrada
            </p>
          ) : (
            categorias.map((categoria) => (
              <CategoriaCard
                key={categoria.id}
                categoria={categoria}
                onEditar={handleEditar}
              />
            ))
          )}
        </CardContent>
      </Card>

      <CategoriaForm
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        initialData={categoriaEditando ? { ...categoriaEditando } : undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
