import type { DadosAno } from "@/types";

const API_BASE = "/api";

function criarDadosAnoNovo(ano: number): DadosAno {
  return {
    ano,
    transacoes: [],
    categorias: [],
    contas: [],
    cartoes: [],
    metas: [],
    ativosFii: [],
    operacoesFii: [],
    dividendosFii: [],
    config: {
      salario: 0,
      tema: "claro",
      moeda: "BRL",
      multiplicadores: {
        viverDeRenda: 200,
        reservaEmergencia: 6,
        guardarPorMes: 0.1,
        contaFixa: 0.6,
        lazer: 0.3,
      },
      criadoEm: new Date().toISOString(),
    },
  };
}

async function carregarDadosAno(ano?: number): Promise<DadosAno> {
  try {
    const anoFinal = ano ?? new Date().getFullYear();
    const res = await fetch(`${API_BASE}/data/${anoFinal}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dados = await res.json();
    return dados as DadosAno;
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    const novoAno = ano ?? new Date().getFullYear();
    return criarDadosAnoNovo(novoAno);
  }
}

async function salvarDadosAno(dados: DadosAno): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/data/${dados.ano}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (erro) {
    console.error("Erro ao salvar dados:", erro);
    return false;
  }
}

async function verificarOuCriarAnoAtual(): Promise<DadosAno> {
  const anoAtual = new Date().getFullYear();
  return carregarDadosAno(anoAtual);
}

async function migrarDadosSeNecessario(dadosAtuais: DadosAno): Promise<DadosAno> {
  const anoAtual = new Date().getFullYear();

  if (dadosAtuais.ano === anoAtual) {
    return dadosAtuais;
  }

  const novosDados = criarDadosAnoNovo(anoAtual);
  novosDados.ativosFii = (dadosAtuais.ativosFii ?? []).filter((a) => a.ativo);
  await salvarDadosAno(novosDados);
  return novosDados;
}

async function listarAnosDisponiveis(): Promise<number[]> {
  try {
    const res = await fetch(`${API_BASE}/years`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (erro) {
    console.error("Erro ao listar anos:", erro);
    return [];
  }
}

async function excluirDadosAno(ano: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/data/${ano}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (erro) {
    console.error("Erro ao excluir dados:", erro);
    return false;
  }
}

async function exportarDados(ano: number): Promise<string | null> {
  try {
    const dados = await carregarDadosAno(ano);
    return JSON.stringify(dados, null, 2);
  } catch (erro) {
    console.error("Erro ao exportar dados:", erro);
    return null;
  }
}

async function importarDados(jsonString: string): Promise<DadosAno | null> {
  try {
    const dados = JSON.parse(jsonString);

    if (!dados || typeof dados !== "object") {
      console.error("Dados inválidos");
      return null;
    }

    if (!dados.ano || !Array.isArray(dados.transacoes)) {
      console.error("Estrutura de dados inválida");
      return null;
    }

    const dadosAno = dados as DadosAno;
    await salvarDadosAno(dadosAno);
    return dadosAno;
  } catch (erro) {
    console.error("Erro ao importar dados:", erro);
    return null;
  }
}

export const storage = {
  criarDadosAnoNovo,
  carregarDadosAno,
  salvarDadosAno,
  verificarOuCriarAnoAtual,
  migrarDadosSeNecessario,
  listarAnosDisponiveis,
  excluirDadosAno,
  exportarDados,
  importarDados,
};
