import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinanceStore } from "@/stores/useFinanceStore";

export interface FiltrosTransacao {
  busca: string;
  tipo: string;
  categoriaId: string;
  contaId: string;
  dataInicio: string;
  dataFim: string;
}

interface FiltrosProps {
  filtros: FiltrosTransacao;
  onFiltrosChange: (filtros: FiltrosTransacao) => void;
}

export function Filtros({ filtros, onFiltrosChange }: FiltrosProps) {
  const { dados } = useFinanceStore();
  const categorias = dados?.categorias ?? [];
  const contas = dados?.contas ?? [];

  function atualizarFiltro(campo: keyof FiltrosTransacao, valor: string) {
    onFiltrosChange({ ...filtros, [campo]: valor });
  }

  function limparFiltros() {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const formatarDataISO = (d: Date) => d.toISOString().split("T")[0];

    onFiltrosChange({
      busca: "",
      tipo: "todos",
      categoriaId: "todas",
      contaId: "todas",
      dataInicio: formatarDataISO(primeiroDiaMes),
      dataFim: formatarDataISO(ultimoDiaMes),
    });
  }

  const temFiltroAtivo =
    filtros.busca ||
    filtros.tipo !== "todos" ||
    filtros.categoriaId !== "todas" ||
    filtros.contaId !== "todas" ||
    filtros.dataInicio ||
    filtros.dataFim;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={filtros.busca}
            onChange={(e) => atualizarFiltro("busca", e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filtros.tipo}
          onValueChange={(v) => atualizarFiltro("tipo", v)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filtros.categoriaId}
          onValueChange={(v) => atualizarFiltro("categoriaId", v)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtros.contaId}
          onValueChange={(v) => atualizarFiltro("contaId", v)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas contas</SelectItem>
            {contas.map((conta) => (
              <SelectItem key={conta.id} value={conta.id}>
                {conta.banco} ({conta.tipo === "corrente" ? "Corrente" : conta.tipo === "poupanca" ? "Poupança" : conta.tipo === "investimento" ? "Investimento" : "Ticket"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Data início</label>
          <Input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => atualizarFiltro("dataInicio", e.target.value)}
            className="w-full sm:w-[150px]"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Data fim</label>
          <Input
            type="date"
            value={filtros.dataFim}
            onChange={(e) => atualizarFiltro("dataFim", e.target.value)}
            className="w-full sm:w-[150px]"
          />
        </div>

        {temFiltroAtivo && (
          <Button variant="outline" size="sm" onClick={limparFiltros} className="h-[36px]">
            <X className="mr-1 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
