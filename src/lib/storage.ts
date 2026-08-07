import type { DadosApp } from "@/types";

const API_BASE = "/api";

function criarDadosNovos(): DadosApp {
  return {
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

async function carregarDados(): Promise<DadosApp> {
  try {
    const res = await fetch(`${API_BASE}/data`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dados = await res.json();
    return dados as DadosApp;
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    return criarDadosNovos();
  }
}

async function salvarDados(dados: DadosApp): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/data`, {
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

async function excluirDados(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/data`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (erro) {
    console.error("Erro ao excluir dados:", erro);
    return false;
  }
}

async function exportarDados(): Promise<string | null> {
  try {
    const dados = await carregarDados();
    return JSON.stringify(dados, null, 2);
  } catch (erro) {
    console.error("Erro ao exportar dados:", erro);
    return null;
  }
}

async function importarDados(jsonString: string): Promise<DadosApp | null> {
  try {
    const dados = JSON.parse(jsonString);

    if (!dados || typeof dados !== "object" || !Array.isArray(dados.transacoes)) {
      console.error("Estrutura de dados inválida");
      return null;
    }

    const dadosApp = dados as DadosApp;
    const salvo = await salvarDados(dadosApp);
    if (!salvo) {
      console.error("Falha ao salvar dados no servidor");
      return null;
    }
    return dadosApp;
  } catch (erro) {
    console.error("Erro ao importar dados:", erro);
    return null;
  }
}

export const storage = {
  criarDadosNovos,
  carregarDados,
  salvarDados,
  listarAnosDisponiveis,
  excluirDados,
  exportarDados,
  importarDados,
};
