import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
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
import { formatarMoeda, formatarData, parseValorMoeda } from "@/lib/calculos";
import type { TipoRecorrencia } from "@/types";

import {
  SUBTIPO_IDS,
  CATEGORIA_ALIMENTACAO,
  CATEGORIAS_AUTO_TICKET,
} from "@/lib/categorias-ids";

const transacaoSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z
    .number({ invalid_type_error: "Informe um valor válido" })
    .finite("Informe um valor válido")
    .min(0.01, "Valor deve ser maior que zero"),
  data: z.string().min(1, "Data é obrigatória"),
  tipo: z.enum(["receita", "despesa"]),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  subtipoId: z.string().nullable(),
  contaId: z.string().min(1, "Conta é obrigatória"),
  cartaoId: z.string().nullable(),
  tipoRecorrencia: z.enum(["unica", "recorrente", "recorrente_personalizado", "parcelado"]),
  parcelaAtual: z.number().min(1),
  totalParcelas: z.number().min(1),
  intervaloDias: z.number().nullable(),
  confirmada: z.boolean(),
});

type TransacaoFormData = z.infer<typeof transacaoSchema>;

interface TransacaoFormProps {
  initialData?: Partial<TransacaoFormData> & { id?: string };
  onSubmit: (data: TransacaoFormData) => void;
  isEditing?: boolean;
}

export function TransacaoForm({
  initialData,
  onSubmit,
  isEditing = false,
}: TransacaoFormProps) {
  const { dados } = useFinanceStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
    defaultValues: {
      descricao: initialData?.descricao ?? "",
      valor: initialData?.valor ?? 0,
      data: initialData?.data ?? (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })(),
      tipo: initialData?.tipo ?? "despesa",
      categoriaId: initialData?.categoriaId ?? "",
      subtipoId: initialData?.subtipoId ?? null,
      contaId: initialData?.contaId ?? "",
      cartaoId: initialData?.cartaoId ?? null,
      tipoRecorrencia: initialData?.tipoRecorrencia ?? "unica",
      parcelaAtual: initialData?.parcelaAtual ?? 1,
      totalParcelas: initialData?.totalParcelas ?? 1,
      intervaloDias: initialData?.intervaloDias ?? null,
      confirmada: initialData?.confirmada ?? false,
    },
  });

  const tipo = watch("tipo");
  const tipoRecorrencia = watch("tipoRecorrencia");
  const categoriaId = watch("categoriaId");
  const descricao = watch("descricao");
  const valor = watch("valor");
  const data = watch("data");
  const categorias = dados?.categorias.filter(
    (c) => (c.tipo === tipo || c.tipo === "ambos") && !SUBTIPO_IDS.includes(c.id)
  ) ?? [];
  const contas = dados?.contas ?? [];
  const cartoes = dados?.cartoes ?? [];

  const duplicatas = (dados?.transacoes ?? []).filter((t) => {
    if (isEditing) return false;
    if (t.descricao.toLowerCase() !== descricao?.toLowerCase()) return false;
    if (Math.abs(t.valor - (valor ?? 0)) > 0.01) return false;
    if (data && t.data !== data) return false;
    return true;
  });

  const contaTicket = contas.find((c) => c.tipo === "ticket");

  const contaSelecionada = watch("contaId");
  const dataTransacao = watch("data");

  const conta = dados?.contas.find((c) => c.id === contaSelecionada);
  const saldoInicialConta = conta?.saldoInicial ?? 0;

  const transacoesAnteriores = (dados?.transacoes ?? [])
    .filter((t) => {
      if (t.contaId !== contaSelecionada) return false;
      if (isEditing && t.id === initialData?.id) return false;
      if (!dataTransacao) return false;
      return t.data < dataTransacao;
    })
    .reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0);

  const saldoAtual = contaSelecionada ? saldoInicialConta + transacoesAnteriores : 0;
  const valorTransacao = valor ?? 0;
  const saldoAposTransacao = tipo === "despesa" ? saldoAtual - valorTransacao : saldoAtual + valorTransacao;

  const transacoesDoDia = (dados?.transacoes ?? [])
    .filter((t) => {
      if (t.contaId !== contaSelecionada) return false;
      if (t.data !== dataTransacao) return false;
      if (isEditing && t.id === initialData?.id) return false;
      return true;
    })
    .reduce((acc, t) => acc + (t.tipo === "receita" ? t.valor : -t.valor), 0);

  const saldoPrevistoFimDia = saldoAposTransacao + transacoesDoDia;
  const saldoNegativo = tipo === "despesa" && saldoPrevistoFimDia < 0;

  if (CATEGORIAS_AUTO_TICKET.includes(categoriaId) && contaTicket && !isEditing && watch("contaId") !== contaTicket.id) {
    setValue("contaId", contaTicket.id);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            {...register("valor", {
              setValueAs: (v) => parseValorMoeda(String(v)),
            })}
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
            onValueChange={(v) => {
              setValue("tipo", v as "receita" | "despesa");
              const novasCategorias = (dados?.categorias ?? []).filter(
                (c) => c.tipo === v || c.tipo === "ambos"
              );
              if (novasCategorias.length > 0 && !novasCategorias.find((c) => c.id === watch("categoriaId"))) {
                setValue("categoriaId", novasCategorias[0].id);
              }
            }}
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

        {categoriaId === CATEGORIA_ALIMENTACAO && (
          <div>
            <label className="text-sm font-medium">Subtipo</label>
            <Select
              value={watch("subtipoId") ?? ""}
              onValueChange={(v) => setValue("subtipoId", v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o subtipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {(dados?.categorias ?? [])
                  .filter((c) => SUBTIPO_IDS.includes(c.id))
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
                  {conta.banco} ({conta.tipo === "corrente" ? "Corrente" : conta.tipo === "poupanca" ? "Poupança" : conta.tipo === "investimento" ? "Investimento" : "Ticket"})
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
              <SelectItem value="recorrente">Recorrente (mensal)</SelectItem>
              <SelectItem value="recorrente_personalizado">Recorrente (personalizado)</SelectItem>
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

        {tipoRecorrencia === "recorrente_personalizado" && (
          <div>
            <label className="text-sm font-medium">Repetir a cada (dias)</label>
            <Input
              type="number"
              min="1"
              {...register("intervaloDias", { valueAsNumber: true })}
              placeholder="Ex: 25"
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("confirmada")}
              className="w-4 h-4 rounded border-input"
            />
            <span className="text-sm font-medium">Transação efetivada</span>
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Marque se a transação já foi confirmada/paga
          </p>
        </div>
      </div>

      {duplicatas.length > 0 && (
        <div className="border border-warning bg-warning/5 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Possível transação duplicada</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Já existe {duplicatas.length} transação(ões) com esta mesma descrição e valor:
          </p>
          <div className="space-y-2">
            {duplicatas.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm bg-background rounded p-2">
                <div>
                  <span className="font-medium">{t.descricao}</span>
                  <span className="text-muted-foreground ml-2">
                    {formatarData(t.data)}
                  </span>
                </div>
                <span className={t.tipo === "receita" ? "text-success" : "text-destructive"}>
                  {t.tipo === "receita" ? "+" : "-"}{formatarMoeda(t.valor)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Tem certeza que deseja cadastrar duplicado?
          </p>
        </div>
      )}

{saldoNegativo && contaSelecionada && (
         <div className="border border-destructive bg-destructive/5 rounded-lg p-4 space-y-2">
           <div className="flex items-center gap-2 text-destructive">
             <AlertTriangle className="h-5 w-5" />
             <span className="font-medium">Saldo insuficiente</span>
           </div>
           <p className="text-sm text-muted-foreground">
             Esta transação deixará o saldo previsto para o fim do dia negativo.
           </p>
           <div className="flex justify-between text-sm">
             <span>Saldo atual:</span>
             <span className={saldoAtual >= 0 ? "text-success" : "text-destructive"}>
               {formatarMoeda(saldoAtual)}
             </span>
           </div>
           <div className="flex justify-between text-sm font-medium">
             <span>Saldo previsto fim do dia:</span>
             <span className="text-destructive">
               {formatarMoeda(saldoPrevistoFimDia)}
             </span>
           </div>
         </div>
       )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Transação"}
        </Button>
      </div>
    </form>
  );
}
