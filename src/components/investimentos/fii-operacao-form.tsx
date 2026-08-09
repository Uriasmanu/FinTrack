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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const operacaoSchema = z.object({
  tipo: z.enum(["compra", "venda"]),
  data: z.string().min(1, "Data é obrigatória"),
  quantidade: z.number().min(1, "Quantidade deve ser no mínimo 1"),
  precoUnitario: z.number().min(0.01, "Preço deve ser maior que 0"),
  taxaB3: z.number().min(0).optional().nullable(),
  corretora: z.string().optional().nullable(),
  observacoes: z.string().optional(),
});

type OperacaoFormData = z.infer<typeof operacaoSchema>;

interface FiiOperacaoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo?: "compra" | "venda";
  cotasAtuais?: number;
  onSubmit: (data: Omit<OperacaoFormData, "id" | "criadoEm"> & { ativoFiiId: string }) => void;
  ativoFiiId: string;
}

export function FiiOperacaoForm({
  open,
  onOpenChange,
  tipo = "compra",
  cotasAtuais = 0,
  onSubmit,
  ativoFiiId,
}: FiiOperacaoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OperacaoFormData>({
    resolver: zodResolver(operacaoSchema),
    defaultValues: {
      tipo,
      data: new Date().toISOString().split("T")[0],
      quantidade: 1,
      precoUnitario: 0,
      taxaB3: null,
      corretora: null,
      observacoes: "",
    },
  });

  const tipoOperacao = watch("tipo");

  function handleFormSubmit(data: OperacaoFormData) {
    onSubmit({
      ativoFiiId,
      tipo: data.tipo,
      data: data.data,
      quantidade: data.quantidade,
      precoUnitario: data.precoUnitario,
      taxaB3: data.taxaB3 ?? null,
      corretora: data.corretora ?? null,
      observacoes: data.observacoes,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tipoOperacao === "compra" ? "Registrar Compra" : "Registrar Venda"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={tipoOperacao}
              onValueChange={(v) => setValue("tipo", v as "compra" | "venda")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compra">Compra</SelectItem>
                <SelectItem value="venda">Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoOperacao === "venda" && (
            <p className="text-sm text-muted-foreground">
              Posição atual: <span className="font-medium">{cotasAtuais}</span> cotas
            </p>
          )}

          <div>
            <label className="text-sm font-medium">Data</label>
            <Input type="date" {...register("data")} />
            {errors.data && (
              <p className="text-sm text-destructive">{errors.data.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="text-sm font-medium">Preço Unitário (R$)</label>
              <Input
                type="number"
                step="0.01"
                {...register("precoUnitario", { valueAsNumber: true })}
              />
              {errors.precoUnitario && (
                <p className="text-sm text-destructive">{errors.precoUnitario.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Taxa B3 (R$, opcional)</label>
            <Input
              type="number"
              step="0.01"
              {...register("taxaB3", { valueAsNumber: true })}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Corretora (opcional)</label>
            <Input {...register("corretora")} placeholder="Ex: XP, NuInvest..." />
          </div>

          <div>
            <label className="text-sm font-medium">Observações</label>
            <textarea
              {...register("observacoes")}
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Notas sobre a operação..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {tipoOperacao === "compra" ? "Registrar Compra" : "Registrar Venda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
