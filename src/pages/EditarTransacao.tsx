import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TransacaoForm } from "@/components/transacoes/transacao-form";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EditarTransacao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dadosAno, editarTransacao, excluirParcelasFuturas, recalcularParcelas } = useFinanceStore();

  const transacao = dadosAno?.transacoes.find((t) => t.id === id);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dadosPendentes, setDadosPendentes] = useState<Record<string, unknown> | null>(null);

  if (!transacao) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Transação não encontrada</p>
      </div>
    );
  }

  const transacaoEncontrada = transacao;
  const isRecorrente = transacaoEncontrada.tipoRecorrencia === "recorrente" || transacaoEncontrada.tipoRecorrencia === "parcelado";

  function handleSubmit(data: { descricao: string; valor: number; data: string; tipo: "receita" | "despesa"; categoriaId: string; subtipoId: string | null; contaId: string; cartaoId: string | null; tipoRecorrencia: "unica" | "recorrente" | "parcelado"; parcelaAtual: number; totalParcelas: number; confirmada: boolean }) {
    if (isRecorrente && (data.valor !== transacaoEncontrada.valor || data.data !== transacaoEncontrada.data)) {
      setDadosPendentes(data as unknown as Record<string, unknown>);
      setDialogAberto(true);
      return;
    }

    editarTransacao(transacaoEncontrada.id, {
      ...data,
      grupoParcelaId: transacaoEncontrada.grupoParcelaId,
    });
    navigate("/transacoes");
  }

  function editarSomenteEssa(data: Record<string, unknown>) {
    editarTransacao(transacaoEncontrada.id, {
      ...(data as Parameters<typeof editarTransacao>[1]),
      grupoParcelaId: transacaoEncontrada.grupoParcelaId,
    });
    navigate("/transacoes");
  }

  function editarTodas(data: Record<string, unknown>) {
    const dados = data as { valor: number; data: string; [key: string]: unknown };

    if (transacaoEncontrada.grupoParcelaId) {
      excluirParcelasFuturas(transacaoEncontrada.grupoParcelaId, transacaoEncontrada.data);

      const grupoTransacoes = (dadosAno?.transacoes ?? [])
        .filter((t) => t.grupoParcelaId === transacaoEncontrada.grupoParcelaId)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      if (grupoTransacoes.length > 1) {
        const novoTotal = grupoTransacoes.length;

        recalcularParcelas(transacaoEncontrada.grupoParcelaId, novoTotal);

        grupoTransacoes.forEach((t) => {
          editarTransacao(t.id, {
            valor: dados.valor,
          });
        });
      } else {
        grupoTransacoes.forEach((t) => {
          editarTransacao(t.id, {
            valor: dados.valor,
            data: dados.data,
          });
        });
      }
    }

    navigate("/transacoes");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Editar Transação</h2>
        <p className="text-muted-foreground">
          Altere os dados da transação
          {isRecorrente && (
            <span className="text-warning ml-1">(recorrente/parcelada)</span>
          )}
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <TransacaoForm
          initialData={transacaoEncontrada}
          onSubmit={handleSubmit}
          isEditing
        />
        <div className="flex justify-end mt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/transacoes")}>
            Cancelar
          </Button>
        </div>
      </div>

      <AlertDialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar recurrence/parcela</AlertDialogTitle>
            <AlertDialogDescription>
              Esta transação faz parte de um grupo recorrente/parcelado. Deseja alterar apenas esta ocorrência ou todas as seguintes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDadosPendentes(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => dadosPendentes && editarSomenteEssa(dadosPendentes)}>
              Só esta
            </AlertDialogAction>
            <AlertDialogAction onClick={() => dadosPendentes && editarTodas(dadosPendentes)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Todas as seguintes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
