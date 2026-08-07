import { useState } from "react";
import { Plus, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiiCard } from "@/components/investimentos/fii-card";
import { FiiForm } from "@/components/investimentos/fii-form";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { AtivoFii } from "@/types";

export function Investimentos() {
  const {
    dados,
    adicionarAtivoFii,
    editarAtivoFii,
    excluirAtivoFii,
  } = useFinanceStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<AtivoFii | null>(null);
  const [deleteAtivo, setDeleteAtivo] = useState<AtivoFii | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const ativos = dados?.ativosFii ?? [];

  function temVinculos(ativoId: string): boolean {
    if (!dados) return false;
    const temOperacoes = dados.operacoesFii.some((o) => o.ativoFiiId === ativoId);
    const temDividendos = dados.dividendosFii.some((d) => d.ativoFiiId === ativoId);
    return temOperacoes || temDividendos;
  }

  function handleNovo() {
    setEditingAtivo(null);
    setFormOpen(true);
  }

  function handleEditar(ativo: AtivoFii) {
    setEditingAtivo(ativo);
    setFormOpen(true);
  }

  function handleExcluir(ativo: AtivoFii) {
    if (temVinculos(ativo.id)) {
      setDeleteError("Este FII possui operações ou dividendos vinculados e não pode ser excluído.");
      return;
    }
    setDeleteAtivo(ativo);
    setDeleteError(null);
  }

  function confirmarExclusao() {
    if (!deleteAtivo) return;
    try {
      excluirAtivoFii(deleteAtivo.id);
      setDeleteAtivo(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  function handleSubmit(data: Omit<AtivoFii, "id" | "criadoEm" | "cotasAtuais" | "precoMedioCompra" | "ativo">) {
    if (editingAtivo) {
      editarAtivoFii(editingAtivo.id, data);
    } else {
      adicionarAtivoFii(data);
    }
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

      {ativos.length === 0 ? (
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
          {ativos.map((ativo) => (
            <FiiCard
              key={ativo.id}
              ativo={ativo}
              temVinculos={temVinculos(ativo.id)}
              onEditar={handleEditar}
              onExcluir={handleExcluir}
            />
          ))}
        </div>
      )}

      <FiiForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingAtivo ?? undefined}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleteAtivo || !!deleteError}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteAtivo(null);
            setDeleteError(null);
          }
        }}
        onConfirm={deleteAtivo ? confirmarExclusao : () => {}}
        title={deleteError ? "Não é possível excluir" : "Excluir FII"}
        description={deleteError ?? "Tem certeza que deseja excluir este FII? Esta ação não pode ser desfeita."}
      />
    </div>
  );
}
