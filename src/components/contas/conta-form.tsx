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

const contaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  banco: z.string().min(1, "Banco é obrigatório"),
  saldoInicial: z.number(),
  tipo: z.enum(["corrente", "poupanca", "investimento"]),
});

type ContaFormData = z.infer<typeof contaSchema>;

interface ContaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { id: string } & Partial<ContaFormData>;
  onSubmit: (data: ContaFormData) => void;
}

export function ContaForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: ContaFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContaFormData>({
    resolver: zodResolver(contaSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      banco: initialData?.banco ?? "",
      saldoInicial: initialData?.saldoInicial ?? 0,
      tipo: initialData?.tipo ?? "corrente",
    },
  });

  function handleFormSubmit(data: ContaFormData) {
    onSubmit(data);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Conta" : "Nova Conta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input {...register("nome")} placeholder="Ex: Nubank, Itaú..." />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Banco</label>
            <Input {...register("banco")} placeholder="Ex: Bradesco, BB..." />
            {errors.banco && (
              <p className="text-sm text-destructive">{errors.banco.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Saldo Inicial (R$)</label>
            <Input
              type="number"
              step="0.01"
              {...register("saldoInicial", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={watch("tipo")}
              onValueChange={(v) => setValue("tipo", v as "corrente" | "poupanca" | "investimento")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corrente">Corrente</SelectItem>
                <SelectItem value="poupanca">Poupança</SelectItem>
                <SelectItem value="investimento">Investimento</SelectItem>
              </SelectContent>
            </Select>
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
