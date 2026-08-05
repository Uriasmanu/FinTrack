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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const cartaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  bandeira: z.string().min(1, "Bandeira é obrigatória"),
  limite: z.number().min(0, "Limite deve ser maior ou igual a zero"),
  diaFechamento: z.number().min(1).max(31),
  diaVencimento: z.number().min(1).max(31),
});

type CartaoFormData = z.infer<typeof cartaoSchema>;

interface CartaoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { id: string } & Partial<CartaoFormData>;
  onSubmit: (data: CartaoFormData) => void;
}

export function CartaoForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: CartaoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CartaoFormData>({
    resolver: zodResolver(cartaoSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      bandeira: initialData?.bandeira ?? "Visa",
      limite: initialData?.limite ?? 0,
      diaFechamento: initialData?.diaFechamento ?? 1,
      diaVencimento: initialData?.diaVencimento ?? 10,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nome: initialData.nome ?? "",
        bandeira: initialData.bandeira ?? "Visa",
        limite: initialData.limite ?? 0,
        diaFechamento: initialData.diaFechamento ?? 1,
        diaVencimento: initialData.diaVencimento ?? 10,
      });
    }
  }, [initialData, reset]);

  function handleFormSubmit(data: CartaoFormData) {
    onSubmit(data);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Cartão" : "Novo Cartão"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input {...register("nome")} placeholder="Ex: Nubank, Inter..." />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Bandeira</label>
            <Select
              value={watch("bandeira")}
              onValueChange={(v) => setValue("bandeira", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
                <SelectItem value="Elo">Elo</SelectItem>
                <SelectItem value="Amex">Amex</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Limite (R$)</label>
            <Input
              type="number"
              step="0.01"
              {...register("limite", { valueAsNumber: true })}
            />
            {errors.limite && (
              <p className="text-sm text-destructive">{errors.limite.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Dia Fechamento</label>
              <Input
                type="number"
                min="1"
                max="31"
                {...register("diaFechamento", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Dia Vencimento</label>
              <Input
                type="number"
                min="1"
                max="31"
                {...register("diaVencimento", { valueAsNumber: true })}
              />
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
