import { useNavigate, useParams } from "react-router-dom";
import { TransacaoForm } from "@/components/transacoes/transacao-form";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function EditarTransacao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dadosAno, editarTransacao } = useFinanceStore();

  const transacao = dadosAno?.transacoes.find((t) => t.id === id);

  if (!transacao) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Transação não encontrada</p>
      </div>
    );
  }

  const transacaoEncontrada = transacao;

  function handleSubmit(data: { descricao: string; valor: number; data: string; tipo: "receita" | "despesa"; categoriaId: string; contaId: string; cartaoId: string | null; tipoRecorrencia: "unica" | "recorrente" | "parcelado"; parcelaAtual: number; totalParcelas: number }) {
    editarTransacao(transacaoEncontrada.id, {
      ...data,
      grupoParcelaId: transacaoEncontrada.grupoParcelaId,
    });
    navigate("/transacoes");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Editar Transação</h2>
        <p className="text-muted-foreground">
          Altere os dados da transação
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <TransacaoForm
          initialData={transacaoEncontrada}
          onSubmit={handleSubmit}
          isEditing
        />
      </div>
    </div>
  );
}
