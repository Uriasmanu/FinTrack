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

const compraSchema = z.object({
  quantidade: z.number().min(1, "Quantidade deve ser no mínimo 1"),
  precoPago: z.number().min(0.01, "Preço deve ser maior que 0"),
});

type CompraFormData = z.infer<typeof compraSchema>;

interface FiiCompraFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ativo: AtivoFii;
  onSubmit: (data: { quantidade: number; precoPago: number }) => void;
}

export function FiiCompraForm({ open, onOpenChange, ativo, onSubmit }: FiiCompraFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      quantidade: 1,
      precoPago: ativo.precoCota,
    },
  });

  const quantidade = watch("quantidade");
  const precoPago = watch("precoPago");
  const valorTotal = quantidade * precoPago;

  function handleFormSubmit(data: CompraFormData) {
    onSubmit(data);
    reset();
    onOpenChange(false);
  }

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const novasCotas = ativo.quantidadeCotas + quantidade;
  const novoPrecoMedio = ativo.quantidadeCotas > 0
    ? ((ativo.precoCota * ativo.quantidadeCotas) + (precoPago * quantidade)) / novasCotas
    : precoPago;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comprar Cotas — {ativo.ticker}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Posição atual:</span>
              <span className="font-medium">{ativo.quantidadeCotas} cotas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preço atual:</span>
              <span className="font-medium">{formatarMoeda(ativo.precoCota)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Quantidade de Cotas</label>
              <Input
                type="number"
                min="1"
                {...register("quantidade", { valueAsNumber: true })}
              />
              {errors.quantidade && (
                <p className="text-sm text-destructive">{errors.quantidade.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Preço Pago por Cota (R$)</label>
              <Input
                type="number"
                step="0.01"
                {...register("precoPago", { valueAsNumber: true })}
              />
              {errors.precoPago && (
                <p className="text-sm text-destructive">{errors.precoPago.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor total da compra:</span>
              <span className="font-medium">{formatarMoeda(valorTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nova posição:</span>
              <span className="font-medium">{novasCotas} cotas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Novo preço médio:</span>
              <span className="font-medium">{formatarMoeda(novoPrecoMedio)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Comprar Cotas</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
