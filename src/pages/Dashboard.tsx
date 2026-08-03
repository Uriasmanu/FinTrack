import { SaldoCard } from "@/components/dashboard/saldo-card";
import { ReceitasDespesasCard } from "@/components/dashboard/receitas-despesas-card";
import { ResumoMensal } from "@/components/dashboard/resumo-mensal";
import { UltimasTransacoes } from "@/components/dashboard/ultimas-transacoes";
import { ResumoCategorias } from "@/components/dashboard/resumo-categorias";
import { AlertaMetas } from "@/components/dashboard/alerta-metas";
import { ObjetivosPersonalizados } from "@/components/dashboard/objetivos-personalizados";
import { DespesasPorFinalidade } from "@/components/dashboard/despesas-por-finalidade";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function Dashboard() {
  const { dadosAno } = useFinanceStore();

  if (!dadosAno) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SaldoCard />
        <ReceitasDespesasCard />
        <ResumoMensal />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UltimasTransacoes />
        <ResumoCategorias />
        <AlertaMetas />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DespesasPorFinalidade />
        <ObjetivosPersonalizados />
      </div>
    </div>
  );
}
