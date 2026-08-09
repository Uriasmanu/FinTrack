import type { AtivoFii, DividendoFii, IndicadoresFii, StatusPrecoFii } from "@/types";

export function calcularPrecoTeto(dividendoAnualPorCota: number, taxaRetornoDesejada: number): number {
  if (taxaRetornoDesejada <= 0) return 0;
  return dividendoAnualPorCota / (taxaRetornoDesejada / 100);
}

export function calcularPvp(precoMercado: number, valorPatrimonial: number): number {
  if (valorPatrimonial <= 0) return 0;
  return precoMercado / valorPatrimonial;
}

export function calcularDyMensal(dividendoMensal: number, precoMercado: number): number {
  if (precoMercado <= 0) return 0;
  return (dividendoMensal / precoMercado) * 100;
}

export function calcularDyAnual(dividendos12Meses: number, precoMercado: number): number {
  if (precoMercado <= 0) return 0;
  return (dividendos12Meses / precoMercado) * 100;
}

export function calcularYoc(dividendoAnualPorCota: number, precoMedioCompra: number): number {
  if (precoMedioCompra <= 0) return 0;
  return (dividendoAnualPorCota / precoMedioCompra) * 100;
}

export function calcularCapRate(receitaOperacionalAnual: number, valorAvaliacaoImoveis: number): number {
  if (valorAvaliacaoImoveis <= 0) return 0;
  return (receitaOperacionalAnual / valorAvaliacaoImoveis) * 100;
}

export function calcularValorTotalPosicao(cotasAtuais: number, precoAtualMercado: number): number {
  return cotasAtuais * precoAtualMercado;
}

export function calcularLucroPrejuizo(
  cotasAtuais: number,
  precoAtual: number,
  precoMedio: number
): { valor: number; percentual: number } {
  const valor = (precoAtual - precoMedio) * cotasAtuais;
  const percentual = precoMedio > 0 ? ((precoAtual - precoMedio) / precoMedio) * 100 : 0;
  return { valor, percentual };
}

export function calcularTotalDividendosAno(dividendos: DividendoFii[], ano: number): number {
  return dividendos
    .filter((d) => d.competencia.startsWith(String(ano)))
    .reduce((soma, d) => soma + d.totalRecebido, 0);
}

export function calcularValorCarteiraFii(ativos: AtivoFii[]): number {
  return ativos.reduce((soma, a) => soma + a.cotasAtuais * a.precoAtualMercado, 0);
}

export function obterDividendosUltimos12Meses(
  dividendos: DividendoFii[],
  dataReferencia: Date
): number {
  const hace12Meses = new Date(dataReferencia);
  hace12Meses.setMonth(hace12Meses.getMonth() - 12);

  return dividendos
    .filter((d) => {
      const data = new Date(d.dataPagamento);
      return data >= hace12Meses && data <= dataReferencia;
    })
    .reduce((soma, d) => soma + d.totalRecebido, 0);
}

export function obterDividendosMes(
  dividendos: DividendoFii[],
  mes: number,
  ano: number
): DividendoFii[] {
  return dividendos.filter((d) => {
    const data = new Date(d.dataPagamento);
    return data.getMonth() === mes && data.getFullYear() === ano;
  });
}

function classificarStatusPreco(
  tipo: string,
  pVp: number
): StatusPrecoFii {
  if (tipo === "papel") {
    if (pVp <= 1.0) return "desconto";
    if (pVp <= 1.15) return "justo";
    if (pVp <= 1.2) return "agio_moderado";
    return "agio_excessivo";
  }

  if (pVp < 0.9) return "desconto";
  if (pVp <= 1.0) return "desconto";
  if (pVp <= 1.05) return "justo";
  if (pVp <= 1.2) return "agio_moderado";
  return "agio_excessivo";
}

function detectarGanhoNaoRecorrente(
  dividendos: DividendoFii[],
  ativoFiiId: string
): boolean {
  const dividendosDoAtivo = dividendos
    .filter((d) => d.ativoFiiId === ativoFiiId)
    .sort((a, b) => new Date(b.dataPagamento).getTime() - new Date(a.dataPagamento).getTime());

  if (dividendosDoAtivo.length < 2) return false;

  const maisRecente = dividendosDoAtivo[0];
  if (maisRecente.recorrente) return false;

  const ultimos6Recorrentes = dividendosDoAtivo
    .filter((d) => d.recorrente)
    .slice(0, 6);

  if (ultimos6Recorrentes.length === 0) return false;

  const mediaRecorrente =
    ultimos6Recorrentes.reduce((soma, d) => soma + d.valorPorCota, 0) /
    ultimos6Recorrentes.length;

  return maisRecente.valorPorCota >= mediaRecorrente * 1.5;
}

export function calcularIndicadoresFii(
  ativo: AtivoFii,
  dividendos: DividendoFii[]
): IndicadoresFii {
  const pVp = calcularPvp(ativo.precoAtualMercado, ativo.valorPatrimonialCota);

  const dividendos12Meses = obterDividendosUltimos12Meses(
    dividendos.filter((d) => d.ativoFiiId === ativo.id),
    new Date()
  );

  const dividendosAnuaisPorCota = ativo.cotasAtuais > 0
    ? dividendos12Meses / ativo.cotasAtuais
    : 0;

  const precoTeto = calcularPrecoTeto(dividendosAnuaisPorCota, ativo.taxaRetornoDesejada);

  const dyMensal = calcularDyMensal(
    dividendosAnuaisPorCota / 12,
    ativo.precoAtualMercado
  );

  const dyAnual = calcularDyAnual(dividendos12Meses, ativo.precoAtualMercado);

  const yieldOnCost = calcularYoc(dividendosAnuaisPorCota, ativo.precoMedioCompra);

  const { valor: lucroPrejuizoValor, percentual: lucroPrejuizoPercentual } =
    calcularLucroPrejuizo(ativo.cotasAtuais, ativo.precoAtualMercado, ativo.precoMedioCompra);

  const statusPreco = classificarStatusPreco(ativo.tipo, pVp);

  const alertaVenda = pVp > 1.2 || (ativo.tipo === "papel" && pVp > 1.0);

  const alertaGanhoNaoRecorrente = detectarGanhoNaoRecorrente(dividendos, ativo.id);

  return {
    pVp,
    precoTeto,
    dyMensal,
    dyAnual,
    yieldOnCost,
    statusPreco,
    alertaVenda,
    alertaGanhoNaoRecorrente,
    lucroPrejuizoValor,
    lucroPrejuizoPercentual,
  };
}

export function calcularDyMedioCarteira(
  ativos: AtivoFii[],
  indicadoresPorAtivo: Record<string, IndicadoresFii>
): number {
  const valorTotal = calcularValorCarteiraFii(ativos);
  if (valorTotal === 0) return 0;
  const somaPonderada = ativos.reduce((soma, a) => {
    const valorAtivo = a.cotasAtuais * a.precoAtualMercado;
    return soma + (indicadoresPorAtivo[a.id]?.dyAnual ?? 0) * valorAtivo;
  }, 0);
  return somaPonderada / valorTotal;
}
