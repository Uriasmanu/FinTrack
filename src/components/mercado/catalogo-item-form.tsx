import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CatalogoItemMercado } from "@/types";

const catalogoItemFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  marcas: z.array(z.object({ valor: z.string() })),
});

type CatalogoItemFormData = z.infer<typeof catalogoItemFormSchema>;

interface CatalogoItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CatalogoItemMercado | null;
  onSubmit: (nomeNormalizadoAntigo: string, dados: { nome: string; marcas: string[] }) => void;
}

function valoresIniciais(item: CatalogoItemMercado | null): CatalogoItemFormData {
  return {
    nome: item?.nomeExibicao ?? "",
    marcas:
      item && item.marcas.length > 0
        ? item.marcas.map((m) => ({ valor: m }))
        : [{ valor: "" }],
  };
}

export function CatalogoItemForm({ open, onOpenChange, item, onSubmit }: CatalogoItemFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CatalogoItemFormData>({
    resolver: zodResolver(catalogoItemFormSchema),
    defaultValues: valoresIniciais(item),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "marcas" });

  useEffect(() => {
    if (open) {
      reset(valoresIniciais(item));
    }
  }, [item, reset, open]);

  function handleFormSubmit(data: CatalogoItemFormData) {
    if (!item) return;
    onSubmit(item.nomeNormalizado, {
      nome: data.nome,
      marcas: data.marcas.map((m) => m.valor),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Item do Catálogo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input {...register("nome")} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Marcas</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ valor: "" })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Marca
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder="Nome da marca"
                  {...register(`marcas.${index}.valor` as const)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma marca cadastrada.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
