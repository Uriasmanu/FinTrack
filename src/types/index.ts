export type TipoTransacao = "receita" | "despesa";

export type TipoRecorrencia = "unica" | "recorrente" | "parcelado";

export type TipoConta = "corrente" | "poupanca" | "investimento" | "ticket";

export type StatusMeta = "em_andamento" | "concluida" | "cancelada";

export type TipoMeta = "padrao" | "personalizado";

export type Tema = "claro" | "escuro";

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  tipoRecorrencia: TipoRecorrencia;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  contaId: string;
  cartaoId: string | null;
  parcelaAtual: number;
  totalParcelas: number;
  grupoParcelaId: string | null;
  criadoEm: string;
  confirmada: boolean;
}

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  tipo: TipoTransacao | "ambos";
}

export interface Conta {
  id: string;
  banco: string;
  saldoInicial: number;
  tipo: TipoConta;
}

export interface Cartao {
  id: string;
  nome: string;
  bandeira: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
}

export interface Meta {
  id: string;
  nome: string;
  tipo: TipoMeta;
  ativo: boolean;
  valorAlvo: number;
  valorAtual: number;
  meses: number;
  parcelaMensal: number;
  dataInicio: string;
  dataFim: string;
  status: StatusMeta;
  receitasBase: string[];
}

export interface Multiplicadores {
  viverDeRenda: number;
  reservaEmergencia: number;
  guardarPorMes: number;
  contaFixa: number;
  lazer: number;
}

export interface Config {
  salario: number;
  tema: Tema;
  moeda: string;
  multiplicadores: Multiplicadores;
}

export interface DadosAno {
  ano: number;
  transacoes: Transacao[];
  categorias: Categoria[];
  contas: Conta[];
  cartoes: Cartao[];
  metas: Meta[];
  config: Config;
}
