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
  obterSaldoAtualSemTicket: () => number;
  obterSaldoInicialContas: (contaId?: string) => number;

  // Ativos FII
  ativosFii: AtivoFii[];
  operacoesFii: OperacaoFii[];
  dividendosFii: DividendoFii[];
  adicionarAtivoFii: (dados: Omit<AtivoFii, "id" | "criadoEm" | "cotasAtuais" | "precoMedioCompra" | "ativo">) => void;
  editarAtivoFii: (id: string, dados: Partial<AtivoFii>) => void;
  excluirAtivoFii: (id: string) => void;

  // Operações FII
  adicionarOperacaoFii: (dados: Omit<OperacaoFii, "id" | "criadoEm">) => void;
  excluirOperacaoFii: (id: string) => void;

  // Dividendos FII
  adicionarDividendoFii: (dados: Omit<DividendoFii, "id" | "criadoEm" | "totalRecebido">) => void;
  editarDividendoFii: (id: string, dados: Partial<DividendoFii>) => void;
  excluirDividendoFii: (id: string) => void;

  // Seletores FII
  obterAtivosFiiAtivos: () => AtivoFii[];
  obterOperacoesFii: (ativoFiiId: string) => OperacaoFii[];
  obterDividendosFii: (ativoFiiId: string) => DividendoFii[];
  obterDividendosFiiMes: (mes: number, ano: number) => DividendoFii[];
  obterTotalDividendosAno: (ano: number) => number;
  obterIndicadoresFii: (ativoFiiId: string) => IndicadoresFii;
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

  adicionarAtivoFii: (dados) => {
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

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarAtivoFii: (id, dados) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      ativosFii: editarItemArray(state.ativosFii, id, dados),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirAtivoFii: (id) => {
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

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarOperacaoFii: (dados) => {
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

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirOperacaoFii: (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      operacoesFii: excluirItemArray(state.operacoesFii, id),
    };

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  adicionarDividendoFii: (dados) => {
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

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  editarDividendoFii: (id, dados) => {
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

    salvar(novoState);
    set({ dadosAno: novoState });
  },

  excluirDividendoFii: (id) => {
    const state = get().dadosAno;
    if (!state) return;

    const novoState: DadosAno = {
      ...state,
      dividendosFii: excluirItemArray(state.dividendosFii, id),
    };

    salvar(novoState);
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
