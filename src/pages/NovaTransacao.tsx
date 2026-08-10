import { useNavigate } from "react-router-dom";
import { TransacaoForm } from "@/components/transacoes/transacao-form";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Button } from "@/components/ui/button";

export function NovaTransacao() {
  const navigate = useNavigate();
  const { adicionarTransacao, adicionarTransacoesRecorrentes } = useFinanceStore();

  async function handleSubmit(data: { descricao: string; valor: number; data: string; tipo: "receita" | "despesa"; categoriaId: string; subtipoId: string | null; contaId: string; cartaoId: string | null; tipoRecorrencia: "unica" | "recorrente" | "recorrente_personalizado" | "parcelado"; parcelaAtual: number; totalParcelas: number; intervaloDias: number | null; confirmada: boolean }) {
    const dadosComGrupo = {
      ...data,
      grupoParcelaId: null,
    };

    if (data.tipoRecorrencia === "unica") {
      await adicionarTransacao(dadosComGrupo);
    } else {
      await adicionarTransacoesRecorrentes(dadosComGrupo);
    }
    navigate("/transacoes");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Nova Transação</h2>
        <p className="text-muted-foreground">
          Registre uma nova receita ou despesa
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <TransacaoForm onSubmit={handleSubmit} />
        <div className="flex justify-end mt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/transacoes")}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
