import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CatalogoLista } from "@/components/mercado/catalogo-lista";
import { CatalogoItemForm } from "@/components/mercado/catalogo-item-form";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { CatalogoItemMercado } from "@/types";

export function MercadoCatalogo() {
  const navigate = useNavigate();
  const { dados, editarItemCatalogoMercado, excluirItemCatalogoMercado } = useFinanceStore();

  const [editingItem, setEditingItem] = useState<CatalogoItemMercado | null>(null);
  const [deleteItem, setDeleteItem] = useState<CatalogoItemMercado | null>(null);

  function handleEditar(item: CatalogoItemMercado) {
    setEditingItem(item);
  }

  function handleExcluir(item: CatalogoItemMercado) {
    setDeleteItem(item);
  }

  function confirmarExclusao() {
    if (!deleteItem) return;
    excluirItemCatalogoMercado(deleteItem.nomeNormalizado);
    setDeleteItem(null);
  }

  function handleSubmit(
    nomeNormalizadoAntigo: string,
    dadosItem: { nome: string; marcas: string[] }
  ) {
    editarItemCatalogoMercado(nomeNormalizadoAntigo, dadosItem);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/mercado")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Itens</h2>
          <p className="text-muted-foreground">
            Itens e marcas já cadastrados em compras, usados para sugestão e pré-preenchimento
          </p>
        </div>
      </div>

      <CatalogoLista
        catalogo={dados?.catalogoMercado ?? []}
        onEditar={handleEditar}
        onExcluir={handleExcluir}
      />

      <CatalogoItemForm
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
        onConfirm={confirmarExclusao}
        title="Excluir Item do Catálogo"
        description="Tem certeza que deseja excluir este item do catálogo? Ele não será mais sugerido ao digitar uma nova compra. Isso não afeta compras já registradas."
      />
    </div>
  );
}
