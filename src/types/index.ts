export type TipoTransacao = "receita" | "despesa";

export type TipoConta = "corrente" | "poupanca" | "investimento";

export type StatusMeta = "em_andamento" | "concluida" | "cancelada";

export type Tema = "claro" | "escuro";

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  contaId: string;
  cartaoId: string | null;
  recorrente: boolean;
  criadoEm: string;
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
  nome: string;
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
  valorAlvo: number;
  valorAtual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusMeta;
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
