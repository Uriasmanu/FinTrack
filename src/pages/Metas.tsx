import { useState } from "react";
import { Plus, Target, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetasPredefinidas } from "@/components/metas/metas-predefinidas";
import { MetaCard } from "@/components/metas/meta-card";
import { MetaForm } from "@/components/metas/meta-form";
import { AccordionItem } from "@/components/ui/collapsible";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Metas() {
  const { dados, adicionarMeta, editarMeta, obterSaldoConta } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOverrides, setEditingOverrides] = useState<{ valorAlvo?: number; meses?: number; percentual?: number | null } | null>(null);
  const [editingMetaName, setEditingMetaName] = useState<string | undefined>(undefined);
  const [editingMetaType, setEditingMetaType] = useState<"padrao" | "personalizado" | undefined>(undefined);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const todasPersonalizadas = dados?.metas.filter((m) => m.tipo === "personalizado") ?? [];
  const metasAtivas = todasPersonalizadas.filter((m) => m.ativo);
  const metasDesabilitadas = todasPersonalizadas.filter((m) => !m.ativo);

  function handleEditar(id: string, overrides?: { valorAlvo?: number; meses?: number; percentual?: number | null }, metaName?: string, metaType?: "padrao" | "personalizado") {
    setEditingId(id);
    setEditingOverrides(overrides ?? null);
    setEditingMetaName(metaName);
    setEditingMetaType(metaType);
    setOpen(true);
  }

  function handleNovo() {
    setEditingId(null);
    setEditingOverrides(null);
    setEditingMetaType("personalizado");
    setOpen(true);
  }

  function handleSubmit(data: { nome: string; valorAlvo: number; meses: number; receitasBase: string[]; contaId?: string }) {
    const hoje = new Date();
    const dataInicio = hoje.toISOString().split("T")[0];
    const dataFim = new Date(
      hoje.getFullYear() + Math.floor(data.meses / 12),
      hoje.getMonth() + (data.meses % 12),
      hoje.getDate()
    )
      .toISOString()
      .split("T")[0];

    const parcelaMensal = data.valorAlvo / data.meses;

    if (editingId) {
      editarMeta(editingId, {
        ...data,
        dataFim,
        parcelaMensal,
      });
    } else {
      adicionarMeta({
        ...data,
        tipo: "personalizado",
        ativo: true,
        valorAtual: 0,
        dataInicio,
        dataFim,
        parcelaMensal,
        status: "em_andamento",
        receitasBase: data.receitasBase ?? [],
        contaId: data.contaId,
      });
    }
  }

  const metaEditando = editingId
    ? {
        ...dados?.metas.find((m) => m.id === editingId),
        ...(editingOverrides?.valorAlvo !== undefined && { valorAlvo: editingOverrides.valorAlvo }),
        ...(editingOverrides?.meses !== undefined && { meses: editingOverrides.meses }),
        ...(editingOverrides?.percentual !== undefined && { percentual: editingOverrides.percentual }),
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Metas</h2>
          <p className="text-muted-foreground">
            Acompanhe seus objetivos financeiros
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <MetasPredefinidas onEditar={handleEditar} />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Metas Personalizadas</h3>
        {todasPersonalizadas.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Nenhuma meta personalizada cadastrada
            </p>
            <Button onClick={handleNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira meta
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {metasAtivas.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {metasAtivas.map((meta) => (
                  <MetaCard
                    key={meta.id}
                    meta={meta}
                    valorAtualCalculado={meta.contaId ? obterSaldoConta(meta.contaId) : null}
                    onEditar={handleEditar}
                  />
                ))}
              </div>
            )}

            {metasAtivas.length === 0 && metasDesabilitadas.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <EyeOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Todas as metas estão desabilitadas.</p>
                <p className="text-xs mt-1">Expanda abaixo para habilitar ou visualizar.</p>
              </div>
            )}

            {metasDesabilitadas.length > 0 && (
              <AccordionItem
                open={accordionOpen}
                onOpenChange={setAccordionOpen}
                triggerLabel={
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    Metas Desabilitadas
                  </span>
                }
                count={metasDesabilitadas.length}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {metasDesabilitadas.map((meta) => (
                    <MetaCard
                      key={meta.id}
                      meta={meta}
                      valorAtualCalculado={meta.contaId ? obterSaldoConta(meta.contaId) : null}
                      onEditar={handleEditar}
                    />
                  ))}
                </div>
              </AccordionItem>
            )}
          </div>
        )}
      </div>

      <MetaForm
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setEditingId(null);
            setEditingOverrides(null);
            setEditingMetaName(undefined);
            setEditingMetaType(undefined);
          }
        }}
        initialData={metaEditando}
        metaName={editingMetaName}
        metaType={editingMetaType}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
