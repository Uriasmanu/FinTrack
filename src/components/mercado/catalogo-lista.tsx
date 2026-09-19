import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CatalogoItemMercado } from "@/types";

interface CatalogoListaProps {
  catalogo: CatalogoItemMercado[];
  onEditar: (item: CatalogoItemMercado) => void;
  onExcluir: (item: CatalogoItemMercado) => void;
}

export function CatalogoLista({ catalogo, onEditar, onExcluir }: CatalogoListaProps) {
  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const itensOrdenados = [...catalogo].sort((a, b) =>
    a.nomeExibicao.localeCompare(b.nomeExibicao, "pt-BR")
  );

  if (itensOrdenados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Catálogo de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Registre uma compra para começar a montar seu catálogo de itens e marcas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Catálogo de Itens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {itensOrdenados.map((item) => (
          <div
            key={item.nomeNormalizado}
            className="flex flex-col gap-1 border-b pb-2 last:border-0 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="space-y-1">
              <span className="font-medium">{item.nomeExibicao}</span>
              <div className="flex flex-wrap gap-1">
                {item.marcas.map((marca) => (
                  <Badge key={marca} variant="secondary">
                    {marca}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Última compra: {formatarMoeda(item.ultimoPreco)} / {item.ultimaUnidade}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditar(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExcluir(item)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
