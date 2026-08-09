import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calcularPrecoTeto } from "@/lib/calculos-fii";

interface FiiPrecoTetoCalcProps {
  ticker: string;
  dividendoAnualAtual: number;
  precoAtualMercado: number;
  taxaRetornoAtual: number;
}

export function FiiPrecoTetoCalc({
  ticker,
  dividendoAnualAtual,
  precoAtualMercado,
  taxaRetornoAtual,
}: FiiPrecoTetoCalcProps) {
  const [dividendoAnual, setDividendoAnual] = useState(dividendoAnualAtual);
  const [taxaRetorno, setTaxaRetorno] = useState(taxaRetornoAtual);

  const precoTeto = calcularPrecoTeto(dividendoAnual, taxaRetorno);
  const diferenca = precoAtualMercado > 0
    ? ((precoTeto - precoAtualMercado) / precoAtualMercado) * 100
    : 0;

  const formatarMoeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Calculadora de Preço Teto — {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Método Barsi Adaptado: Preço Teto = Dividendo Anual Esperado / Taxa de Retorno Desejada
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Dividendo Anual Esperado (R$/cota)</label>
            <Input
              type="number"
              step="0.01"
              value={dividendoAnual}
              onChange={(e) => setDividendoAnual(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Taxa de Retorno Desejada (% a.a.)</label>
            <Input
              type="number"
              step="0.01"
              value={taxaRetorno}
              onChange={(e) => setTaxaRetorno(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Preço Teto:</span>
            <span className="text-lg font-bold text-primary">{formatarMoeda(precoTeto)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Preço de Mercado:</span>
            <span className="font-medium">{formatarMoeda(precoAtualMercado)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Diferença:</span>
            <span className={`font-medium ${diferenca >= 0 ? "text-success" : "text-destructive"}`}>
              {diferenca >= 0 ? "+" : ""}{diferenca.toFixed(1)}%
            </span>
          </div>
        </div>

        {precoAtualMercado > 0 && precoTeto > 0 && (
          <p className="text-xs text-muted-foreground">
            {precoAtualMercado <= precoTeto
              ? "O preço atual está ABAIXO do preço teto — potencial de compra."
              : "O preço atual está ACIMA do preço teto — potencial de venda ou espera."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
