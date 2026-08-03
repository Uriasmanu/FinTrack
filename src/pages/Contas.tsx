import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContaCard } from "@/components/contas/conta-card";
import { ContaForm } from "@/components/contas/conta-form";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Contas() {
  const { dadosAno, adicionarConta, editarConta } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const contas = dadosAno?.contas ?? [];

  function handleEditar(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function handleNovo() {
    setEditingId(null);
    setOpen(true);
  }

  function handleSubmit(data: { nome: string; banco: string; saldoInicial: number; tipo: "corrente" | "poupanca" | "investimento" }) {
    if (editingId) {
      editarConta(editingId, data);
    } else {
      adicionarConta(data);
    }
  }

  const contaEditando = editingId
    ? contas.find((c) => c.id === editingId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas</h2>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contas.map((conta) => (
          <ContaCard
            key={conta.id}
            conta={conta}
            onEditar={handleEditar}
          />
        ))}
      </div>

      {contas.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma conta cadastrada
        </p>
      )}

      <ContaForm
        open={open}
        onOpenChange={setOpen}
        initialData={contaEditando}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
