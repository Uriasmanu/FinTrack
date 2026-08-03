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

const categoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cor: z.string().min(1, "Cor é obrigatória"),
  icone: z.string().min(1, "Ícone é obrigatório"),
  tipo: z.enum(["receita", "despesa", "ambos"]),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { id: string } & Partial<CategoriaFormData>;
  onSubmit: (data: CategoriaFormData) => void;
}

const cores = [
  { nome: "Vermelho", valor: "#EF4444" },
  { nome: "Laranja", valor: "#F97316" },
  { nome: "Amarelo", valor: "#EAB308" },
  { nome: "Verde", valor: "#22C55E" },
  { nome: "Ciano", valor: "#06B6D4" },
  { nome: "Azul", valor: "#3B82F6" },
  { nome: "Índigo", valor: "#6366F1" },
  { nome: "Roxo", valor: "#8B5CF6" },
  { nome: "Rosa", valor: "#EC4899" },
  { nome: "Cinza", valor: "#6B7280" },
];

export function CategoriaForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: CategoriaFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      cor: initialData?.cor ?? "#3B82F6",
      icone: initialData?.icone ?? "Circle",
      tipo: initialData?.tipo ?? "ambos",
    },
  });

  function handleFormSubmit(data: CategoriaFormData) {
    onSubmit(data);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input {...register("nome")} placeholder="Ex: Alimentação" />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Cor</label>
            <div className="flex gap-2 mt-2">
              {cores.map((cor) => (
                <button
                  key={cor.valor}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    watch("cor") === cor.valor
                      ? "border-foreground"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: cor.valor }}
                  onClick={() => setValue("cor", cor.valor)}
                />
              ))}
            </div>
            {errors.cor && (
              <p className="text-sm text-destructive">{errors.cor.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={watch("tipo")}
              onValueChange={(v) => setValue("tipo", v as "receita" | "despesa" | "ambos")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
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
