import { useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { gerarId } from "@/lib/uuid";
import {
  normalizarNomeItem,
  dataLocalISO,
  calcularSubtotalItem,
  calcularPrecoPorUnidadeBase,
  dimensaoDaUnidade,
  unidadeBaseDaDimensao,
} from "@/lib/calculos-mercado";
import type { CompraMercado, UnidadeMedida, CatalogoItemMercado } from "@/types";

const UNIDADES: UnidadeMedida[] = ["un", "kg", "g", "L", "ml"];

const ROTULO_QUANTIDADE: Record<UnidadeMedida, string> = {
  un: "Quantidade",
  kg: "Peso (kg)",
  g: "Peso (g)",
  L: "Volume (L)",
  ml: "Volume (ml)",
};

const itemSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  marca: z.string().optional(),
  unidade: z.enum(["un", "kg", "g", "L", "ml"]),
  precoUnitario: z.number().min(0.01, "Preço deve ser maior que 0"),
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que 0"),
});

const compraSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  itens: z.array(itemSchema).min(1, "Adicione ao menos um item"),
  observacoes: z.string().optional(),
});

type CompraFormData = z.infer<typeof compraSchema>;

function subtotalDoFormulario(item?: CompraFormData["itens"][number]): number {
  if (!item) return 0;
  return calcularSubtotalItem({
    unidade: item.unidade,
    precoUnitario: item.precoUnitario || 0,
    quantidade: item.quantidade || 0,
  });
}

interface CompraFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompraMercado;
  catalogo: CatalogoItemMercado[];
  onSubmit: (data: Omit<CompraMercado, "id" | "criadoEm">) => void;
}

function itemVazio() {
  return { nome: "", marca: "", unidade: "un" as UnidadeMedida, precoUnitario: 0, quantidade: 1 };
}

function valoresIniciais(initialData?: CompraMercado): CompraFormData {
  return {
    data: initialData?.data ?? dataLocalISO(),
    itens: initialData?.itens.map((i) => ({
      nome: i.nome,
      marca: i.marca ?? "",
      unidade: i.unidade ?? "un",
      precoUnitario: i.precoUnitario,
      quantidade: i.quantidade,
    })) ?? [itemVazio()],
    observacoes: initialData?.observacoes ?? "",
  };
}

export function CompraForm({ open, onOpenChange, initialData, catalogo, onSubmit }: CompraFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema),
    defaultValues: valoresIniciais(initialData),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const ultimoNomeCasado = useRef<Record<number, string>>({});

  function handleNomeBlur(index: number, valor: string) {
    const chave = normalizarNomeItem(valor);
    if (!chave || ultimoNomeCasado.current[index] === chave) return;

    const entrada = catalogo.find((c) => c.nomeNormalizado === chave);
    if (!entrada) return;

    ultimoNomeCasado.current[index] = chave;
    setValue(`itens.${index}.unidade`, entrada.ultimaUnidade);
    if (entrada.ultimaUnidade === "un") {
      setValue(`itens.${index}.precoUnitario`, entrada.ultimoPreco);
    }
  }

  useEffect(() => {
    if (open) {
      reset(valoresIniciais(initialData));
    }
  }, [initialData, reset, open]);

  const itensAtuais = watch("itens");
  const totalCompra = itensAtuais.reduce((soma, item) => soma + subtotalDoFormulario(item), 0);

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function handleFormSubmit(data: CompraFormData) {
    onSubmit({
      data: data.data,
      itens: data.itens.map((item) => ({
        id: gerarId(),
        nome: item.nome,
        marca: item.marca?.trim() ? item.marca.trim() : undefined,
        unidade: item.unidade,
        precoUnitario: item.precoUnitario,
        quantidade: item.quantidade,
      })),
      observacoes: data.observacoes,
    });
    ultimoNomeCasado.current = {};
    reset(valoresIniciais(undefined));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Compra" : "Nova Compra"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <datalist id="mercado-nomes-catalogo">
            {catalogo.map((c) => (
              <option key={c.nomeNormalizado} value={c.nomeExibicao} />
            ))}
          </datalist>

          <div>
            <label className="text-sm font-medium">Data</label>
            <Input type="date" {...register("data")} />
            {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Itens</label>

            {errors.itens?.message && (
              <p className="text-sm text-destructive">{errors.itens.message}</p>
            )}

            {fields.map((field, index) => {
              const item = itensAtuais[index];
              const subtotal = subtotalDoFormulario(item);
              const nomeAtual = item?.nome ?? "";
              const entradaCatalogo = catalogo.find(
                (c) => c.nomeNormalizado === normalizarNomeItem(nomeAtual)
              );
              const marcasSugeridas = entradaCatalogo?.marcas ?? [];
              const unidade = item?.unidade ?? "un";
              const ehUnidade = unidade === "un";
              const unidadeBase = unidadeBaseDaDimensao(dimensaoDaUnidade(unidade));
              const precoBase =
                !ehUnidade && (item?.precoUnitario ?? 0) > 0 && (item?.quantidade ?? 0) > 0
                  ? calcularPrecoPorUnidadeBase({
                      unidade,
                      precoUnitario: item.precoUnitario,
                      quantidade: item.quantidade,
                    })
                  : null;
              const ultimoPrecoBase =
                entradaCatalogo &&
                !ehUnidade &&
                dimensaoDaUnidade(entradaCatalogo.ultimaUnidade) === dimensaoDaUnidade(unidade)
                  ? entradaCatalogo.ultimoPreco
                  : null;
              const { onBlur: onBlurNomeRegistrado, ...restoRegistroNome } = register(
                `itens.${index}.nome` as const
              );

              return (
                <div key={field.id} className="rounded-lg border p-3 space-y-2">
                  <datalist id={`mercado-marcas-${index}`}>
                    {marcasSugeridas.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>

                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <div>
                        <Input
                          list="mercado-nomes-catalogo"
                          placeholder="Nome do item"
                          {...restoRegistroNome}
                          onBlur={(e) => {
                            onBlurNomeRegistrado(e);
                            handleNomeBlur(index, e.target.value);
                          }}
                        />
                        {errors.itens?.[index]?.nome && (
                          <p className="text-sm text-destructive">
                            {errors.itens[index]?.nome?.message}
                          </p>
                        )}
                      </div>
                      <Input
                        list={`mercado-marcas-${index}`}
                        placeholder="Marca (opcional)"
                        {...register(`itens.${index}.marca` as const)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Unidade</label>
                      <Select
                        value={unidade}
                        onValueChange={(v) => setValue(`itens.${index}.unidade`, v as UnidadeMedida)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIDADES.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {ROTULO_QUANTIDADE[unidade]}
                      </label>
                      <Input
                        type="number"
                        step={ehUnidade ? "1" : "0.001"}
                        {...register(`itens.${index}.quantidade` as const, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.itens?.[index]?.quantidade && (
                        <p className="text-sm text-destructive">
                          {errors.itens[index]?.quantidade?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {ehUnidade ? "Preço Unit. (R$)" : "Valor pago (R$)"}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`itens.${index}.precoUnitario` as const, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.itens?.[index]?.precoUnitario && (
                        <p className="text-sm text-destructive">
                          {errors.itens[index]?.precoUnitario?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {(precoBase !== null || ultimoPrecoBase !== null) && (
                    <p className="text-xs text-muted-foreground">
                      {precoBase !== null && `≈ ${formatarMoeda(precoBase)}/${unidadeBase}`}
                      {precoBase !== null && ultimoPrecoBase !== null && " · "}
                      {ultimoPrecoBase !== null &&
                        `último: ${formatarMoeda(ultimoPrecoBase)}/${unidadeBase}`}
                    </p>
                  )}

                  <div className="text-right text-sm text-muted-foreground">
                    Subtotal:{" "}
                    <span className="font-medium text-foreground">{formatarMoeda(subtotal)}</span>
                  </div>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append(itemVazio())}
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Item
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total da Compra:</span>
              <span className="font-bold text-primary">{formatarMoeda(totalCompra)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Observações</label>
            <Input {...register("observacoes")} placeholder="Opcional" />
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
