import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatarMoeda, formatarPrazo, calcularParcelaMensal } from "@/lib/calculos";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Checkbox } from "@/components/ui/checkbox";
import type { TipoConta } from "@/types";

const labelTipoConta: Record<TipoConta, string> = {
  corrente: "Corrente",
  poupanca: "Poupança",
  investimento: "Investimento",
  ticket: "Ticket (Mercado)",
};

const metaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valorAlvo: z.number().min(0.01, "Valor deve ser maior que zero"),
  meses: z.number().min(1, "Mínimo 1 mês"),
  receitasBase: z.array(z.string()).default([]),
  contaId: z.string().optional(),
  percentual: z.number().min(0).max(100).optional(),
});

type MetaFormData = z.infer<typeof metaSchema>;

interface MetaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { id: string } & Partial<MetaFormData>;
  metaName?: string;
  metaType?: "padrao" | "personalizado";
  onSubmit: (data: MetaFormData) => void;
}

export function MetaForm({
  open,
  onOpenChange,
  initialData,
  metaName,
  metaType,
  onSubmit,
}: MetaFormProps) {
  const { dados } = useFinanceStore();
  const categoriasReceita = dados?.categorias.filter((c) => c.tipo === "receita" || c.tipo === "ambos") ?? [];
  const contas = dados?.contas ?? [];

  const usaPercentual = metaName === "Guardar por Mes" || metaName === "Conta Fixa" || metaName === "Lazer";
  const isPadrao = metaType === "padrao";
  const isPersonalizado = !isPadrao;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MetaFormData>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      valorAlvo: initialData?.valorAlvo ?? 0,
      meses: initialData?.meses ?? 12,
      receitasBase: initialData?.receitasBase ?? [],
      contaId: initialData?.contaId ?? "",
      percentual: initialData?.percentual ?? 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nome: initialData.nome ?? "",
        valorAlvo: initialData.valorAlvo ?? 0,
        meses: initialData.meses ?? 12,
        receitasBase: initialData.receitasBase ?? [],
        contaId: initialData.contaId ?? "",
        percentual: initialData.percentual ?? 0,
      });
    } else {
      reset({
        nome: "",
        valorAlvo: 0,
        meses: 12,
        receitasBase: [],
        contaId: "",
        percentual: 0,
      });
    }
  }, [initialData, reset]);

  const valorAlvo = watch("valorAlvo");
  const meses = watch("meses");
  const receitasBase = watch("receitasBase");
  const contaId = watch("contaId");
  const percentual = watch("percentual");
  const parcelaMensal = calcularParcelaMensal(valorAlvo || 0, meses || 1);

  function handleFormSubmit(data: MetaFormData) {
    onSubmit(data);
    reset();
    onOpenChange(false);
  }

  function toggleReceitaBase(categoriaId: string) {
    const atual = receitasBase ?? [];
    const novo = atual.includes(categoriaId)
      ? atual.filter((id) => id !== categoriaId)
      : [...atual, categoriaId];
    setValue("receitasBase", novo);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Meta" : "Nova Meta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input {...register("nome")} placeholder="Ex: Viagem, Carro..." />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Valor Alvo (R$)</label>
            <Input
              type="number"
              step="0.01"
              {...register("valorAlvo", { valueAsNumber: true })}
            />
            {errors.valorAlvo && (
              <p className="text-sm text-destructive">{errors.valorAlvo.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              {usaPercentual ? `Percentual: ${percentual ?? 0}%` : `Prazo: ${formatarPrazo(meses)}`}
            </label>
            {usaPercentual ? (
              <>
                <Slider
                  value={[percentual ?? 0]}
                  onValueChange={(v) => setValue("percentual", v[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1%</span>
                  <span>100%</span>
                </div>
              </>
            ) : (
              <>
                <Slider
                  value={[meses]}
                  onValueChange={(v) => setValue("meses", v[0])}
                  min={1}
                  max={120}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 mês</span>
                  <span>10 anos</span>
                </div>
              </>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Parcela mensal</p>
            <p className="text-2xl font-bold">{formatarMoeda(parcelaMensal)}</p>
          </div>

          {isPersonalizado ? (
            <div>
              <label className="text-sm font-medium">Conta bancária para monitorar</label>
              <p className="text-xs text-muted-foreground mb-2">
                Selecione a conta cujo saldo será usado para calcular o progresso da meta
              </p>
              {contas.length > 0 ? (
              <Select value={contaId || undefined} onValueChange={(v) => setValue("contaId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.banco} ({labelTipoConta[conta.tipo]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Cadastre uma conta bancária primeiro em <strong>Contas</strong>.
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">Receitas base para cálculo</label>
              <p className="text-xs text-muted-foreground mb-2">
                Selecione as categorias de receita usadas como base para calcular o valor da meta
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {categoriasReceita.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={(receitasBase ?? []).includes(cat.id)}
                      onCheckedChange={() => toggleReceitaBase(cat.id)}
                    />
                    <span className="text-sm">{cat.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
