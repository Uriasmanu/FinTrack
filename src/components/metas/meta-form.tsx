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
import { formatarMoeda, formatarPrazo, calcularParcelaMensal } from "@/lib/calculos";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Checkbox } from "@/components/ui/checkbox";

const metaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valorAlvo: z.number().min(0.01, "Valor deve ser maior que zero"),
  meses: z.number().min(1, "Mínimo 1 mês"),
  receitasBase: z.array(z.string()).default([]),
});

type MetaFormData = z.infer<typeof metaSchema>;

interface MetaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { id: string } & Partial<MetaFormData>;
  onSubmit: (data: MetaFormData) => void;
}

export function MetaForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: MetaFormProps) {
  const { dadosAno } = useFinanceStore();
  const categoriasReceita = dadosAno?.categorias.filter((c) => c.tipo === "receita" || c.tipo === "ambos") ?? [];

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
    },
  });

  const valorAlvo = watch("valorAlvo");
  const meses = watch("meses");
  const receitasBase = watch("receitasBase");
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
              Prazo: {formatarPrazo(meses)}
            </label>
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
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Parcela mensal</p>
            <p className="text-2xl font-bold">{formatarMoeda(parcelaMensal)}</p>
          </div>

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
