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
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { AtivoFii } from "@/types";
import { cn } from "@/lib/cn";

const fiiSchema = z
  .object({
    ticker: z.string().min(1, "Ticker é obrigatório").max(10),
    nome: z.string().min(1, "Nome é obrigatório"),
    tipo: z.enum(["tijolo", "papel", "fof", "misto", "fiagro", "desenvolvimento"]),
    segmento: z.string().optional().nullable(),
    perfilRisco: z.string().optional().nullable(),
    indexador: z.string().optional().nullable(),
    taxaAdm: z.number().min(0).optional().nullable(),
    valorPatrimonialCota: z.number().min(0.01, "VP deve ser maior que 0"),
    precoAtualMercado: z.number().min(0.01, "Preço de mercado deve ser maior que 0"),
    taxaRetornoDesejada: z.number().min(0.01, "Taxa deve ser maior que 0"),
    observacoes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.tipo === "tijolo" || data.tipo === "fiagro") {
        return !!data.segmento;
      }
      return true;
    },
    { message: "Segmento é obrigatório para este tipo", path: ["segmento"] }
  )
  .refine(
    (data) => {
      if (data.tipo === "papel") {
        return !!data.perfilRisco && !!data.indexador;
      }
      return true;
    },
    { message: "Perfil de Risco e Indexador são obrigatórios para Papel", path: ["perfilRisco"] }
  );

type FiiFormData = z.infer<typeof fiiSchema>;

const tiposFii = [
  { value: "tijolo", label: "Tijolo" },
  { value: "papel", label: "Papel" },
  { value: "fof", label: "FOF" },
  { value: "misto", label: "Misto" },
  { value: "fiagro", label: "Fiagro" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
];

const segmentosFii = [
  { value: "logistico", label: "Logístico" },
  { value: "lajes", label: "Lajes" },
  { value: "shopping", label: "Shopping" },
  { value: "varejo", label: "Varejo" },
  { value: "hospitalar", label: "Hospitalar" },
  { value: "educacional", label: "Educacional" },
  { value: "hotel", label: "Hotel" },
  { value: "agropecuario", label: "Agropecuário" },
  { value: "outro", label: "Outro" },
];

const perfisRisco = [
  { value: "high_grade", label: "High Grade" },
  { value: "high_yield", label: "High Yield" },
];

const indexadores = [
  { value: "ipca", label: "IPCA" },
  { value: "cdi", label: "CDI" },
  { value: "prefixado", label: "Prefixado" },
  { value: "outro", label: "Outro" },
];

interface FiiFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AtivoFii;
  onSubmit: (data: Omit<AtivoFii, "id" | "criadoEm" | "cotasAtuais" | "precoMedioCompra" | "ativo">) => void;
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
      tipo: initialData?.tipo ?? "tijolo",
      segmento: initialData?.segmento ?? null,
      perfilRisco: initialData?.perfilRisco ?? null,
      indexador: initialData?.indexador ?? null,
      taxaAdm: initialData?.taxaAdm ?? null,
      valorPatrimonialCota: initialData?.valorPatrimonialCota ?? 0,
      precoAtualMercado: initialData?.precoAtualMercado ?? 0,
      taxaRetornoDesejada: initialData?.taxaRetornoDesejada ?? 0,
      observacoes: initialData?.observacoes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        ticker: initialData?.ticker ?? "",
        nome: initialData?.nome ?? "",
        tipo: initialData?.tipo ?? "tijolo",
        segmento: initialData?.segmento ?? null,
        perfilRisco: initialData?.perfilRisco ?? null,
        indexador: initialData?.indexador ?? null,
        taxaAdm: initialData?.taxaAdm ?? null,
        valorPatrimonialCota: initialData?.valorPatrimonialCota ?? 0,
        precoAtualMercado: initialData?.precoAtualMercado ?? 0,
        taxaRetornoDesejada: initialData?.taxaRetornoDesejada ?? 0,
        observacoes: initialData?.observacoes ?? "",
      });
    }
  }, [initialData, reset, open]);

  const tipo = watch("tipo");

  function handleFormSubmit(data: FiiFormData) {
    onSubmit({
      ticker: data.ticker.toUpperCase(),
      nome: data.nome,
      tipo: data.tipo,
      segmento: (data.segmento as AtivoFii["segmento"]) ?? undefined,
      perfilRisco: (data.perfilRisco as AtivoFii["perfilRisco"]) ?? undefined,
      indexador: (data.indexador as AtivoFii["indexador"]) ?? undefined,
      taxaAdm: data.taxaAdm ?? undefined,
      valorPatrimonialCota: data.valorPatrimonialCota,
      precoAtualMercado: data.precoAtualMercado,
      taxaRetornoDesejada: data.taxaRetornoDesejada,
      observacoes: data.observacoes,
    });
    reset();
    onOpenChange(false);
  }

  const showSegmento = tipo === "tijolo" || tipo === "fiagro";
  const showPapelFields = tipo === "papel";

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

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={tipo}
              onValueChange={(v) => {
                setValue("tipo", v as FiiFormData["tipo"], { shouldValidate: true });
                if (v !== "tijolo" && v !== "fiagro") {
                  setValue("segmento", null);
                }
                if (v !== "papel") {
                  setValue("perfilRisco", null);
                  setValue("indexador", null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposFii.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showSegmento && (
            <div>
              <label className="text-sm font-medium">Segmento</label>
              <Select
                value={watch("segmento") ?? ""}
                onValueChange={(v) => setValue("segmento", v || null, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {segmentosFii.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.segmento && (
                <p className="text-sm text-destructive">{errors.segmento.message}</p>
              )}
            </div>
          )}

          {showPapelFields && (
            <>
              <div>
                <label className="text-sm font-medium">Perfil de Risco</label>
                <Select
                  value={watch("perfilRisco") ?? ""}
                  onValueChange={(v) => setValue("perfilRisco", v || null, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfisRisco.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.perfilRisco && (
                  <p className="text-sm text-destructive">{errors.perfilRisco.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Indexador</label>
                <Select
                  value={watch("indexador") ?? ""}
                  onValueChange={(v) => setValue("indexador", v || null, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {indexadores.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.indexador && (
                  <p className="text-sm text-destructive">{errors.indexador.message}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium">Taxa de Administração (%)</label>
            <Input
              type="number"
              step="0.01"
              {...register("taxaAdm", { valueAsNumber: true })}
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Valor Patrimonial por Cota (R$)</label>
            <Input
              type="number"
              step="0.01"
              {...register("valorPatrimonialCota", { valueAsNumber: true })}
            />
            {errors.valorPatrimonialCota && (
              <p className="text-sm text-destructive">{errors.valorPatrimonialCota.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Preço de Mercado Atual (R$)</label>
            <Input
              type="number"
              step="0.01"
              {...register("precoAtualMercado", { valueAsNumber: true })}
            />
            {errors.precoAtualMercado && (
              <p className="text-sm text-destructive">{errors.precoAtualMercado.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Taxa de Retorno Anual Desejada (%)</label>
            <Input
              type="number"
              step="0.01"
              {...register("taxaRetornoDesejada", { valueAsNumber: true })}
            />
            {errors.taxaRetornoDesejada && (
              <p className="text-sm text-destructive">{errors.taxaRetornoDesejada.message}</p>
            )}
          </div>

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
