import { useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartaoCard } from "@/components/cartoes/cartao-card";
import { CartaoForm } from "@/components/cartoes/cartao-form";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Cartoes() {
  const { dados, adicionarCartao, editarCartao } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const cartoes = dados?.cartoes ?? [];

  function handleEditar(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function handleNovo() {
    setEditingId(null);
    setOpen(true);
  }

  function handleSubmit(data: {
    nome: string;
    bandeira: string;
    limite: number;
    diaFechamento: number;
    diaVencimento: number;
  }) {
    if (editingId) {
      editarCartao(editingId, data);
    } else {
      adicionarCartao(data);
    }
  }

  const cartaoEditando = editingId
    ? cartoes.find((c) => c.id === editingId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cartões</h2>
          <p className="text-muted-foreground">
            Gerencie seus cartões de crédito
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cartão
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cartoes.map((cartao) => (
          <CartaoCard
            key={cartao.id}
            cartao={cartao}
            onEditar={handleEditar}
          />
        ))}
      </div>

      {cartoes.length === 0 && (
        <div className="text-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Nenhum cartão cadastrado
          </p>
          <Button onClick={handleNovo}>
            <Plus className="mr-2 h-4 w-4" />
            Criar primeiro cartão
          </Button>
        </div>
      )}

      <CartaoForm
        open={open}
        onOpenChange={setOpen}
        initialData={cartaoEditando}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
