import { useNavigate } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { gerarId } from "@/lib/uuid";

const transferenciaSchema = z.object({
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  data: z.string().min(1, "Data é obrigatória"),
  contaOrigemId: z.string().min(1, "Conta de origem é obrigatória"),
  contaDestinoId: z.string().min(1, "Conta de destino é obrigatória"),
  categoriaId: z.string().optional(),
  descricao: z.string().optional(),
});

type TransferenciaFormData = z.infer<typeof transferenciaSchema>;

export function Transferencia() {
  const navigate = useNavigate();
  const { dadosAno, adicionarTransacao } = useFinanceStore();

  const contas = dadosAno?.contas ?? [];
  const categorias = dadosAno?.categorias ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransferenciaFormData>({
    resolver: zodResolver(transferenciaSchema),
    defaultValues: {
      valor: 0,
      data: (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })(),
      contaOrigemId: "",
      contaDestinoId: "",
      categoriaId: "cat-013",
      descricao: "Transferência entre contas",
    },
  });

  const contaOrigemId = watch("contaOrigemId");
  const contaDestinoId = watch("contaDestinoId");

  function handleTransferencia(data: TransferenciaFormData) {
    if (data.contaOrigemId === data.contaDestinoId) {
      alert("A conta de origem e destino devem ser diferentes.");
      return;
    }

    const grupoId = gerarId();

    adicionarTransacao({
      tipo: "despesa",
      tipoRecorrencia: "unica",
      descricao: data.descricao || "Transferência entre contas",
      valor: data.valor,
      data: data.data,
      categoriaId: data.categoriaId || "cat-013",
      contaId: data.contaOrigemId,
      cartaoId: null,
      parcelaAtual: 1,
      totalParcelas: 1,
      grupoParcelaId: grupoId,
      confirmada: true,
    });

    adicionarTransacao({
      tipo: "receita",
      tipoRecorrencia: "unica",
      descricao: data.descricao || "Transferência entre contas",
      valor: data.valor,
      data: data.data,
      categoriaId: data.categoriaId || "cat-013",
      contaId: data.contaDestinoId,
      cartaoId: null,
      parcelaAtual: 1,
      totalParcelas: 1,
      grupoParcelaId: grupoId,
      confirmada: true,
    });

    navigate("/transacoes");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Transferência entre Contas</h2>
          <p className="text-muted-foreground">
            Transfira dinheiro de uma conta para outra
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Transferência</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleTransferencia)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Conta de Origem</label>
                <Select
                  value={contaOrigemId}
                  onValueChange={(v) => setValue("contaOrigemId", v)}
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
                {errors.contaOrigemId && (
                  <p className="text-sm text-destructive">{errors.contaOrigemId.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Conta de Destino</label>
                <Select
                  value={contaDestinoId}
                  onValueChange={(v) => setValue("contaDestinoId", v)}
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
                {errors.contaDestinoId && (
                  <p className="text-sm text-destructive">{errors.contaDestinoId.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Categoria (opcional)</label>
              <Select
                value={watch("categoriaId") ?? ""}
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
            </div>

            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Input
                {...register("descricao")}
                placeholder="Ex: Guardar na poupança..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/transacoes")}>
                Cancelar
              </Button>
              <Button type="submit">
                Transferir
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
