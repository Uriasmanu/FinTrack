export type TipoTransacao = "receita" | "despesa";

export type TipoRecorrencia = "unica" | "recorrente" | "recorrente_personalizado" | "parcelado";

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
  subtipoId: string | null;
  contaId: string;
  cartaoId: string | null;
  parcelaAtual: number;
  totalParcelas: number;
  grupoParcelaId: string | null;
  intervaloDias: number | null;
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
  dataCriacao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
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
  contaId?: string;
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
  criadoEm?: string;
}

export interface RegistroDividendoFii {
  competencia: string;
  valorPorCota: number;
}

export interface AtivoFii {
  id: string;
  ticker: string;
  nome: string;
  dataCompra: string;
  precoCota: number;
  quantidadeCotas: number;
  diaDividendo: number;
  valorDividendoMensal: number;
  historicoDividendos: RegistroDividendoFii[];
  observacoes?: string;
  ativo: boolean;
  criadoEm: string;
}

export interface DadosApp {
  transacoes: Transacao[];
  categorias: Categoria[];
  contas: Conta[];
  cartoes: Cartao[];
  metas: Meta[];
  config: Config;
  ativosFii: AtivoFii[];
}
