import { create } from "zustand";
import type {
  DadosAno,
  Transacao,
  Categoria,
  Conta,
  Cartao,
  Meta,
  Config,
  AtivoFii,
  OperacaoFii,
  DividendoFii,
  IndicadoresFii,
  StatusPrecoFii,
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
  inicializar: (ano?: number) => Promise<void>;
  adicionarTransacao: (dados: Omit<Transacao, "id" | "criadoEm">) => Promise<void>;
  adicionarTransacoesRecorrentes: (dados: Omit<Transacao, "id" | "criadoEm">) => Promise<void>;
  editarTransacao: (id: string, dados: Partial<Transacao>) => Promise<void>;
  excluirTransacao: (id: string) => Promise<void>;
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
  obterReceitasMes: (mes: number) => number;
  obterDespesasMes: (mes: number) => number;
  obterTransacoesMes: (mes: number) => Transacao[];
  obterUltimasTransacoes: (quantidade: number) => Transacao[];
  obterSaldoConta: (contaId: string) => number;
  obterFaturaCartao: (cartaoId: string) => number;
  obterSaldoAtualSemTicket: () => number;
  obterSaldoInicialContas: (contaId?: string) => number;

  // Ativos FII
  ativosFii: AtivoFii[];
  operacoesFii: OperacaoFii[];
  dividendosFii: DividendoFii[];
  adicionarAtivoFii: (dados: Omit<AtivoFii, "id" | "criadoEm" | "cotasAtuais" | "precoMedioCompra" | "ativo">) => Promise<void>;
  editarAtivoFii: (id: string, dados: Partial<AtivoFii>) => Promise<void>;
  excluirAtivoFii: (id: string) => Promise<void>;

  // Operações FII
  adicionarOperacaoFii: (dados: Omit<OperacaoFii, "id" | "criadoEm">) => Promise<void>;
  excluirOperacaoFii: (id: string) => Promise<void>;

  // Dividendos FII
  adicionarDividendoFii: (dados: Omit<DividendoFii, "id" | "criadoEm" | "totalRecebido">) => Promise<void>;
  editarDividendoFii: (id: string, dados: Partial<DividendoFii>) => Promise<void>;
  excluirDividendoFii: (id: string) => Promise<void>;

  // Seletores FII
  obterAtivosFiiAtivos: () => AtivoFii[];
  obterOperacoesFii: (ativoFiiId: string) => OperacaoFii[];
  obterDividendosFii: (ativoFiiId: string) => DividendoFii[];
  obterDividendosFiiMes: (mes: number, ano: number) => DividendoFii[];
  obterTotalDividendosAno: (ano: number) => number;
  obterIndicadoresFii: (ativoFiiId: string) => IndicadoresFii;
}

async function salvar(state: DadosAno) {
  await storage.salvarDadosAno(state);
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

  inicializar: async (ano?: number) => {
    let dados = await storage.verificarOuCriarAnoAtual(ano);
    dados = await storage.migrarDadosSeNecessario(dados);

    const categoriasDefault = obterCategoriasDefault();
    const categoriasExistentes = new Set(dados.categorias.map(c => c.id));
    const novasCategorias = categoriasDefault.filter(c => !categoriasExistentes.has(c.id));
    
    if (novasCategorias.length > 0) {
      dados.categorias = [...dados.categorias, ...novasCategorias];
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
    }

    if (dados.metas.length === 0) {
      dados.metas = obterMetasDefault();
    }

    await salvar(dados);
    set({ dadosAno: dados });
  },

  adicionarTransacao: async (dados) => {
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

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarTransacao: async (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      transacoes: editarItemArray(state.transacoes, id, dados),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirTransacao: async (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      transacoes: excluirItemArray(state.transacoes, id),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarTransacoesRecorrentes: async (dados) => {
    const state = get().dadosAno;
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

    const novoState: DadosAno = {
      ...state,
      transacoes: [...state.transacoes, ...novasTransacoes],
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirParcelasFuturas: async (grupoParcelaId, dataLimite) => {
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

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  recalcularParcelas: async (grupoParcelaId, novoTotal) => {
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

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarCategoria: async (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novaCategoria: Categoria = { ...dados, id: gerarId() };

    const novoState: DadosAno = {
      ...state,
      categorias: adicionarItensArray(state.categorias, novaCategoria),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarCategoria: async (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      categorias: editarItemArray(state.categorias, id, dados),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirCategoria: async (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      categorias: excluirItemArray(state.categorias, id),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarConta: async (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novaConta: Conta = { ...dados, id: gerarId() };

    const novoState: DadosAno = {
      ...state,
      contas: adicionarItensArray(state.contas, novaConta),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarConta: async (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      contas: editarItemArray(state.contas, id, dados),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirConta: async (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      contas: excluirItemArray(state.contas, id),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarCartao: async (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoCartao: Cartao = { ...dados, id: gerarId() };

    const novoState: DadosAno = {
      ...state,
      cartoes: adicionarItensArray(state.cartoes, novoCartao),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarCartao: async (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      cartoes: editarItemArray(state.cartoes, id, dados),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirCartao: async (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      cartoes: excluirItemArray(state.cartoes, id),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarMeta: async (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novaMeta: Meta = { ...dados, id: gerarId() };

    const novoState: DadosAno = {
      ...state,
      metas: adicionarItensArray(state.metas, novaMeta),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarMeta: async (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      metas: editarItemArray(state.metas, id, dados),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirMeta: async (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      metas: excluirItemArray(state.metas, id),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  atualizarConfig: async (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      config: { ...state.config, ...dados },
    };

    await salvar(novoState);
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

  obterSaldoAtualSemTicket: () => {
    const state = get().dadosAno;
    if (!state) return 0;

    const contaIdsTicket = state.contas
      .filter((c) => c.tipo === "ticket")
      .map((c) => c.id);

    return state.transacoes
      .filter((t) => !contaIdsTicket.includes(t.contaId))
      .reduce((saldo, t) => {
        return t.tipo === "receita" ? saldo + t.valor : saldo - t.valor;
      }, 0);
  },

  obterSaldoInicialContas: (contaId?: string) => {
    const state = get().dadosAno;
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
  operacoesFii: [],
  dividendosFii: [],

  adicionarAtivoFii: async (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoAtivo: AtivoFii = {
      ...dados,
      id: gerarId(),
      cotasAtuais: 0,
      precoMedioCompra: 0,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };

    const novoState: DadosAno = {
      ...state,
      ativosFii: adicionarItensArray(state.ativosFii, novoAtivo),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarAtivoFii: async (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      ativosFii: editarItemArray(state.ativosFii, id, dados),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirAtivoFii: async (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const temOperacoes = state.operacoesFii.some((o) => o.ativoFiiId === id);
    const temDividendos = state.dividendosFii.some((d) => d.ativoFiiId === id);

    if (temOperacoes || temDividendos) {
      throw new Error("Não é possível excluir ativo com operações ou dividendos vinculados");
    }

    const novoState: DadosAno = {
      ...state,
      ativosFii: excluirItemArray(state.ativosFii, id),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarOperacaoFii: async (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const ativo = state.ativosFii.find((a) => a.id === dados.ativoFiiId);
    if (!ativo) throw new Error("Ativo FII não encontrado");

    const novaOperacao: OperacaoFii = {
      ...dados,
      id: gerarId(),
      criadoEm: new Date().toISOString(),
    };

    let novasCotasAtuais = ativo.cotasAtuais;
    let novoPrecoMedio = ativo.precoMedioCompra;

    if (dados.tipo === "compra") {
      const custoTotal = dados.precoUnitario * dados.quantidade + (dados.taxaB3 ?? 0);
      novasCotasAtuais = ativo.cotasAtuais + dados.quantidade;
      novoPrecoMedio =
        novasCotasAtuais > 0
          ? (ativo.precoMedioCompra * ativo.cotasAtuais + custoTotal) / novasCotasAtuais
          : 0;
    } else {
      if (dados.quantidade > ativo.cotasAtuais) {
        throw new Error("Quantidade vendida maior que cotas disponíveis");
      }
      novasCotasAtuais = ativo.cotasAtuais - dados.quantidade;
    }

    const novosAtivos = state.ativosFii.map((a) => {
      if (a.id !== dados.ativoFiiId) return a;
      return {
        ...a,
        cotasAtuais: novasCotasAtuais,
        precoMedioCompra: dados.tipo === "compra" ? novoPrecoMedio : a.precoMedioCompra,
        ativo: novasCotasAtuais > 0,
      };
    });

    const novoState: DadosAno = {
      ...state,
      operacoesFii: adicionarItensArray(state.operacoesFii, novaOperacao),
      ativosFii: novosAtivos,
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirOperacaoFii: async (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      operacoesFii: excluirItemArray(state.operacoesFii, id),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarDividendoFii: async (dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoDividendo: DividendoFii = {
      ...dados,
      id: gerarId(),
      totalRecebido: dados.valorPorCota * dados.quantidadeCotas,
      criadoEm: new Date().toISOString(),
    };

    const novoState: DadosAno = {
      ...state,
      dividendosFii: adicionarItensArray(state.dividendosFii, novoDividendo),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarDividendoFii: async (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const dividendosAtualizados = state.dividendosFii.map((d) => {
      if (d.id !== id) return d;
      const atualizado = { ...d, ...dados };
      if (dados.valorPorCota !== undefined || dados.quantidadeCotas !== undefined) {
        atualizado.totalRecebido = atualizado.valorPorCota * atualizado.quantidadeCotas;
      }
      return atualizado;
    });

    const novoState: DadosAno = {
      ...state,
      dividendosFii: dividendosAtualizados,
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirDividendoFii: async (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      dividendosFii: excluirItemArray(state.dividendosFii, id),
    };

    await salvar(novoState);
    set({ dadosAno: novoState });
  },

  obterAtivosFiiAtivos: () => {
    const state = get().dadosAno;
    if (!state) return [];
    return state.ativosFii.filter((a) => a.ativo);
  },

  obterOperacoesFii: (ativoFiiId) => {
    const state = get().dadosAno;
    if (!state) return [];
    return state.operacoesFii.filter((o) => o.ativoFiiId === ativoFiiId);
  },

  obterDividendosFii: (ativoFiiId) => {
    const state = get().dadosAno;
    if (!state) return [];
    return state.dividendosFii.filter((d) => d.ativoFiiId === ativoFiiId);
  },

  obterDividendosFiiMes: (mes, ano) => {
    const state = get().dadosAno;
    if (!state) return [];
    return state.dividendosFii.filter((d) => {
      const data = new Date(d.dataPagamento);
      return data.getMonth() === mes && data.getFullYear() === ano;
    });
  },

  obterTotalDividendosAno: (ano) => {
    const state = get().dadosAno;
    if (!state) return 0;
    return state.dividendosFii
      .filter((d) => new Date(d.dataPagamento).getFullYear() === ano)
      .reduce((total, d) => total + d.totalRecebido, 0);
  },

  obterIndicadoresFii: (ativoFiiId) => {
    const state = get().dadosAno;
    if (!state) {
      return {
        pVp: 0,
        precoTeto: 0,
        dyMensal: 0,
        dyAnual: 0,
        yieldOnCost: 0,
        statusPreco: "justo",
        alertaVenda: false,
        alertaGanhoNaoRecorrente: false,
        lucroPrejuizoValor: 0,
        lucroPrejuizoPercentual: 0,
      };
    }

    const ativo = state.ativosFii.find((a) => a.id === ativoFiiId);
    if (!ativo) {
      return {
        pVp: 0,
        precoTeto: 0,
        dyMensal: 0,
        dyAnual: 0,
        yieldOnCost: 0,
        statusPreco: "justo",
        alertaVenda: false,
        alertaGanhoNaoRecorrente: false,
        lucroPrejuizoValor: 0,
        lucroPrejuizoPercentual: 0,
      };
    }

    const dividendosAtivo = state.dividendosFii.filter((d) => d.ativoFiiId === ativoFiiId);
    const ultimos12Meses = dividendosAtivo.filter((d) => {
      const data = new Date(d.dataPagamento);
      const agora = new Date();
      const hace12Meses = new Date();
      hace12Meses.setMonth(hace12Meses.getMonth() - 12);
      return data >= hace12Meses && data <= agora;
    });

    const totalDividendos12Meses = ultimos12Meses.reduce((acc, d) => acc + d.totalRecebido, 0);
    const dividendosMesAtual = dividendosAtivo.filter((d) => {
      const data = new Date(d.dataPagamento);
      const agora = new Date();
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    });
    const dividendosMesAtualTotal = dividendosMesAtual.reduce((acc, d) => acc + d.totalRecebido, 0);

    const pVp = ativo.valorPatrimonialCota > 0
      ? ativo.precoAtualMercado / ativo.valorPatrimonialCota
      : 0;

    const precoTeto = ativo.valorPatrimonialCota * 1.0;

    const dyMensal = ativo.precoAtualMercado > 0
      ? (dividendosMesAtualTotal / ativo.precoAtualMercado) * 100
      : 0;

    const dyAnual = ativo.precoAtualMercado > 0
      ? (totalDividendos12Meses / ativo.precoAtualMercado) * 100
      : 0;

    const yieldOnCost = ativo.precoMedioCompra > 0
      ? (totalDividendos12Meses / ativo.precoMedioCompra) * 100
      : 0;

    let statusPreco: StatusPrecoFii = "justo";
    if (pVp < 0.9) statusPreco = "desconto";
    else if (pVp <= 1.05) statusPreco = "justo";
    else if (pVp <= 1.2) statusPreco = "agio_moderado";
    else statusPreco = "agio_excessivo";

    const alertaVenda = pVp > 1.2 || dyAnual < 6;

    const ganhosNaoRecorrentes = dividendosAtivo.filter((d) => !d.recorrente);
    const alertaGanhoNaoRecorrente = ganhosNaoRecorrentes.length > 0;

    const lucroPrejuizoValor = ativo.cotasAtuais > 0
      ? (ativo.precoAtualMercado - ativo.precoMedioCompra) * ativo.cotasAtuais
      : 0;

    const lucroPrejuizoPercentual = ativo.precoMedioCompra > 0
      ? ((ativo.precoAtualMercado - ativo.precoMedioCompra) / ativo.precoMedioCompra) * 100
      : 0;

    return {
      pVp,
      precoTeto,
      dyMensal,
      dyAnual,
      yieldOnCost,
      statusPreco,
      alertaVenda,
      alertaGanhoNaoRecorrente,
      lucroPrejuizoValor,
      lucroPrejuizoPercentual,
    };
  },
}));
