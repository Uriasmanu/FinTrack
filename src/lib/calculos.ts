import type { Transacao } from "@/types";

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarParcela(atual: number, total: number): string {
  return `${atual}/${total}`;
}

export function formatarPrazo(meses: number): string {
  if (meses < 12) {
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  }

  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  if (mesesRestantes === 0) {
    return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  }

  return `${anos} ${anos === 1 ? "ano" : "anos"} e ${mesesRestantes} ${
    mesesRestantes === 1 ? "mês" : "meses"
  }`;
}

export function calcularParcelaMensal(valorAlvo: number, meses: number): number {
  if (meses <= 0) return 0;
  return valorAlvo / meses;
}

export function calcularSaldo(transacoes: Transacao[]): number {
  return transacoes.reduce((saldo, t) => {
    return t.tipo === "receita" ? saldo + t.valor : saldo - t.valor;
  }, 0);
}

export function calcularReceitasMes(
  transacoes: Transacao[],
  mes: number,
  ano: number
): number {
  return transacoes
    .filter(
      (t) =>
        t.tipo === "receita" &&
        new Date(t.data).getMonth() === mes &&
        new Date(t.data).getFullYear() === ano
    )
    .reduce((total, t) => total + t.valor, 0);
}

export function calcularDespesasMes(
  transacoes: Transacao[],
  mes: number,
  ano: number
): number {
  return transacoes
    .filter(
      (t) =>
        t.tipo === "despesa" &&
        new Date(t.data).getMonth() === mes &&
        new Date(t.data).getFullYear() === ano
    )
    .reduce((total, t) => total + t.valor, 0);
}

export function calcularVariacaoMes(atual: number, anterior: number): number {
  if (anterior === 0) return 0;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

export function calcularMediaGastoDiario(
  despesas: number,
  diasNoMes: number
): number {
  if (diasNoMes === 0) return 0;
  return despesas / diasNoMes;
}

export function calcularMaiorTransacao(
  transacoes: Transacao[]
): Transacao | null {
  if (transacoes.length === 0) return null;
  return transacoes.reduce((maior, t) => (t.valor > maior.valor ? t : maior));
}

export function calcularPercentualEconomia(
  receitas: number,
  despesas: number
): number {
  if (receitas === 0) return 0;
  return ((receitas - despesas) / receitas) * 100;
}
