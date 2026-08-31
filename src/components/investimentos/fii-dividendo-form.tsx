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
import type { AtivoFii } from "@/types";

const dividendoSchema = z.object({
  competencia: z.string().min(1, "Competência é obrigatória"),
  valorPorCota: z.number().min(0, "Valor deve ser maior ou igual a 0"),
});

type DividendoFormData = z.infer<typeof dividendoSchema>;

interface FiiDividendoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ativo: AtivoFii;
  onSubmit: (data: { competencia: string; valorPorCota: number }) => void;
}

export function FiiDividendoForm({ open, onOpenChange, ativo, onSubmit }: FiiDividendoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DividendoFormData>({
    resolver: zodResolver(dividendoSchema),
    defaultValues: {
      competencia: new Date().toISOString().slice(0, 7),
      valorPorCota: ativo.valorDividendoMensal,
    },
  });

  const valorPorCota = watch("valorPorCota");
  const totalRecebido = valorPorCota * ativo.quantidadeCotas;

  function handleFormSubmit(data: DividendoFormData) {
    onSubmit(data);
    reset();
    onOpenChange(false);
  }

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const competenciasExistentes = ativo.historicoDividendos.map((h) => h.competencia);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Dividendo — {ativo.ticker}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Competência (Mês/Ano)</label>
            <Input type="month" {...register("competencia")} />
            <p className="text-xs text-muted-foreground mt-1">
              Mês de referência do dividendo
            </p>
            {errors.competencia && (
              <p className="text-sm text-destructive">{errors.competencia.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Valor por Cota (R$)</label>
            <Input
              type="number"
              step="0.01"
              {...register("valorPorCota", { valueAsNumber: true })}
            />
            {errors.valorPorCota && (
              <p className="text-sm text-destructive">{errors.valorPorCota.message}</p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cotas:</span>
              <span className="font-medium">{ativo.quantidadeCotas}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total recebido:</span>
              <span className="font-medium text-success">{formatarMoeda(totalRecebido)}</span>
            </div>
          </div>

          {competenciasExistentes.length > 0 && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-2">Competências já registradas:</p>
              <div className="flex flex-wrap gap-1">
                {competenciasExistentes.sort().reverse().map((c) => (
                  <span key={c} className="text-xs bg-background rounded px-2 py-1">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Dividendo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
