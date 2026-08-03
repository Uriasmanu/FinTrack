import { AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda } from "@/lib/calculos";

export function AlertaMetas() {
  const { dadosAno } = useFinanceStore();

  if (!dadosAno) return null;

  const metasAtivas = dadosAno.metas.filter((m) => m.status === "em_andamento");

  if (metasAtivas.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Alertas de Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma meta ativa
          </p>
        </CardContent>
      </Card>
    );
  }

  const metasComAlerta = metasAtivas.map((meta) => {
    const percentual = (meta.valorAtual / meta.valorAlvo) * 100;
    const dataFim = new Date(meta.dataFim);
    const hoje = new Date();
    const diasRestantes = Math.ceil(
      (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );
    const diasTotais = Math.ceil(
      (dataFim.getTime() - new Date(meta.dataInicio).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const diasDecorridos = diasTotais - diasRestantes;
    const progressoEsperado = (diasDecorridos / diasTotais) * 100;

    const atrasado = percentual < progressoEsperado && diasRestantes > 0;
    const concluido = percentual >= 100;

    return {
      ...meta,
      percentual,
      diasRestantes,
      atrasado,
      concluido,
    };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Alertas de Metas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metasComAlerta.slice(0, 3).map((meta) => (
          <div key={meta.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {meta.concluido ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : meta.atrasado ? (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                ) : null}
                <span className="text-sm font-medium">{meta.nome}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {meta.diasRestantes > 0
                  ? `${meta.diasRestantes} dias restantes`
                  : "Prazo encerrado"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={meta.percentual} className="h-2 flex-1" />
              <span className="text-xs font-medium w-12 text-right">
                {meta.percentual.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatarMoeda(meta.valorAtual)} / {formatarMoeda(meta.valorAlvo)}
              </span>
              {meta.atrasado && (
                <span className="text-warning">Atrasado</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
