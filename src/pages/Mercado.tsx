import { useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MercadoDashboard } from "@/components/mercado/mercado-dashboard";
import { ItensComparacao } from "@/components/mercado/itens-comparacao";
import { CompraCard } from "@/components/mercado/compra-card";
import { CompraForm } from "@/components/mercado/compra-form";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { CompraMercado } from "@/types";

export function Mercado() {
  const { dados, adicionarCompraMercado, editarCompraMercado, excluirCompraMercado } =
    useFinanceStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCompra, setEditingCompra] = useState<CompraMercado | null>(null);
  const [deleteCompra, setDeleteCompra] = useState<CompraMercado | null>(null);

  const compras = [...(dados?.comprasMercado ?? [])].sort((a, b) => b.data.localeCompare(a.data));

  function handleNovo() {
    setEditingCompra(null);
    setFormOpen(true);
  }

  function handleEditar(compra: CompraMercado) {
    setEditingCompra(compra);
    setFormOpen(true);
  }

  function handleExcluir(compra: CompraMercado) {
    setDeleteCompra(compra);
  }

  function confirmarExclusao() {
    if (!deleteCompra) return;
    excluirCompraMercado(deleteCompra.id);
    setDeleteCompra(null);
  }

  function handleSubmit(data: Omit<CompraMercado, "id" | "criadoEm">) {
    if (editingCompra) {
      editarCompraMercado(editingCompra.id, data);
    } else {
      adicionarCompraMercado(data);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mercado</h2>
          <p className="text-muted-foreground">
            Registre suas compras e acompanhe a variação de preços
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Compra
        </Button>
      </div>

      <MercadoDashboard />

      <ItensComparacao />

      <div>
        <h3 className="text-lg font-bold mb-4">Compras</h3>
        {compras.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Nenhuma compra registrada</p>
            <Button onClick={handleNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar primeira compra
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compras.map((compra) => (
              <CompraCard
                key={compra.id}
                compra={compra}
                onEditar={handleEditar}
                onExcluir={handleExcluir}
              />
            ))}
          </div>
        )}
      </div>

      <CompraForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingCompra ?? undefined}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleteCompra}
        onOpenChange={(open) => {
          if (!open) setDeleteCompra(null);
        }}
        onConfirm={confirmarExclusao}
        title="Excluir Compra"
        description="Tem certeza que deseja excluir esta compra? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
