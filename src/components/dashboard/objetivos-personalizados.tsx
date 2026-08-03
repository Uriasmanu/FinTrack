import { Link } from "react-router-dom";
import { Target, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatarMoeda, formatarPrazo } from "@/lib/calculos";

export function ObjetivosPersonalizados() {
  const { dadosAno, editarMeta } = useFinanceStore();

  if (!dadosAno) return null;

  const objetivos = dadosAno.metas.filter((m) => m.tipo === "personalizado");
  const objetivosAtivos = objetivos.filter((m) => m.ativo);

  const handleToggleAtivo = (id: string, ativo: boolean) => {
    editarMeta(id, { ativo });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Objetivos Personalizados
        </CardTitle>
        <Link to="/metas/nova">
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {objetivos.length === 0 ? (
          <div className="text-center py-6">
            <Target className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum objetivo criado
            </p>
            <Link to="/metas/nova">
              <Button variant="outline" size="sm" className="mt-2">
                Criar primeiro objetivo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {objetivosAtivos.slice(0, 3).map((objetivo) => {
              const percentual = (objetivo.valorAtual / objetivo.valorAlvo) * 100;

              return (
                <div key={objetivo.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{objetivo.nome}</span>
                    <Switch
                      checked={objetivo.ativo}
                      onCheckedChange={(checked) =>
                        handleToggleAtivo(objetivo.id, checked)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percentual} className="h-2 flex-1" />
                    <span className="text-xs font-medium w-12 text-right">
                      {percentual.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatarMoeda(objetivo.valorAtual)} /{" "}
                      {formatarMoeda(objetivo.valorAlvo)}
                    </span>
                    <span>
                      {formatarMoeda(objetivo.parcelaMensal)}/mês •{" "}
                      {formatarPrazo(objetivo.meses)}
                    </span>
                  </div>
                </div>
              );
            })}
            {objetivosAtivos.length > 3 && (
              <Link
                to="/metas"
                className="block text-center text-xs text-primary hover:underline"
              >
                Ver todos ({objetivosAtivos.length})
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
