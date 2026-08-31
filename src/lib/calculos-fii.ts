import type { AtivoFii } from "@/types";

export function calcularValorTotalPosicao(quantidadeCotas: number, precoCota: number): number {
  return quantidadeCotas * precoCota;
}

export function calcularDividendoMensal(valorDividendoMensal: number, quantidadeCotas: number): number {
  return valorDividendoMensal * quantidadeCotas;
}

export function calcularDividendoAnual(valorDividendoMensal: number, quantidadeCotas: number): number {
  return valorDividendoMensal * quantidadeCotas * 12;
}

export function calcularDyMensal(valorDividendoMensal: number, precoCota: number): number {
  if (precoCota <= 0) return 0;
  return (valorDividendoMensal / precoCota) * 100;
}

export function calcularDyAnual(valorDividendoMensal: number, precoCota: number): number {
  return calcularDyMensal(valorDividendoMensal, precoCota) * 12;
}

export function calcularValorCarteiraFii(ativos: AtivoFii[]): number {
  return ativos.reduce((soma, a) => soma + a.quantidadeCotas * a.precoCota, 0);
}

export function calcularTotalDividendosMensal(ativos: AtivoFii[]): number {
  return ativos.reduce((soma, a) => soma + a.valorDividendoMensal * a.quantidadeCotas, 0);
}

export function calcularTotalDividendosAnual(ativos: AtivoFii[]): number {
  return calcularTotalDividendosMensal(ativos) * 12;
}

export function calcularDyMedioCarteira(ativos: AtivoFii[]): number {
  const valorTotal = calcularValorCarteiraFii(ativos);
  if (valorTotal === 0) return 0;
  const somaPonderada = ativos.reduce((soma, a) => {
    const valorAtivo = a.quantidadeCotas * a.precoCota;
    const dy = calcularDyAnual(a.valorDividendoMensal, a.precoCota);
    return soma + dy * valorAtivo;
  }, 0);
  return somaPonderada / valorTotal;
}
