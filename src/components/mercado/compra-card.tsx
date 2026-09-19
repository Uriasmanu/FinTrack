import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CompraMercado } from "@/types";
import { calcularSubtotalItem, calcularTotalCompra } from "@/lib/calculos-mercado";

interface CompraCardProps {
  compra: CompraMercado;
  onEditar: (compra: CompraMercado) => void;
  onExcluir: (compra: CompraMercado) => void;
}

export function CompraCard({ compra, onEditar, onExcluir }: CompraCardProps) {
  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const total = calcularTotalCompra(compra);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold">{formatarData(compra.data)}</h3>
            <p className="text-sm text-muted-foreground">
              {compra.itens.length} {compra.itens.length === 1 ? "item" : "itens"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditar(compra)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExcluir(compra)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ul className="mt-3 space-y-1 text-sm">
          {compra.itens.map((item) => (
            <li key={item.id} className="flex justify-between text-muted-foreground">
              <span>
                {item.nome} ({item.quantidade}x)
              </span>
              <span>{formatarMoeda(calcularSubtotalItem(item))}</span>
            </li>
          ))}
        </ul>

        {compra.observacoes && (
          <p className="mt-2 text-xs text-muted-foreground truncate">{compra.observacoes}</p>
        )}

        <div className="mt-3 flex items-center justify-between border-t pt-2 text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold">{formatarMoeda(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
