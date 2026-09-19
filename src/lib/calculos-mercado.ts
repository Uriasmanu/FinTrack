import type { CompraMercado, ItemMercado, CatalogoItemMercado } from "@/types";

export function normalizarNomeItem(nome: string): string {
  return nome.trim().toLowerCase();
}

export function calcularSubtotalItem(item: ItemMercado): number {
  return item.precoUnitario * item.quantidade;
}

export function calcularTotalCompra(compra: CompraMercado): number {
  return compra.itens.reduce((soma, item) => soma + calcularSubtotalItem(item), 0);
}

function estaNoMes(data: string, mes: number, ano: number): boolean {
  const d = new Date(data);
  return d.getMonth() === mes && d.getFullYear() === ano;
}

export function calcularTotalMes(compras: CompraMercado[], mes: number, ano: number): number {
  return compras
    .filter((c) => estaNoMes(c.data, mes, ano))
    .reduce((soma, c) => soma + calcularTotalCompra(c), 0);
}

export function calcularQuantidadeComprasMes(
  compras: CompraMercado[],
  mes: number,
  ano: number
): number {
  return compras.filter((c) => estaNoMes(c.data, mes, ano)).length;
}

export function obterMesAnterior(mes: number, ano: number): { mes: number; ano: number } {
  if (mes === 0) return { mes: 11, ano: ano - 1 };
  return { mes: mes - 1, ano };
}

export function calcularVariacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((atual - anterior) / anterior) * 100;
}

export interface ComparacaoItem {
  nome: string;
  precoMedioAtual: number;
  precoMedioAnterior: number | null;
  variacaoPercentual: number | null;
}

function calcularPrecoMedioPonderado(
  compras: CompraMercado[],
  nomeNormalizado: string,
  mes: number,
  ano: number
): number | null {
  let valorTotal = 0;
  let quantidadeTotal = 0;

  for (const compra of compras) {
    if (!estaNoMes(compra.data, mes, ano)) continue;
    for (const item of compra.itens) {
      if (normalizarNomeItem(item.nome) !== nomeNormalizado) continue;
      valorTotal += calcularSubtotalItem(item);
      quantidadeTotal += item.quantidade;
    }
  }

  if (quantidadeTotal === 0) return null;
  return valorTotal / quantidadeTotal;
}

export function calcularComparacaoItens(
  compras: CompraMercado[],
  mes: number,
  ano: number
): ComparacaoItem[] {
  const { mes: mesAnt, ano: anoAnt } = obterMesAnterior(mes, ano);

  const nomesExibicao = new Map<string, { nome: string; data: string }>();
  for (const compra of compras) {
    if (!estaNoMes(compra.data, mes, ano)) continue;
    for (const item of compra.itens) {
      const chave = normalizarNomeItem(item.nome);
      const atual = nomesExibicao.get(chave);
      if (!atual || compra.data >= atual.data) {
        nomesExibicao.set(chave, { nome: item.nome, data: compra.data });
      }
    }
  }

  const resultado: ComparacaoItem[] = [];
  for (const [nomeNormalizado, { nome: nomeExibicao }] of nomesExibicao) {
    const precoMedioAtual = calcularPrecoMedioPonderado(compras, nomeNormalizado, mes, ano);
    if (precoMedioAtual === null) continue;

    const precoMedioAnterior = calcularPrecoMedioPonderado(
      compras,
      nomeNormalizado,
      mesAnt,
      anoAnt
    );

    resultado.push({
      nome: nomeExibicao,
      precoMedioAtual,
      precoMedioAnterior,
      variacaoPercentual:
        precoMedioAnterior !== null
          ? calcularVariacaoPercentual(precoMedioAtual, precoMedioAnterior)
          : null,
    });
  }

  return resultado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function atualizarCatalogoMercado(
  catalogoAtual: CatalogoItemMercado[],
  compra: CompraMercado
): CatalogoItemMercado[] {
  const catalogo = new Map<string, CatalogoItemMercado>(
    catalogoAtual.map((entrada) => [entrada.nomeNormalizado, entrada])
  );

  for (const item of compra.itens) {
    const chave = normalizarNomeItem(item.nome);
    const existente = catalogo.get(chave);
    const marcas = new Set(existente?.marcas ?? []);

    if (item.marca && item.marca.trim() !== "") {
      marcas.add(item.marca.trim());
    }

    catalogo.set(chave, {
      nomeNormalizado: chave,
      nomeExibicao: item.nome,
      marcas: Array.from(marcas),
      ultimaUnidade: item.unidade,
      ultimoPreco: item.precoUnitario,
      atualizadoEm: new Date().toISOString(),
    });
  }

  return Array.from(catalogo.values());
}
