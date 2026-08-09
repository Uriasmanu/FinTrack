import { useState } from "react";
import { Plus, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiiDashboard } from "@/components/investimentos/fii-dashboard";
import { FiiCard } from "@/components/investimentos/fii-card";
import { FiiForm } from "@/components/investimentos/fii-form";
import { FiiOperacaoForm } from "@/components/investimentos/fii-operacao-form";
import { FiiDividendoForm } from "@/components/investimentos/fii-dividendo-form";
import { FiiDetalhes } from "@/components/investimentos/fii-detalhes";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { AtivoFii } from "@/types";

type Aba = "carteira" | "dividendos";

export function Investimentos() {
  const {
    dados,
    adicionarAtivoFii,
    editarAtivoFii,
    excluirAtivoFii,
    adicionarOperacaoFii,
    adicionarDividendoFii,
  } = useFinanceStore();

  const [aba, setAba] = useState<Aba>("carteira");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<AtivoFii | null>(null);
  const [deleteAtivo, setDeleteAtivo] = useState<AtivoFii | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [operacaoAtivo, setOperacaoAtivo] = useState<AtivoFii | null>(null);
  const [dividendoAtivo, setDividendoAtivo] = useState<AtivoFii | null>(null);
  const [detalhesAtivo, setDetalhesAtivo] = useState<AtivoFii | null>(null);

  const ativos = dados?.ativosFii ?? [];
  const dividendos = dados?.dividendosFii ?? [];

  const ativosAtivos = ativos.filter((a) => a.ativo);

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

  function handleOperacaoSubmit(data: { ativoFiiId: string; tipo: "compra" | "venda"; data: string; quantidade: number; precoUnitario: number; taxaB3?: number | null; corretora?: string | null; observacoes?: string }) {
    adicionarOperacaoFii({
      ativoFiiId: data.ativoFiiId,
      tipo: data.tipo,
      data: data.data,
      quantidade: data.quantidade,
      precoUnitario: data.precoUnitario,
      taxaB3: data.taxaB3 ?? undefined,
      corretora: data.corretora ?? undefined,
      observacoes: data.observacoes,
    });
  }

  function handleDividendoSubmit(data: { ativoFiiId: string; competencia: string; dataPagamento: string; valorPorCota: number; quantidadeCotas: number; recorrente: boolean; tipo?: string | null; observacoes?: string }) {
    adicionarDividendoFii({
      ativoFiiId: data.ativoFiiId,
      competencia: data.competencia,
      dataPagamento: data.dataPagamento,
      valorPorCota: data.valorPorCota,
      quantidadeCotas: data.quantidadeCotas,
      recorrente: data.recorrente,
      tipo: data.tipo ?? undefined,
      observacoes: data.observacoes,
    });
  }

  const dividendosPorAtivo = ativosAtivos.map((a) => ({
    ativo: a,
    dividendos: dividendos
      .filter((d) => d.ativoFiiId === a.id)
      .sort((a, b) => b.competencia.localeCompare(a.competencia)),
  })).filter((item) => item.dividendos.length > 0);

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

      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        <Button
          variant={aba === "carteira" ? "default" : "ghost"}
          size="sm"
          onClick={() => setAba("carteira")}
          className="flex-1"
        >
          Carteira
        </Button>
        <Button
          variant={aba === "dividendos" ? "default" : "ghost"}
          size="sm"
          onClick={() => setAba("dividendos")}
          className="flex-1"
        >
          Dividendos
        </Button>
      </div>

      {aba === "carteira" && (
        <>
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
                  temVinculos={temVinculos(ativo.id)}
                  onEditar={handleEditar}
                  onExcluir={handleExcluir}
                  onOperacao={setOperacaoAtivo}
                  onDividendo={setDividendoAtivo}
                  onDetalhes={setDetalhesAtivo}
                />
              ))}
            </div>
          )}
        </>
      )}

      {aba === "dividendos" && (
        <>
          {dividendosPorAtivo.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum dividendo registrado
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {dividendosPorAtivo.map(({ ativo, dividendos: divs }) => (
                <div key={ativo.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{ativo.ticker} — {ativo.nome}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDividendoAtivo(ativo)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Novo
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {divs.map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                        <div>
                          <span className="font-medium">{d.competencia}</span>
                          <span className="text-muted-foreground ml-2">
                            {d.quantidadeCotas} cotas
                            {!d.recorrente && (
                              <span className="text-warning ml-1">· Não rec.</span>
                            )}
                          </span>
                        </div>
                        <span className="font-medium text-success">
                          {d.totalRecebido.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <FiiForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingAtivo ?? undefined}
        onSubmit={handleSubmit}
      />

      {operacaoAtivo && (
        <FiiOperacaoForm
          open={!!operacaoAtivo}
          onOpenChange={(open) => { if (!open) setOperacaoAtivo(null); }}
          tipo="compra"
          cotasAtuais={operacaoAtivo.cotasAtuais}
          ativoFiiId={operacaoAtivo.id}
          onSubmit={(data) => {
            handleOperacaoSubmit(data);
            setOperacaoAtivo(null);
          }}
        />
      )}

      {dividendoAtivo && (
        <FiiDividendoForm
          open={!!dividendoAtivo}
          onOpenChange={(open) => { if (!open) setDividendoAtivo(null); }}
          cotasAtuais={dividendoAtivo.cotasAtuais}
          ticker={dividendoAtivo.ticker}
          ativoFiiId={dividendoAtivo.id}
          onSubmit={(data) => {
            handleDividendoSubmit(data);
            setDividendoAtivo(null);
          }}
        />
      )}

      {detalhesAtivo && (
        <FiiDetalhes
          open={!!detalhesAtivo}
          onOpenChange={(open) => { if (!open) setDetalhesAtivo(null); }}
          ativo={detalhesAtivo}
        />
      )}

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
