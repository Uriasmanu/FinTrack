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

const dividendoSchema = z.object({
  competencia: z.string().min(1, "Competência é obrigatória"),
  dataPagamento: z.string().min(1, "Data de pagamento é obrigatória"),
  valorPorCota: z.number().min(0.01, "Valor por cota deve ser maior que 0"),
  recorrente: z.boolean(),
  tipo: z.string().optional().nullable(),
  observacoes: z.string().optional(),
});

type DividendoFormData = z.infer<typeof dividendoSchema>;

interface FiiDividendoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cotasAtuais: number;
  ticker: string;
  onSubmit: (data: Omit<DividendoFormData, "id" | "criadoEm" | "totalRecebido"> & { ativoFiiId: string; quantidadeCotas: number }) => void;
  ativoFiiId: string;
}

export function FiiDividendoForm({
  open,
  onOpenChange,
  cotasAtuais,
  ticker,
  onSubmit,
  ativoFiiId,
}: FiiDividendoFormProps) {
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
      dataPagamento: new Date().toISOString().split("T")[0],
      valorPorCota: 0,
      recorrente: true,
      tipo: "Rendimento",
      observacoes: "",
    },
  });

  const valorPorCota = watch("valorPorCota");
  const totalRecebido = valorPorCota * cotasAtuais;

  function handleFormSubmit(data: DividendoFormData) {
    onSubmit({
      ativoFiiId,
      competencia: data.competencia,
      dataPagamento: data.dataPagamento,
      valorPorCota: data.valorPorCota,
      quantidadeCotas: cotasAtuais,
      recorrente: data.recorrente,
      tipo: data.tipo ?? null,
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
          <DialogTitle>Registrar Dividendo — {ticker}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Competência</label>
              <Input type="month" {...register("competencia")} />
              {errors.competencia && (
                <p className="text-sm text-destructive">{errors.competencia.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Data de Pagamento</label>
              <Input type="date" {...register("dataPagamento")} />
              {errors.dataPagamento && (
                <p className="text-sm text-destructive">{errors.dataPagamento.message}</p>
              )}
            </div>
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
              <span className="font-medium">{cotasAtuais}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total recebido:</span>
              <span className="font-medium text-success">{formatarMoeda(totalRecebido)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de Provento</label>
            <Input {...register("tipo")} placeholder="Rendimento, Amortização..." />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("recorrente")}
              id="recorrente"
              className="rounded border-input"
            />
            <label htmlFor="recorrente" className="text-sm font-medium cursor-pointer">
              Dividendo recorrente
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Desmarque se for um ganho atípico (ex: venda de imóvel do portfólio)
          </p>

          <div>
            <label className="text-sm font-medium">Observações</label>
            <textarea
              {...register("observacoes")}
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Notas sobre o dividendo..."
            />
          </div>

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
