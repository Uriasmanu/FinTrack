import type { DadosAno } from "@/types";

const PREFIXO = "fintrack";

function obterChaveAno(ano?: number): string {
  const anoAtual = ano ?? new Date().getFullYear();
  return `${PREFIXO}_${anoAtual}`;
}

function criarDadosAnoNovo(ano: number): DadosAno {
  return {
    ano,
    transacoes: [],
    categorias: [],
    contas: [],
    cartoes: [],
    metas: [],
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
    },
  };
}

function carregarDadosAno(ano?: number): DadosAno {
  const chave = obterChaveAno(ano);
  const dados = localStorage.getItem(chave);

  if (!dados) {
    const novoAno = ano ?? new Date().getFullYear();
    return criarDadosAnoNovo(novoAno);
  }

  try {
    return JSON.parse(dados) as DadosAno;
  } catch {
    const novoAno = ano ?? new Date().getFullYear();
    return criarDadosAnoNovo(novoAno);
  }
}

function salvarDadosAno(dados: DadosAno): void {
  const chave = obterChaveAno(dados.ano);
  localStorage.setItem(chave, JSON.stringify(dados));
}

function verificarOuCriarAnoAtual(): DadosAno {
  const anoAtual = new Date().getFullYear();
  const chave = obterChaveAno(anoAtual);
  const dados = localStorage.getItem(chave);

  if (!dados) {
    const novoDados = criarDadosAnoNovo(anoAtual);
    salvarDadosAno(novoDados);
    return novoDados;
  }

  try {
    return JSON.parse(dados) as DadosAno;
  } catch {
    const novoDados = criarDadosAnoNovo(anoAtual);
    salvarDadosAno(novoDados);
    return novoDados;
  }
}

function migrarDadosSeNecessario(dadosAtuais: DadosAno): DadosAno {
  const anoAtual = new Date().getFullYear();

  if (dadosAtuais.ano === anoAtual) {
    return dadosAtuais;
  }

  const novosDados = criarDadosAnoNovo(anoAtual);
  salvarDadosAno(novosDados);
  return novosDados;
}

function listarAnosDisponiveis(): number[] {
  const anos: number[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave?.startsWith(`${PREFIXO}_`)) {
      const ano = parseInt(chave.replace(`${PREFIXO}_`, ""), 10);
      if (!isNaN(ano)) {
        anos.push(ano);
      }
    }
  }

  return anos.sort((a, b) => b - a);
}

function excluirDadosAno(ano: number): void {
  const chave = obterChaveAno(ano);
  localStorage.removeItem(chave);
}

export const storage = {
  obterChaveAno,
  criarDadosAnoNovo,
  carregarDadosAno,
  salvarDadosAno,
  verificarOuCriarAnoAtual,
  migrarDadosSeNecessario,
  listarAnosDisponiveis,
  excluirDadosAno,
};
