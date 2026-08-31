import { MoreVertical, Pencil, Trash2, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AtivoFii } from "@/types";

interface FiiCardProps {
  ativo: AtivoFii;
  onEditar: (ativo: AtivoFii) => void;
  onExcluir: (ativo: AtivoFii) => void;
}

export function FiiCard({
  ativo,
  onEditar,
  onExcluir,
}: FiiCardProps) {
  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const valorPosicao = ativo.quantidadeCotas * ativo.precoCota;
  const dividendoMensal = ativo.valorDividendoMensal * ativo.quantidadeCotas;
  const dividendoAnual = dividendoMensal * 12;
  const dyMensal = ativo.precoCota > 0 ? (ativo.valorDividendoMensal / ativo.precoCota) * 100 : 0;
  const dyAnual = dyMensal * 12;

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{ativo.ticker}</h3>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {ativo.nome}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditar(ativo)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onExcluir(ativo)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Preço Cota</p>
            <p className="font-medium">{formatarMoeda(ativo.precoCota)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Cotas</p>
            <p className="font-medium">{ativo.quantidadeCotas}</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">DY Mensal</p>
            <p className="font-medium text-success">{dyMensal.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">DY Anual</p>
            <p className="font-medium text-success">{dyAnual.toFixed(2)}%</p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm border-t pt-2">
          <div>
            <p className="text-muted-foreground text-xs">Valor Posição</p>
            <p className="font-bold">{formatarMoeda(valorPosicao)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Dividendo/Mês</p>
            <p className="font-bold text-success">{formatarMoeda(dividendoMensal)}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Dia Dividendo</p>
            <p className="font-medium">Dia {ativo.diaDividendo}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Dividendo/Ano</p>
            <p className="font-bold text-success">{formatarMoeda(dividendoAnual)}</p>
          </div>
        </div>

        {ativo.observacoes && (
          <p className="mt-2 text-xs text-muted-foreground truncate">
            {ativo.observacoes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
