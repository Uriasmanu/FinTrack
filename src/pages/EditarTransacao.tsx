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
import { criarTransacoesRecorrentes } from "@/lib/transacoes";

function adicionarDias(dataISO: string, dias: number): string {
  const d = new Date(dataISO + "T00:00:00");
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function EditarTransacao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dados, editarTransacao, excluirTransacao, adicionarTransacoesRecorrentes } = useFinanceStore();

  const transacao = dados?.transacoes.find((t) => t.id === id);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dadosPendentes, setDadosPendentes] = useState<Record<string, unknown> | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  if (!transacao) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Transação não encontrada</p>
      </div>
    );
  }

  const transacaoEncontrada = transacao;
  const isRecorrente = transacaoEncontrada.tipoRecorrencia === "recorrente" || transacaoEncontrada.tipoRecorrencia === "recorrente_personalizado" || transacaoEncontrada.tipoRecorrencia === "parcelado";

  async function handleSubmit(data: { descricao: string; valor: number; data: string; tipo: "receita" | "despesa"; categoriaId: string; subtipoId: string | null; contaId: string; cartaoId: string | null; tipoRecorrencia: "unica" | "recorrente" | "recorrente_personalizado" | "parcelado"; parcelaAtual: number; totalParcelas: number; intervaloDias: number | null; confirmada: boolean }) {
    setErroSalvar(null);
    const mudouParaRecorrente = transacaoEncontrada.tipoRecorrencia === "unica" &&
      (data.tipoRecorrencia === "recorrente" || data.tipoRecorrencia === "recorrente_personalizado" || data.tipoRecorrencia === "parcelado");

    try {
      if (mudouParaRecorrente) {
        await excluirTransacao(transacaoEncontrada.id);
        await adicionarTransacoesRecorrentes({
          tipo: data.tipo,
          tipoRecorrencia: data.tipoRecorrencia,
          descricao: data.descricao,
          valor: data.valor,
          data: data.data,
          categoriaId: data.categoriaId,
          subtipoId: data.subtipoId,
          contaId: data.contaId,
          cartaoId: data.cartaoId,
          parcelaAtual: data.parcelaAtual,
          totalParcelas: data.totalParcelas,
          intervaloDias: data.intervaloDias,
          grupoParcelaId: null,
          confirmada: data.confirmada,
        });
        navigate("/transacoes");
        return;
      }

      const mudouParaUnica = transacaoEncontrada.tipoRecorrencia !== "unica" && data.tipoRecorrencia === "unica";

      if (mudouParaUnica && transacaoEncontrada.grupoParcelaId) {
        const grupoTransacoes = (dados?.transacoes ?? [])
          .filter((t) => t.grupoParcelaId === transacaoEncontrada.grupoParcelaId);

        const idsParaExcluir = new Set(
          grupoTransacoes.filter((t) => t.id !== transacaoEncontrada.id).map((t) => t.id)
        );

        const transacoesAtualizadas = dados!.transacoes
          .filter((t) => !idsParaExcluir.has(t.id))
          .map((t) =>
            t.id === transacaoEncontrada.id
              ? { ...t, ...data, grupoParcelaId: null }
              : t
          );

        useFinanceStore.setState({
          dados: { ...dados!, transacoes: transacoesAtualizadas },
        });
        await useFinanceStore.getState().salvarEstado();
        navigate("/transacoes");
        return;
      }

      if (isRecorrente && (
        data.valor !== transacaoEncontrada.valor ||
        data.data !== transacaoEncontrada.data ||
        data.categoriaId !== transacaoEncontrada.categoriaId ||
        data.subtipoId !== transacaoEncontrada.subtipoId ||
        data.parcelaAtual !== transacaoEncontrada.parcelaAtual ||
        data.totalParcelas !== transacaoEncontrada.totalParcelas
      )) {
        setDadosPendentes(data as unknown as Record<string, unknown>);
        setDialogAberto(true);
        return;
      }

      await editarTransacao(transacaoEncontrada.id, {
        ...data,
        grupoParcelaId: transacaoEncontrada.grupoParcelaId,
      });
      navigate("/transacoes");
    } catch (erro) {
      setErroSalvar(erro instanceof Error ? erro.message : "Erro ao salvar transação");
    }
  }

  async function editarSomenteEssa(data: Record<string, unknown>) {
    setErroSalvar(null);
    try {
      const dadosEditados = { ...(data as Parameters<typeof editarTransacao>[1]) };

      const novaParcelaAtual = dadosEditados.parcelaAtual as number | undefined;
      const novoTotalParcelas = dadosEditados.totalParcelas as number | undefined;
      const mudouNumeroParcela =
        transacaoEncontrada.tipoRecorrencia === "parcelado" &&
        ((novaParcelaAtual !== undefined && novaParcelaAtual !== transacaoEncontrada.parcelaAtual) ||
          (novoTotalParcelas !== undefined && novoTotalParcelas !== transacaoEncontrada.totalParcelas));

      if (mudouNumeroParcela) {
        const descricaoBase = ((dadosEditados.descricao as string | undefined) ?? transacaoEncontrada.descricao).replace(/\s\d+\/\d+$/, "");
        dadosEditados.descricao = `${descricaoBase} ${novaParcelaAtual ?? transacaoEncontrada.parcelaAtual}/${novoTotalParcelas ?? transacaoEncontrada.totalParcelas}`;
      }

      await editarTransacao(transacaoEncontrada.id, {
        ...dadosEditados,
        grupoParcelaId: transacaoEncontrada.grupoParcelaId,
      });
      navigate("/transacoes");
    } catch (erro) {
      setErroSalvar(erro instanceof Error ? erro.message : "Erro ao salvar transação");
    }
  }

  async function editarTodas(data: Record<string, unknown>) {
    setErroSalvar(null);
    const novosDados = data as {
      valor?: number;
      data?: string;
      categoriaId?: string;
      subtipoId?: string | null;
      parcelaAtual?: number;
      totalParcelas?: number;
      descricao?: string;
    };
    const grupoId = transacaoEncontrada.grupoParcelaId;

    try {
      if (grupoId) {
        const transacoesAtuais = useFinanceStore.getState().dados?.transacoes ?? [];
        const grupoTransacoes = transacoesAtuais
          .filter((t) => t.grupoParcelaId === grupoId)
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

        const mudouParcelaAtual =
          novosDados.parcelaAtual !== undefined &&
          novosDados.parcelaAtual !== transacaoEncontrada.parcelaAtual;

        if (mudouParcelaAtual && transacaoEncontrada.tipoRecorrencia === "parcelado") {
          const novaParcelaAtual = novosDados.parcelaAtual!;
          const totalParcelas = novosDados.totalParcelas ?? transacaoEncontrada.totalParcelas;
          const parcelaAntiga = transacaoEncontrada.parcelaAtual;
          const diffParcelas = novaParcelaAtual - parcelaAntiga;

          const dataBase = new Date((novosDados.data ?? transacaoEncontrada.data) + "T00:00:00");
          dataBase.setMonth(dataBase.getMonth() - (parcelaAntiga - 1));
          dataBase.setMonth(dataBase.getMonth() + (novaParcelaAtual - 1));
          const novaDataInicio = `${dataBase.getFullYear()}-${String(dataBase.getMonth() + 1).padStart(2, "0")}-${String(dataBase.getDate()).padStart(2, "0")}`;

          const transacoesAnteriores = grupoTransacoes.filter(
            (t) => t.parcelaAtual < novaParcelaAtual
          );

          const idsGrupo = new Set(grupoTransacoes.map((t) => t.id));
          const transacoesForaDoGrupo = transacoesAtuais.filter((t) => !idsGrupo.has(t.id));

          const novasParcelas = criarTransacoesRecorrentes({
            tipo: transacaoEncontrada.tipo,
            descricao: transacaoEncontrada.descricao.replace(/\s\d+\/\d+$/, ""),
            valor: novosDados.valor ?? transacaoEncontrada.valor,
            dataInicio: novaDataInicio,
            categoriaId: novosDados.categoriaId ?? transacaoEncontrada.categoriaId,
            subtipoId: novosDados.subtipoId !== undefined ? novosDados.subtipoId : transacaoEncontrada.subtipoId,
            contaId: transacaoEncontrada.contaId,
            cartaoId: transacaoEncontrada.cartaoId,
            tipoRecorrencia: "parcelado",
            parcelaAtual: novaParcelaAtual,
            totalParcelas,
          });

          const transacoesFinalizadas = [...transacoesForaDoGrupo, ...transacoesAnteriores, ...novasParcelas];

          useFinanceStore.setState({
            dados: { ...useFinanceStore.getState().dados!, transacoes: transacoesFinalizadas },
          });
          await useFinanceStore.getState().salvarEstado();
          navigate("/transacoes");
          return;
        }

        const transacoesNoGrupoAposData = grupoTransacoes.filter(
          (t) => t.data >= transacaoEncontrada.data
        );

        const diffDias =
          novosDados.data && novosDados.data !== transacaoEncontrada.data
            ? Math.round(
                (new Date(novosDados.data + "T00:00:00").getTime() -
                  new Date(transacaoEncontrada.data + "T00:00:00").getTime()) /
                  86400000
              )
            : 0;

        const novoValor = novosDados.valor ?? transacaoEncontrada.valor;
        const novaCategoria = novosDados.categoriaId ?? transacaoEncontrada.categoriaId;
        const novoSubtipo = novosDados.subtipoId !== undefined ? novosDados.subtipoId : transacaoEncontrada.subtipoId;

        const idsSet = new Set(transacoesNoGrupoAposData.map((t) => t.id));
        const transacoesAtualizadas = transacoesAtuais.map((t) => {
          if (!idsSet.has(t.id)) return t;
          return {
            ...t,
            valor: novoValor,
            data: diffDias !== 0 ? adicionarDias(t.data, diffDias) : t.data,
            categoriaId: novaCategoria,
            subtipoId: novoSubtipo,
          };
        });

        useFinanceStore.setState({
          dados: { ...useFinanceStore.getState().dados!, transacoes: transacoesAtualizadas },
        });
        await useFinanceStore.getState().salvarEstado();
      }

      navigate("/transacoes");
    } catch (erro) {
      setErroSalvar(erro instanceof Error ? erro.message : "Erro ao salvar transações");
    }
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

      {erroSalvar && (
        <div className="border border-destructive bg-destructive/5 rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-destructive">Erro ao salvar</p>
          <p className="text-sm text-muted-foreground">
            {erroSalvar}. Suas alterações não foram persistidas.
          </p>
        </div>
      )}

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
            <AlertDialogAction onClick={async () => { if (dadosPendentes) await editarSomenteEssa(dadosPendentes); }}>
              Só esta
            </AlertDialogAction>
            <AlertDialogAction onClick={async () => { if (dadosPendentes) await editarTodas(dadosPendentes); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Todas as seguintes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
