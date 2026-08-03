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
  try {
    const chave = obterChaveAno(ano);
    const dados = localStorage.getItem(chave);

    if (!dados) {
      const novoAno = ano ?? new Date().getFullYear();
      return criarDadosAnoNovo(novoAno);
    }

    const dadosParseados = JSON.parse(dados);

    if (!dadosParseados || typeof dadosParseados !== "object") {
      const novoAno = ano ?? new Date().getFullYear();
      return criarDadosAnoNovo(novoAno);
    }

    if (!dadosParseados.ano || !Array.isArray(dadosParseados.transacoes)) {
      const novoAno = ano ?? new Date().getFullYear();
      return criarDadosAnoNovo(novoAno);
    }

    return dadosParseados as DadosAno;
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    const novoAno = ano ?? new Date().getFullYear();
    return criarDadosAnoNovo(novoAno);
  }
}

function salvarDadosAno(dados: DadosAno): boolean {
  try {
    const chave = obterChaveAno(dados.ano);
    const dadosString = JSON.stringify(dados);

    if (!dadosString) {
      console.error("Erro ao serializar dados");
      return false;
    }

    localStorage.setItem(chave, dadosString);
    return true;
  } catch (erro) {
    console.error("Erro ao salvar dados:", erro);
    return false;
  }
}

function verificarOuCriarAnoAtual(): DadosAno {
  const anoAtual = new Date().getFullYear();
  return carregarDadosAno(anoAtual);
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

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave?.startsWith(`${PREFIXO}_`)) {
        const ano = parseInt(chave.replace(`${PREFIXO}_`, ""), 10);
        if (!isNaN(ano)) {
          anos.push(ano);
        }
      }
    }
  } catch (erro) {
    console.error("Erro ao listar anos:", erro);
  }

  return anos.sort((a, b) => b - a);
}

function excluirDadosAno(ano: number): boolean {
  try {
    const chave = obterChaveAno(ano);
    localStorage.removeItem(chave);
    return true;
  } catch (erro) {
    console.error("Erro ao excluir dados:", erro);
    return false;
  }
}

function exportarDados(ano: number): string | null {
  try {
    const dados = carregarDadosAno(ano);
    return JSON.stringify(dados, null, 2);
  } catch (erro) {
    console.error("Erro ao exportar dados:", erro);
    return null;
  }
}

function importarDados(jsonString: string): DadosAno | null {
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
    salvarDadosAno(dadosAno);
    return dadosAno;
  } catch (erro) {
    console.error("Erro ao importar dados:", erro);
    return null;
  }
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
  exportarDados,
  importarDados,
};
