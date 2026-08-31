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
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { AtivoFii } from "@/types";
import { cn } from "@/lib/cn";

const fiiSchema = z.object({
  ticker: z.string().min(1, "Ticker é obrigatório").max(10),
  nome: z.string().min(1, "Nome é obrigatório"),
  precoCota: z.number().min(0.01, "Preço da cota deve ser maior que 0"),
  quantidadeCotas: z.number().min(1, "Quantidade deve ser no mínimo 1"),
  diaDividendo: z.number().min(1, "Dia deve ser entre 1 e 31").max(31, "Dia deve ser entre 1 e 31"),
  valorDividendoMensal: z.number().min(0, "Valor do dividendo deve ser maior ou igual a 0"),
  observacoes: z.string().optional(),
});

type FiiFormData = z.infer<typeof fiiSchema>;

interface FiiFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AtivoFii;
  onSubmit: (data: Omit<AtivoFii, "id" | "criadoEm" | "ativo">) => void;
}

export function FiiForm({ open, onOpenChange, initialData, onSubmit }: FiiFormProps) {
  const { dados } = useFinanceStore();
  const ativosExistentes = dados?.ativosFii ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FiiFormData>({
    resolver: zodResolver(fiiSchema),
    defaultValues: {
      ticker: initialData?.ticker ?? "",
      nome: initialData?.nome ?? "",
      precoCota: initialData?.precoCota ?? 0,
      quantidadeCotas: initialData?.quantidadeCotas ?? 1,
      diaDividendo: initialData?.diaDividendo ?? 10,
      valorDividendoMensal: initialData?.valorDividendoMensal ?? 0,
      observacoes: initialData?.observacoes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        ticker: initialData?.ticker ?? "",
        nome: initialData?.nome ?? "",
        precoCota: initialData?.precoCota ?? 0,
        quantidadeCotas: initialData?.quantidadeCotas ?? 1,
        diaDividendo: initialData?.diaDividendo ?? 10,
        valorDividendoMensal: initialData?.valorDividendoMensal ?? 0,
        observacoes: initialData?.observacoes ?? "",
      });
    }
  }, [initialData, reset, open]);

  const valorTotal = watch("precoCota") * watch("quantidadeCotas");
  const dividendoMensalTotal = watch("valorDividendoMensal") * watch("quantidadeCotas");

  function handleFormSubmit(data: FiiFormData) {
    onSubmit({
      ticker: data.ticker.toUpperCase(),
      nome: data.nome,
      precoCota: data.precoCota,
      quantidadeCotas: data.quantidadeCotas,
      diaDividendo: data.diaDividendo,
      valorDividendoMensal: data.valorDividendoMensal,
      observacoes: data.observacoes,
    });
    reset();
    onOpenChange(false);
  }

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar FII" : "Novo FII"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Ticker</label>
            <Input
              {...register("ticker")}
              placeholder="Ex: HGLG11"
              className="uppercase"
              onChange={(e) => {
                const upper = e.target.value.toUpperCase();
                setValue("ticker", upper, { shouldValidate: true });
              }}
            />
            {errors.ticker && (
              <p className="text-sm text-destructive">{errors.ticker.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input {...register("nome")} placeholder="Ex: CSHG Logística" />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Preço da Cota (R$)</label>
              <Input
                type="number"
                step="0.01"
                {...register("precoCota", { valueAsNumber: true })}
              />
              {errors.precoCota && (
                <p className="text-sm text-destructive">{errors.precoCota.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Quantidade de Cotas</label>
              <Input
                type="number"
                min="1"
                {...register("quantidadeCotas", { valueAsNumber: true })}
              />
              {errors.quantidadeCotas && (
                <p className="text-sm text-destructive">{errors.quantidadeCotas.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor Total Investido:</span>
              <span className="font-medium">{formatarMoeda(valorTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Dia do Dividendo</label>
              <Input
                type="number"
                min="1"
                max="31"
                {...register("diaDividendo", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground mt-1">Dia do mês que cai o dividendo</p>
              {errors.diaDividendo && (
                <p className="text-sm text-destructive">{errors.diaDividendo.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Dividendo por Cota (R$/mês)</label>
              <Input
                type="number"
                step="0.01"
                {...register("valorDividendoMensal", { valueAsNumber: true })}
              />
              {errors.valorDividendoMensal && (
                <p className="text-sm text-destructive">{errors.valorDividendoMensal.message}</p>
              )}
            </div>
          </div>

          {dividendoMensalTotal > 0 && (
            <div className="rounded-lg bg-success/10 border border-success/20 p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dividendo Mensal Estimado:</span>
                <span className="font-medium text-success">{formatarMoeda(dividendoMensalTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dividendo Anual Estimado:</span>
                <span className="font-medium text-success">{formatarMoeda(dividendoMensalTotal * 12)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Observações</label>
            <textarea
              {...register("observacoes")}
              rows={3}
              className={cn(
                "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              )}
              placeholder="Notas adicionais sobre o ativo..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{initialData ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
