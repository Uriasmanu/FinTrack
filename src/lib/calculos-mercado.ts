import type { CompraMercado, ItemMercado, CatalogoItemMercado, UnidadeMedida } from "@/types";

export type Dimensao = "contagem" | "massa" | "volume";
export type ItemCalculavel = Pick<ItemMercado, "unidade" | "precoUnitario" | "quantidade">;

const DIMENSAO_POR_UNIDADE: Record<UnidadeMedida, Dimensao> = {
  un: "contagem",
  g: "massa",
  kg: "massa",
  ml: "volume",
  L: "volume",
};

const FATOR_PARA_BASE: Record<UnidadeMedida, number> = {
  un: 1,
  g: 0.001,
  kg: 1,
  ml: 0.001,
  L: 1,
};

const UNIDADE_BASE: Record<Dimensao, UnidadeMedida> = {
  contagem: "un",
  massa: "kg",
  volume: "L",
};

export function dimensaoDaUnidade(unidade: UnidadeMedida): Dimensao {
  return DIMENSAO_POR_UNIDADE[unidade];
}

export function unidadeBaseDaDimensao(dimensao: Dimensao): UnidadeMedida {
  return UNIDADE_BASE[dimensao];
}

function quantidadeNaBase(item: ItemCalculavel): number {
  return item.quantidade * FATOR_PARA_BASE[item.unidade];
}

export function normalizarNomeItem(nome: string): string {
  return nome.trim().toLowerCase();
}

export function calcularSubtotalItem(item: ItemCalculavel): number {
  return item.unidade === "un" ? item.precoUnitario * item.quantidade : item.precoUnitario;
}

export function calcularPrecoPorUnidadeBase(item: ItemCalculavel): number | null {
  const base = quantidadeNaBase(item);
  if (!(base > 0)) return null;
  return calcularSubtotalItem(item) / base;
}

export function calcularTotalCompra(compra: CompraMercado): number {
  return compra.itens.reduce((soma, item) => soma + calcularSubtotalItem(item), 0);
}

// Não usar new Date(data): "YYYY-MM-DD" é lido como UTC e recua um dia no fuso do Brasil.
function estaNoMes(data: string, mes: number, ano: number): boolean {
  const [anoData, mesData] = data.split("-").map(Number);
  return anoData === ano && mesData - 1 === mes;
}

export function dataLocalISO(data: Date = new Date()): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
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
  chave: string;
  nome: string;
  dimensao: Dimensao;
  unidadeBase: UnidadeMedida;
  precoMedioAtual: number;
  precoMedioAnterior: number | null;
  variacaoPercentual: number | null;
}

function chaveComparacao(item: ItemMercado): string {
  return `${normalizarNomeItem(item.nome)}|${dimensaoDaUnidade(item.unidade)}`;
}

function calcularPrecoMedioPonderado(
  compras: CompraMercado[],
  chave: string,
  mes: number,
  ano: number
): number | null {
  let valorTotal = 0;
  let baseTotal = 0;

  for (const compra of compras) {
    if (!estaNoMes(compra.data, mes, ano)) continue;
    for (const item of compra.itens) {
      if (chaveComparacao(item) !== chave) continue;
      valorTotal += calcularSubtotalItem(item);
      baseTotal += quantidadeNaBase(item);
    }
  }

  if (baseTotal <= 0) return null;
  return valorTotal / baseTotal;
}

export function calcularComparacaoItens(
  compras: CompraMercado[],
  mes: number,
  ano: number
): ComparacaoItem[] {
  const { mes: mesAnt, ano: anoAnt } = obterMesAnterior(mes, ano);

  const exibicao = new Map<string, { nome: string; data: string; dimensao: Dimensao }>();
  for (const compra of compras) {
    if (!estaNoMes(compra.data, mes, ano)) continue;
    for (const item of compra.itens) {
      const chave = chaveComparacao(item);
      const atual = exibicao.get(chave);
      if (!atual || compra.data >= atual.data) {
        exibicao.set(chave, {
          nome: item.nome,
          data: compra.data,
          dimensao: dimensaoDaUnidade(item.unidade),
        });
      }
    }
  }

  const resultado: ComparacaoItem[] = [];
  for (const [chave, { nome, dimensao }] of exibicao) {
    const precoMedioAtual = calcularPrecoMedioPonderado(compras, chave, mes, ano);
    if (precoMedioAtual === null) continue;

    const precoMedioAnterior = calcularPrecoMedioPonderado(compras, chave, mesAnt, anoAnt);

    resultado.push({
      chave,
      nome,
      dimensao,
      unidadeBase: unidadeBaseDaDimensao(dimensao),
      precoMedioAtual,
      precoMedioAnterior,
      variacaoPercentual:
        precoMedioAnterior !== null
          ? calcularVariacaoPercentual(precoMedioAtual, precoMedioAnterior)
          : null,
    });
  }

  return resultado.sort(
    (a, b) => a.nome.localeCompare(b.nome, "pt-BR") || a.dimensao.localeCompare(b.dimensao)
  );
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
      ultimoPreco: calcularPrecoPorUnidadeBase(item) ?? existente?.ultimoPreco ?? item.precoUnitario,
      atualizadoEm: new Date().toISOString(),
    });
  }

  return Array.from(catalogo.values());
}

export function editarEntradaCatalogoMercado(
  catalogo: CatalogoItemMercado[],
  nomeNormalizadoAntigo: string,
  dados: { nome: string; marcas: string[] }
): CatalogoItemMercado[] {
  const entradaAntiga = catalogo.find((c) => c.nomeNormalizado === nomeNormalizadoAntigo);
  if (!entradaAntiga) return catalogo;

  const novoNomeNormalizado = normalizarNomeItem(dados.nome);
  const marcasLimpas = Array.from(
    new Set(dados.marcas.map((m) => m.trim()).filter((m) => m !== ""))
  );

  const restante = catalogo.filter((c) => c.nomeNormalizado !== nomeNormalizadoAntigo);
  const entradaColidente = restante.find((c) => c.nomeNormalizado === novoNomeNormalizado);

  const maisRecente =
    entradaColidente && entradaColidente.atualizadoEm > entradaAntiga.atualizadoEm
      ? entradaColidente
      : entradaAntiga;

  const entradaAtualizada: CatalogoItemMercado = {
    nomeNormalizado: novoNomeNormalizado,
    nomeExibicao: dados.nome,
    marcas: entradaColidente
      ? Array.from(new Set([...entradaColidente.marcas, ...marcasLimpas]))
      : marcasLimpas,
    ultimaUnidade: maisRecente.ultimaUnidade,
    ultimoPreco: maisRecente.ultimoPreco,
    atualizadoEm: new Date().toISOString(),
  };

  return [
    ...restante.filter((c) => c.nomeNormalizado !== novoNomeNormalizado),
    entradaAtualizada,
  ];
}

export function excluirEntradaCatalogoMercado(
  catalogo: CatalogoItemMercado[],
  nomeNormalizado: string
): CatalogoItemMercado[] {
  return catalogo.filter((c) => c.nomeNormalizado !== nomeNormalizado);
}

export function renomearItemNasCompras(
  compras: CompraMercado[],
  nomeNormalizadoAntigo: string,
  novoNome: string,
  marcaParaItensSemMarca?: string
): CompraMercado[] {
  const marcaNova = marcaParaItensSemMarca?.trim() || undefined;

  return compras.map((compra) => {
    let mudou = false;
    const itens = compra.itens.map((item) => {
      if (normalizarNomeItem(item.nome) !== nomeNormalizadoAntigo) return item;
      mudou = true;
      return {
        ...item,
        nome: novoNome.trim(),
        marca: item.marca?.trim() ? item.marca : marcaNova,
      };
    });
    return mudou ? { ...compra, itens } : compra;
  });
}
