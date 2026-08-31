import { create } from "zustand";
import type {
  DadosApp,
  Transacao,
  Categoria,
  Conta,
  Cartao,
  Meta,
  Config,
  AtivoFii,
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
  dados: DadosApp | null;
  inicializar: () => Promise<void>;
  adicionarTransacao: (dados: Omit<Transacao, "id" | "criadoEm">) => Promise<void>;
  adicionarTransacoesRecorrentes: (dados: Omit<Transacao, "id" | "criadoEm">) => Promise<void>;
  editarTransacao: (id: string, dados: Partial<Transacao>) => Promise<void>;
  editarTransacoesEmLote: (ids: string[], dados: Partial<Transacao>) => Promise<void>;
  excluirTransacao: (id: string) => Promise<void>;
  salvarEstado: () => Promise<void>;
  excluirParcelasFuturas: (grupoParcelaId: string, dataLimite: string) => Promise<void>;
  recalcularParcelas: (grupoParcelaId: string, novoTotal: number) => Promise<void>;
  adicionarCategoria: (dados: Omit<Categoria, "id">) => Promise<void>;
  editarCategoria: (id: string, dados: Partial<Categoria>) => Promise<void>;
  excluirCategoria: (id: string) => Promise<void>;
  adicionarConta: (dados: Omit<Conta, "id">) => Promise<void>;
  editarConta: (id: string, dados: Partial<Conta>) => Promise<void>;
  excluirConta: (id: string) => Promise<void>;
  adicionarCartao: (dados: Omit<Cartao, "id">) => Promise<void>;
  editarCartao: (id: string, dados: Partial<Cartao>) => Promise<void>;
  excluirCartao: (id: string) => Promise<void>;
  adicionarMeta: (dados: Omit<Meta, "id">) => Promise<void>;
  editarMeta: (id: string, dados: Partial<Meta>) => Promise<void>;
  excluirMeta: (id: string) => Promise<void>;
  atualizarConfig: (dados: Partial<Config>) => Promise<void>;
  obterSaldoAtual: () => number;
  obterReceitasMes: (mes: number, ano: number) => number;
  obterDespesasMes: (mes: number, ano: number) => number;
  obterTransacoesMes: (mes: number, ano: number) => Transacao[];
  obterUltimasTransacoes: (quantidade: number) => Transacao[];
  obterSaldoConta: (contaId: string) => number;
  obterFaturaCartao: (cartaoId: string) => number;
  obterSaldoAtualSemTicket: () => number;
  obterSaldoInicialContas: (contaId?: string) => number;

  // Ativos FII
  ativosFii: AtivoFii[];
  adicionarAtivoFii: (dados: Omit<AtivoFii, "id" | "criadoEm" | "ativo">) => Promise<void>;
  editarAtivoFii: (id: string, dados: Partial<AtivoFii>) => Promise<void>;
  excluirAtivoFii: (id: string) => Promise<void>;
  obterAtivosFiiAtivos: () => AtivoFii[];
}

async function salvar(state: DadosApp) {
  const ok = await storage.salvarDados(state);
  if (!ok) throw new Error("Falha ao salvar dados no servidor");
}

let inicializacaoEmAndamento = false;

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
  dados: null,

  inicializar: async () => {
    if (inicializacaoEmAndamento) return;
    inicializacaoEmAndamento = true;

    let dados = await storage.carregarDados();
    let houveMudanca = false;

    const categoriasVistas = new Set<string>();
    const categoriasSemDuplicatas = dados.categorias.filter((c) => {
      if (categoriasVistas.has(c.id)) return false;
      categoriasVistas.add(c.id);
      return true;
    });
    if (categoriasSemDuplicatas.length !== dados.categorias.length) {
      dados.categorias = categoriasSemDuplicatas;
      houveMudanca = true;
    }

    const categoriasDefault = obterCategoriasDefault();
    const categoriasExistentes = new Set(dados.categorias.map(c => c.id));
    const novasCategorias = categoriasDefault.filter(c => !categoriasExistentes.has(c.id));
    
    if (novasCategorias.length > 0) {
      dados.categorias = [...dados.categorias, ...novasCategorias];
      houveMudanca = true;
    }

    const configDefault = obterConfigDefault();
    if (!dados.config.criadoEm) {
      dados.config = {
        salario: dados.config.salario || configDefault.salario,
        tema: dados.config.tema || configDefault.tema,
        moeda: dados.config.moeda || configDefault.moeda,
        multiplicadores: dados.config.multiplicadores || configDefault.multiplicadores,
        criadoEm: dados.config.criadoEm || new Date().toISOString(),
      };
      houveMudanca = true;
    }

    if (dados.metas.length === 0) {
      dados.metas = obterMetasDefault();
      houveMudanca = true;
    }

    if (houveMudanca) {
      await salvar(dados);
    }
    set({ dados });
    inicializacaoEmAndamento = false;
  },

  adicionarTransacao: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novaTransacao: Transacao = {
      ...dados,
      id: gerarId(),
      criadoEm: new Date().toISOString(),
    };

    const novoState: DadosApp = {
      ...state,
      transacoes: adicionarItensArray(state.transacoes, novaTransacao),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  editarTransacao: async (id, dados) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      transacoes: editarItemArray(state.transacoes, id, dados),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch (erro) {
      set({ dados: state });
      throw erro;
    }
  },

  editarTransacoesEmLote: async (ids, dados) => {
    const state = get().dados;
    if (!state) return;

    const idsSet = new Set(ids);
    const novoState: DadosApp = {
      ...state,
      transacoes: state.transacoes.map((t) =>
        idsSet.has(t.id) ? { ...t, ...dados } : t
      ),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch (erro) {
      set({ dados: state });
      throw erro;
    }
  },

  salvarEstado: async () => {
    const state = get().dados;
    if (!state) return;
    await salvar(state);
  },

  excluirTransacao: async (id) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      transacoes: excluirItemArray(state.transacoes, id),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch (erro) {
      set({ dados: state });
      throw erro;
    }
  },

  adicionarTransacoesRecorrentes: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novasTransacoes = criarTransacoesRecorrentes({
      tipo: dados.tipo,
      tipoRecorrencia: dados.tipoRecorrencia,
      descricao: dados.descricao,
      valor: dados.valor,
      dataInicio: dados.data,
      categoriaId: dados.categoriaId,
      subtipoId: dados.subtipoId,
      contaId: dados.contaId,
      cartaoId: dados.cartaoId,
      parcelaAtual: dados.parcelaAtual,
      totalParcelas: dados.totalParcelas,
      intervaloDias: dados.intervaloDias ?? null,
    });

    const novoState: DadosApp = {
      ...state,
      transacoes: [...state.transacoes, ...novasTransacoes],
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch (erro) {
      set({ dados: state });
      throw erro;
    }
  },

  excluirParcelasFuturas: async (grupoParcelaId, dataLimite) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      transacoes: excluirParcelasFuturas(
        state.transacoes,
        grupoParcelaId,
        dataLimite
      ),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch (erro) {
      set({ dados: state });
      throw erro;
    }
  },

  recalcularParcelas: async (grupoParcelaId, novoTotal) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      transacoes: recalcularParcelas(
        state.transacoes,
        grupoParcelaId,
        novoTotal
      ),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch (erro) {
      set({ dados: state });
      throw erro;
    }
  },

  adicionarCategoria: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novaCategoria: Categoria = { ...dados, id: gerarId() };

    const novoState: DadosApp = {
      ...state,
      categorias: adicionarItensArray(state.categorias, novaCategoria),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  editarCategoria: async (id, dados) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      categorias: editarItemArray(state.categorias, id, dados),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  excluirCategoria: async (id) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      categorias: excluirItemArray(state.categorias, id),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  adicionarConta: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const agora = new Date().toISOString();
    const novaConta: Conta = { ...dados, id: gerarId(), criadoEm: agora, atualizadoEm: agora };

    const novoState: DadosApp = {
      ...state,
      contas: adicionarItensArray(state.contas, novaConta),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  editarConta: async (id, dados) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      contas: editarItemArray(state.contas, id, {
        ...dados,
        atualizadoEm: new Date().toISOString(),
      }),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  excluirConta: async (id) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      contas: excluirItemArray(state.contas, id),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  adicionarCartao: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novoCartao: Cartao = { ...dados, id: gerarId() };

    const novoState: DadosApp = {
      ...state,
      cartoes: adicionarItensArray(state.cartoes, novoCartao),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  editarCartao: async (id, dados) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      cartoes: editarItemArray(state.cartoes, id, dados),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  excluirCartao: async (id) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      cartoes: excluirItemArray(state.cartoes, id),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  adicionarMeta: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novaMeta: Meta = { ...dados, id: gerarId() };

    const novoState: DadosApp = {
      ...state,
      metas: adicionarItensArray(state.metas, novaMeta),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  editarMeta: async (id, dados) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      metas: editarItemArray(state.metas, id, dados),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  excluirMeta: async (id) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      metas: excluirItemArray(state.metas, id),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  atualizarConfig: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      config: { ...state.config, ...dados },
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  obterSaldoAtual: () => {
    const state = get().dados;
    if (!state) return 0;

    return state.transacoes
      .filter((t) => t.confirmada)
      .reduce((saldo, t) => {
        return t.tipo === "receita" ? saldo + t.valor : saldo - t.valor;
      }, 0);
  },

  obterReceitasMes: (mes, ano) => {
    const state = get().dados;
    if (!state) return 0;

    return state.transacoes
      .filter(
        (t) =>
          t.confirmada &&
          t.tipo === "receita" &&
          new Date(t.data).getMonth() === mes &&
          new Date(t.data).getFullYear() === ano
      )
      .reduce((total, t) => total + t.valor, 0);
  },

  obterDespesasMes: (mes, ano) => {
    const state = get().dados;
    if (!state) return 0;

    return state.transacoes
      .filter(
        (t) =>
          t.confirmada &&
          t.tipo === "despesa" &&
          new Date(t.data).getMonth() === mes &&
          new Date(t.data).getFullYear() === ano
      )
      .reduce((total, t) => total + t.valor, 0);
  },

  obterTransacoesMes: (mes, ano) => {
    const state = get().dados;
    if (!state) return [];

    return state.transacoes.filter((t) => {
      if (!t.confirmada) return false;
      const data = new Date(t.data);
      return data.getMonth() === mes && data.getFullYear() === ano;
    });
  },

  obterUltimasTransacoes: (quantidade) => {
    const state = get().dados;
    if (!state) return [];

    return [...state.transacoes]
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, quantidade);
  },

  obterSaldoConta: (contaId) => {
    const state = get().dados;
    if (!state) return 0;

    const conta = state.contas.find((c) => c.id === contaId);
    if (!conta) return 0;

    const saldoTransacoes = state.transacoes
      .filter((t) => t.contaId === contaId && t.confirmada)
      .reduce((acc, t) => (t.tipo === "receita" ? acc + t.valor : acc - t.valor), 0);

    return conta.saldoInicial + saldoTransacoes;
  },

  obterFaturaCartao: (cartaoId) => {
    const state = get().dados;
    if (!state) return 0;

    return state.transacoes
      .filter((t) => t.cartaoId === cartaoId && t.tipo === "despesa" && t.confirmada)
      .reduce((acc, t) => acc + t.valor, 0);
  },

  obterSaldoAtualSemTicket: () => {
    const state = get().dados;
    if (!state) return 0;

    const contaIdsTicket = state.contas
      .filter((c) => c.tipo === "ticket")
      .map((c) => c.id);

    return state.transacoes
      .filter((t) => !contaIdsTicket.includes(t.contaId) && t.confirmada)
      .reduce((saldo, t) => {
        return t.tipo === "receita" ? saldo + t.valor : saldo - t.valor;
      }, 0);
  },

  obterSaldoInicialContas: (contaId?: string) => {
    const state = get().dados;
    if (!state) return 0;

    return state.contas
      .filter((c) => {
        if (contaId && c.id !== contaId) return false;
        return true;
      })
      .reduce((acc, c) => acc + (c.saldoInicial ?? 0), 0);
  },

  // ==================== FII ====================

  ativosFii: [],

  adicionarAtivoFii: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novoAtivo: AtivoFii = {
      ...dados,
      id: gerarId(),
      ativo: true,
      criadoEm: new Date().toISOString(),
    };

    const novoState: DadosApp = {
      ...state,
      ativosFii: adicionarItensArray(state.ativosFii, novoAtivo),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  editarAtivoFii: async (id, dados) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      ativosFii: editarItemArray(state.ativosFii, id, dados),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  excluirAtivoFii: async (id) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      ativosFii: excluirItemArray(state.ativosFii, id),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },

  obterAtivosFiiAtivos: () => {
    const state = get().dados;
    if (!state) return [];
    return state.ativosFii.filter((a) => a.ativo);
  },
}));
