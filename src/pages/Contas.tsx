import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContaCard } from "@/components/contas/conta-card";
import { ContaForm } from "@/components/contas/conta-form";
import { useFinanceStore } from "@/stores/useFinanceStore";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function Contas() {
  const { dadosAno, adicionarConta, editarConta } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const contas = dadosAno?.contas ?? [];
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const nomeMes = MESES[mesAtual];

  function handleEditar(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function handleNovo() {
    setEditingId(null);
    setOpen(true);
  }

  function handleSubmit(data: { banco: string; saldoInicial: number; tipo: "corrente" | "poupanca" | "investimento" | "ticket" }) {
    if (editingId) {
      editarConta(editingId, data);
    } else {
      adicionarConta(data);
    }
    setOpen(false);
    setEditingId(null);
  }

  const contaEditando = editingId
    ? contas.find((c) => c.id === editingId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            {mesAtual + 1}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Contas - {nomeMes}</h2>
            <p className="text-muted-foreground">
              Gerencie suas contas bancárias
            </p>
          </div>
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
