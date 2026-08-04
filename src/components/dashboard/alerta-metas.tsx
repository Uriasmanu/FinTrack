import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
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
    const percentual = meta.valorAlvo > 0 ? (meta.valorAtual / meta.valorAlvo) * 100 : 0;
    const dataFim = new Date(meta.dataFim);
    const hoje = new Date();
    const diasRestantes = Math.max(0, Math.ceil(
      (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    ));
    const diasTotais = Math.max(1, Math.ceil(
      (dataFim.getTime() - new Date(meta.dataInicio).getTime()) /
        (1000 * 60 * 60 * 24)
    ));
    const diasDecorridos = Math.max(0, diasTotais - diasRestantes);
    const progressoEsperado = (diasDecorridos / diasTotais) * 100;

    const valorRestante = Math.max(0, meta.valorAlvo - meta.valorAtual);
    const parcelaMensalNecessaria = diasRestantes > 0
      ? valorRestante / (diasRestantes / 30)
      : 0;

    const atrasado = percentual < progressoEsperado - 5 && diasRestantes > 0;
    const adiantado = percentual > progressoEsperado + 5 && diasRestantes > 0;
    const concluido = percentual >= 100;

    let status: "concluido" | "adiantado" | "no_prazo" | "atrasado" | "prazo_encerrado";
    if (concluido) status = "concluido";
    else if (diasRestantes <= 0 && percentual < 100) status = "prazo_encerrado";
    else if (adiantado) status = "adiantado";
    else if (atrasado) status = "atrasado";
    else status = "no_prazo";

    return {
      ...meta,
      percentual,
      diasRestantes,
      valorRestante,
      parcelaMensalNecessaria,
      status,
    };
  });

  const statusConfig = {
    concluido: { icon: CheckCircle, color: "text-success", label: "Concluída" },
    adiantado: { icon: TrendingUp, color: "text-success", label: "Adiantada" },
    no_prazo: { icon: TrendingUp, color: "text-primary", label: "No prazo" },
    atrasado: { icon: AlertTriangle, color: "text-warning", label: "Atrasada" },
    prazo_encerrado: { icon: AlertTriangle, color: "text-destructive", label: "Prazo encerrado" },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Alertas de Metas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metasComAlerta.slice(0, 3).map((meta) => {
          const config = statusConfig[meta.status];
          const StatusIcon = config.icon;
          return (
            <div key={meta.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-sm font-medium">{meta.nome}</span>
                </div>
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
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
                <span>
                  {meta.diasRestantes > 0
                    ? `${meta.diasRestantes} dias restantes`
                    : meta.status === "concluido"
                    ? "Meta atingida!"
                    : "Prazo encerrado"}
                </span>
              </div>
              {meta.status === "atrasado" && meta.parcelaMensalNecessaria > 0 && (
                <p className="text-xs text-warning">
                  Necessário economizar {formatarMoeda(meta.parcelaMensalNecessaria)}/mês para atingir a meta
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
