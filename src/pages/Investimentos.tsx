import { useState } from "react";
import { Plus, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiiDashboard } from "@/components/investimentos/fii-dashboard";
import { FiiCard } from "@/components/investimentos/fii-card";
import { FiiForm } from "@/components/investimentos/fii-form";
import { FiiCompraForm } from "@/components/investimentos/fii-compra-form";
import { FiiMensalChart } from "@/components/investimentos/fii-mensal-chart";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { AtivoFii } from "@/types";

export function Investimentos() {
  const {
    dados,
    adicionarAtivoFii,
    editarAtivoFii,
    excluirAtivoFii,
    comprarCotasFii,
  } = useFinanceStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<AtivoFii | null>(null);
  const [deleteAtivo, setDeleteAtivo] = useState<AtivoFii | null>(null);
  const [compraAtivo, setCompraAtivo] = useState<AtivoFii | null>(null);

  const ativos = dados?.ativosFii ?? [];
  const ativosAtivos = ativos.filter((a) => a.ativo);

  function handleNovo() {
    setEditingAtivo(null);
    setFormOpen(true);
  }

  function handleEditar(ativo: AtivoFii) {
    setEditingAtivo(ativo);
    setFormOpen(true);
  }

  function handleExcluir(ativo: AtivoFii) {
    setDeleteAtivo(ativo);
  }

  function handleComprar(ativo: AtivoFii) {
    setCompraAtivo(ativo);
  }

  function confirmarExclusao() {
    if (!deleteAtivo) return;
    excluirAtivoFii(deleteAtivo.id);
    setDeleteAtivo(null);
  }

  function handleSubmit(data: Omit<AtivoFii, "id" | "criadoEm" | "ativo">) {
    if (editingAtivo) {
      editarAtivoFii(editingAtivo.id, data);
    } else {
      adicionarAtivoFii(data);
    }
  }

  function handleCompraSubmit(data: { quantidade: number; precoPago: number }) {
    if (!compraAtivo) return;
    comprarCotasFii(compraAtivo.id, data.quantidade, data.precoPago);
    setCompraAtivo(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Investimentos</h2>
          <p className="text-muted-foreground">
            Gerencie seus Fundos de Investimento Imobiliário
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo FII
        </Button>
      </div>

      <FiiDashboard />

      <FiiMensalChart ativos={ativosAtivos} />

      <div>
        <h3 className="text-lg font-bold mb-4">Meus FIIs</h3>
        {ativosAtivos.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <Landmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Nenhum FII cadastrado
            </p>
            <Button onClick={handleNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar primeiro FII
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ativosAtivos.map((ativo) => (
              <FiiCard
                key={ativo.id}
                ativo={ativo}
                onEditar={handleEditar}
                onExcluir={handleExcluir}
                onComprar={handleComprar}
              />
            ))}
          </div>
        )}
      </div>

      <FiiForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingAtivo ?? undefined}
        onSubmit={handleSubmit}
      />

      {compraAtivo && (
        <FiiCompraForm
          open={!!compraAtivo}
          onOpenChange={(open) => { if (!open) setCompraAtivo(null); }}
          ativo={compraAtivo}
          onSubmit={handleCompraSubmit}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteAtivo}
        onOpenChange={(open) => { if (!open) setDeleteAtivo(null); }}
        onConfirm={confirmarExclusao}
        title="Excluir FII"
        description="Tem certeza que deseja excluir este FII? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
