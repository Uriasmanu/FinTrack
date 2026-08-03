import { create } from "zustand";
import type {
  DadosAno,
  Transacao,
  Categoria,
  Conta,
  Cartao,
  Meta,
  Config,
} from "@/types";
import { storage } from "@/lib/storage";
import { gerarId } from "@/lib/uuid";
import { obterCategoriasDefault, obterConfigDefault, obterMetasDefault } from "@/data/defaults";
import {
  criarTransacoesRecorrentes,
  excluirParcelasFuturas,
  recalcularParcelas,
} from "@/lib/transacoes";

interface FinanceState {
  dadosAno: DadosAno | null;
  inicializar: () => void;
  adicionarTransacao: (dados: Omit<Transacao, "id" | "criadoEm">) => void;
  adicionarTransacoesRecorrentes: (dados: Omit<Transacao, "id" | "criadoEm">) => void;
  editarTransacao: (id: string, dados: Partial<Transacao>) => void;
  excluirTransacao: (id: string) => void;
  excluirParcelasFuturas: (grupoParcelaId: string, dataLimite: string) => void;
  recalcularParcelas: (grupoParcelaId: string, novoTotal: number) => void;
  adicionarCategoria: (dados: Omit<Categoria, "id">) => void;
  editarCategoria: (id: string, dados: Partial<Categoria>) => void;
  excluirCategoria: (id: string) => void;
  adicionarConta: (dados: Omit<Conta, "id">) => void;
  editarConta: (id: string, dados: Partial<Conta>) => void;
  excluirConta: (id: string) => void;
  adicionarCartao: (dados: Omit<Cartao, "id">) => void;
  editarCartao: (id: string, dados: Partial<Cartao>) => void;
  excluirCartao: (id: string) => void;
  adicionarMeta: (dados: Omit<Meta, "id">) => void;
  editarMeta: (id: string, dados: Partial<Meta>) => void;
  excluirMeta: (id: string) => void;
  atualizarConfig: (dados: Partial<Config>) => void;
  obterSaldoAtual: () => number;
  obterReceitasMes: (mes: number) => number;
  obterDespesasMes: (mes: number) => number;
  obterTransacoesMes: (mes: number) => Transacao[];
  obterUltimasTransacoes: (quantidade: number) => Transacao[];
  obterSaldoConta: (contaId: string) => number;
  obterFaturaCartao: (cartaoId: string) => number;
}

function salvar(state: DadosAno) {
  storage.salvarDadosAno(state);
}

function adicionarItensArray<T extends { id: string }>(
  array: T[],
  item: T
): T[] {
  return [...array, item];
}

function editarItemArray<T extends { id: string }>(
  array: T[],
  id: string,
  dados: Partial<T>
): T[] {
  return array.map((item) => (item.id === id ? { ...item, ...dados } : item));
}

function excluirItemArray<T extends { id: string }>(
  array: T[],
  id: string
): T[] {
  return array.filter((item) => item.id !== id);
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  dadosAno: null,

  inicializar: () => {
    let dados = storage.verificarOuCriarAnoAtual();
    dados = storage.migrarDadosSeNecessario(dados);

    if (dados.categorias.length === 0) {
      dados.categorias = obterCategoriasDefault();
    }

    if (dados.config.salario === 0) {
      dados.config = obterConfigDefault();
    }

    if (dados.metas.length === 0) {
      dados.metas = obterMetasDefault();
    }

    salvar(dados);
    set({ dadosAno: dados });
  },

  adicionarTransacao: (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novaTransacao: Transacao = {
      ...dados,
      id: gerarId(),
      criadoEm: new Date().toISOString(),
    };

    const novoState: DadosAno = {
      ...state,
      transacoes: adicionarItensArray(state.transacoes, novaTransacao),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarTransacao: (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      transacoes: editarItemArray(state.transacoes, id, dados),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirTransacao: (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      transacoes: excluirItemArray(state.transacoes, id),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarTransacoesRecorrentes: (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novasTransacoes = criarTransacoesRecorrentes({
      tipo: dados.tipo,
      tipoRecorrencia: dados.tipoRecorrencia,
      descricao: dados.descricao,
      valor: dados.valor,
      dataInicio: dados.data,
      categoriaId: dados.categoriaId,
      contaId: dados.contaId,
      cartaoId: dados.cartaoId,
      parcelaAtual: dados.parcelaAtual,
      totalParcelas: dados.totalParcelas,
    });

    const novoState: DadosAno = {
      ...state,
      transacoes: [...state.transacoes, ...novasTransacoes],
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirParcelasFuturas: (grupoParcelaId, dataLimite) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      transacoes: excluirParcelasFuturas(
        state.transacoes,
        grupoParcelaId,
        dataLimite
      ),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  recalcularParcelas: (grupoParcelaId, novoTotal) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      transacoes: recalcularParcelas(
        state.transacoes,
        grupoParcelaId,
        novoTotal
      ),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarCategoria: (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novaCategoria: Categoria = { ...dados, id: gerarId() };

    const novoState: DadosAno = {
      ...state,
      categorias: adicionarItensArray(state.categorias, novaCategoria),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarCategoria: (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      categorias: editarItemArray(state.categorias, id, dados),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirCategoria: (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      categorias: excluirItemArray(state.categorias, id),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarConta: (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novaConta: Conta = { ...dados, id: gerarId() };

    const novoState: DadosAno = {
      ...state,
      contas: adicionarItensArray(state.contas, novaConta),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarConta: (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      contas: editarItemArray(state.contas, id, dados),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirConta: (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      contas: excluirItemArray(state.contas, id),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarCartao: (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoCartao: Cartao = { ...dados, id: gerarId() };

    const novoState: DadosAno = {
      ...state,
      cartoes: adicionarItensArray(state.cartoes, novoCartao),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarCartao: (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      cartoes: editarItemArray(state.cartoes, id, dados),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirCartao: (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      cartoes: excluirItemArray(state.cartoes, id),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarMeta: (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novaMeta: Meta = { ...dados, id: gerarId() };

    const novoState: DadosAno = {
      ...state,
      metas: adicionarItensArray(state.metas, novaMeta),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarMeta: (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      metas: editarItemArray(state.metas, id, dados),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirMeta: (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      metas: excluirItemArray(state.metas, id),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  atualizarConfig: (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      config: { ...state.config, ...dados },
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  obterSaldoAtual: () => {
    const state = get().dadosAno;
    if (!state) return 0;

    return state.transacoes.reduce((saldo, t) => {
      return t.tipo === "receita" ? saldo + t.valor : saldo - t.valor;
    }, 0);
  },

  obterReceitasMes: (mes) => {
    const state = get().dadosAno;
    if (!state) return 0;

    const anoAtual = state.ano;
    return state.transacoes
      .filter(
        (t) =>
          t.tipo === "receita" &&
          new Date(t.data).getMonth() === mes &&
          new Date(t.data).getFullYear() === anoAtual
      )
      .reduce((total, t) => total + t.valor, 0);
  },

  obterDespesasMes: (mes) => {
    const state = get().dadosAno;
    if (!state) return 0;

    const anoAtual = state.ano;
    return state.transacoes
      .filter(
        (t) =>
          t.tipo === "despesa" &&
          new Date(t.data).getMonth() === mes &&
          new Date(t.data).getFullYear() === anoAtual
      )
      .reduce((total, t) => total + t.valor, 0);
  },

  obterTransacoesMes: (mes) => {
    const state = get().dadosAno;
    if (!state) return [];

    const anoAtual = state.ano;
    return state.transacoes.filter((t) => {
      const data = new Date(t.data);
      return data.getMonth() === mes && data.getFullYear() === anoAtual;
    });
  },

  obterUltimasTransacoes: (quantidade) => {
    const state = get().dadosAno;
    if (!state) return [];

    return [...state.transacoes]
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, quantidade);
  },

  obterSaldoConta: (contaId) => {
    const state = get().dadosAno;
    if (!state) return 0;

    const conta = state.contas.find((c) => c.id === contaId);
    if (!conta) return 0;

    const saldoTransacoes = state.transacoes
      .filter((t) => t.contaId === contaId)
      .reduce((acc, t) => (t.tipo === "receita" ? acc + t.valor : acc - t.valor), 0);

    return conta.saldoInicial + saldoTransacoes;
  },

  obterFaturaCartao: (cartaoId) => {
    const state = get().dadosAno;
    if (!state) return 0;

    return state.transacoes
      .filter((t) => t.cartaoId === cartaoId && t.tipo === "despesa")
      .reduce((acc, t) => acc + t.valor, 0);
  },
}));
