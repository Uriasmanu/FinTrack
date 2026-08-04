import { gerarId } from "./uuid";
import type { Transacao, TipoRecorrencia } from "@/types";

interface CriarParcelasParams {
  tipo: "receita" | "despesa";
  descricao: string;
  valor: number;
  dataInicio: string;
  categoriaId: string;
  contaId: string;
  cartaoId: string | null;
  tipoRecorrencia: TipoRecorrencia;
  parcelaAtual?: number;
  totalParcelas?: number;
}

export function criarTransacoesRecorrentes({
  tipo,
  descricao,
  valor,
  dataInicio,
  categoriaId,
  contaId,
  cartaoId,
  tipoRecorrencia,
  parcelaAtual = 1,
  totalParcelas = 1,
}: CriarParcelasParams): Transacao[] {
  const transacoes: Transacao[] = [];
  const data = new Date(dataInicio);
  const grupoId = gerarId();

  if (tipoRecorrencia === "unica") {
    transacoes.push({
      id: gerarId(),
      tipo,
      tipoRecorrencia: "unica",
      descricao,
      valor,
      data: dataInicio,
      categoriaId,
      contaId,
      cartaoId,
      parcelaAtual: 1,
      totalParcelas: 1,
      grupoParcelaId: null,
      criadoEm: new Date().toISOString(),
      confirmada: false,
    });
    return transacoes;
  }

  if (tipoRecorrencia === "parcelado") {
    const qtdParcelas = totalParcelas - parcelaAtual + 1;

    for (let i = 0; i < qtdParcelas; i++) {
      const dataParcela = new Date(data);
      dataParcela.setMonth(dataParcela.getMonth() + i);

      const numParcela = parcelaAtual + i;

      transacoes.push({
        id: gerarId(),
        tipo,
        tipoRecorrencia: "parcelado",
        descricao: `${descricao} ${numParcela}/${totalParcelas}`,
        valor,
        data: dataParcela.toISOString().split("T")[0],
        categoriaId,
        contaId,
        cartaoId,
        parcelaAtual: numParcela,
        totalParcelas,
        grupoParcelaId: grupoId,
        criadoEm: new Date().toISOString(),
        confirmada: false,
      });
    }
    return transacoes;
  }

  if (tipoRecorrencia === "recorrente") {
    const MESES_FUTUROS = 12;
    for (let i = 0; i < MESES_FUTUROS; i++) {
      const dataParcela = new Date(data);
      dataParcela.setMonth(dataParcela.getMonth() + i);

      transacoes.push({
        id: gerarId(),
        tipo,
        tipoRecorrencia: "recorrente",
        descricao,
        valor,
        data: dataParcela.toISOString().split("T")[0],
        categoriaId,
        contaId,
        cartaoId,
        parcelaAtual: 1,
        totalParcelas: 1,
        grupoParcelaId: grupoId,
        criadoEm: new Date().toISOString(),
        confirmada: false,
      });
    }
    return transacoes;
  }

  return transacoes;
}

export function gerarParcelasMesAtual(
  transacoes: Transacao[],
  mes: number,
  ano: number
): Transacao[] {
  return transacoes.filter((t) => {
    if (t.tipoRecorrencia !== "recorrente") return false;
    const data = new Date(t.data);
    return data.getDate() <= new Date(ano, mes + 1, 0).getDate();
  });
}

export function excluirParcelasFuturas(
  transacoes: Transacao[],
  grupoParcelaId: string,
  dataLimite: string
): Transacao[] {
  return transacoes.filter((t) => {
    if (t.grupoParcelaId !== grupoParcelaId) return true;
    return t.data <= dataLimite;
  });
}

export function recalcularParcelas(
  transacoes: Transacao[],
  grupoParcelaId: string,
  novoTotal: number
): Transacao[] {
  const primeiraParcela = transacoes.find(
    (t) => t.grupoParcelaId === grupoParcelaId
  );

  if (!primeiraParcela) return transacoes;

  const transacoesSemGrupo = transacoes.filter(
    (t) => t.grupoParcelaId !== grupoParcelaId
  );

  const novasParcelas = criarTransacoesRecorrentes({
    tipo: primeiraParcela.tipo,
    descricao: primeiraParcela.descricao.replace(/\s\d+\/\d+$/, ""),
    valor: primeiraParcela.valor,
    dataInicio: primeiraParcela.data,
    categoriaId: primeiraParcela.categoriaId,
    contaId: primeiraParcela.contaId,
    cartaoId: primeiraParcela.cartaoId,
    tipoRecorrencia: "parcelado",
    parcelaAtual: primeiraParcela.parcelaAtual,
    totalParcelas: novoTotal,
  });

  return [...transacoesSemGrupo, ...novasParcelas];
}
