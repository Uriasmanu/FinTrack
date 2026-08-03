import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { TipoRecorrencia } from "@/types";

const transacaoSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  data: z.string().min(1, "Data é obrigatória"),
  tipo: z.enum(["receita", "despesa"]),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  contaId: z.string().min(1, "Conta é obrigatória"),
  cartaoId: z.string().nullable(),
  tipoRecorrencia: z.enum(["unica", "recorrente", "parcelado"]),
  parcelaAtual: z.number().min(1),
  totalParcelas: z.number().min(1),
});

type TransacaoFormData = z.infer<typeof transacaoSchema>;

interface TransacaoFormProps {
  initialData?: Partial<TransacaoFormData>;
  onSubmit: (data: TransacaoFormData) => void;
  isEditing?: boolean;
}

export function TransacaoForm({
  initialData,
  onSubmit,
  isEditing = false,
}: TransacaoFormProps) {
  const { dadosAno } = useFinanceStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
    defaultValues: {
      descricao: initialData?.descricao ?? "",
      valor: initialData?.valor ?? 0,
      data: initialData?.data ?? new Date().toISOString().split("T")[0],
      tipo: initialData?.tipo ?? "despesa",
      categoriaId: initialData?.categoriaId ?? "",
      contaId: initialData?.contaId ?? "",
      cartaoId: initialData?.cartaoId ?? null,
      tipoRecorrencia: initialData?.tipoRecorrencia ?? "unica",
      parcelaAtual: initialData?.parcelaAtual ?? 1,
      totalParcelas: initialData?.totalParcelas ?? 1,
    },
  });

  const tipo = watch("tipo");
  const tipoRecorrencia = watch("tipoRecorrencia");
  const categorias = dadosAno?.categorias.filter(
    (c) => c.tipo === tipo || c.tipo === "ambos"
  ) ?? [];
  const contas = dadosAno?.contas ?? [];
  const cartoes = dadosAno?.cartoes ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium">Descrição</label>
          <Input {...register("descricao")} placeholder="Ex: Salário, Aluguel..." />
          {errors.descricao && (
            <p className="text-sm text-destructive">{errors.descricao.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Valor (R$)</label>
          <Input
            type="number"
            step="0.01"
            {...register("valor", { valueAsNumber: true })}
          />
          {errors.valor && (
            <p className="text-sm text-destructive">{errors.valor.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Data</label>
          <Input type="date" {...register("data")} />
          {errors.data && (
            <p className="text-sm text-destructive">{errors.data.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Tipo</label>
          <Select
            value={watch("tipo")}
            onValueChange={(v) => setValue("tipo", v as "receita" | "despesa")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Categoria</label>
          <Select
            value={watch("categoriaId")}
            onValueChange={(v) => setValue("categoriaId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoriaId && (
            <p className="text-sm text-destructive">{errors.categoriaId.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Conta</label>
          <Select
            value={watch("contaId")}
            onValueChange={(v) => setValue("contaId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {contas.map((conta) => (
                <SelectItem key={conta.id} value={conta.id}>
                  {conta.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contaId && (
            <p className="text-sm text-destructive">{errors.contaId.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Cartão (opcional)</label>
          <Select
            value={watch("cartaoId") ?? ""}
            onValueChange={(v) => setValue("cartaoId", v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {cartoes.map((cartao) => (
                <SelectItem key={cartao.id} value={cartao.id}>
                  {cartao.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Recorrência</label>
          <Select
            value={watch("tipoRecorrencia")}
            onValueChange={(v) => setValue("tipoRecorrencia", v as TipoRecorrencia)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unica">Única</SelectItem>
              <SelectItem value="recorrente">Recorrente</SelectItem>
              <SelectItem value="parcelado">Parcelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tipoRecorrencia === "parcelado" && (
          <>
            <div>
              <label className="text-sm font-medium">Parcela Atual</label>
              <Input
                type="number"
                min="1"
                {...register("parcelaAtual", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Total de Parcelas</label>
              <Input
                type="number"
                min="1"
                {...register("totalParcelas", { valueAsNumber: true })}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          {isEditing ? "Salvar Alterações" : "Cadastrar Transação"}
        </Button>
      </div>
    </form>
  );
}
