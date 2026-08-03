import { Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinanceStore } from "@/stores/useFinanceStore";
import type { Categoria } from "@/types";

interface CategoriaCardProps {
  categoria: Categoria;
  onEditar: (id: string) => void;
}

export function CategoriaCard({ categoria, onEditar }: CategoriaCardProps) {
  const { excluirCategoria, dadosAno } = useFinanceStore();

  const transacoesNaCategoria = dadosAno?.transacoes.filter(
    (t) => t.categoriaId === categoria.id
  ).length ?? 0;

  function handleExcluir() {
    if (transacoesNaCategoria > 0) {
      alert("Não é possível excluir uma categoria com transações vinculadas.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      excluirCategoria(categoria.id);
    }
  }

  const tipoLabel = {
    receita: "Receita",
    despesa: "Despesa",
    ambos: "Ambos",
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${categoria.cor}20` }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: categoria.cor }}
          />
        </div>
        <div>
          <p className="font-medium">{categoria.nome}</p>
          <p className="text-sm text-muted-foreground">
            {tipoLabel[categoria.tipo]} · {transacoesNaCategoria} transação(ões)
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xl leading-none">
            ⋮
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEditar(categoria.id)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExcluir}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
