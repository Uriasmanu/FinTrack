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
  criadoEm?: string;
}

export type TipoFii =
  | "tijolo"
  | "papel"
  | "fof"
  | "misto"
  | "fiagro"
  | "desenvolvimento";

export type SegmentoFii =
  | "logistico"
  | "lajes"
  | "shopping"
  | "varejo"
  | "hospitalar"
  | "educacional"
  | "hotel"
  | "agropecuario"
  | "outro";

export type PerfilRiscoFii = "high_grade" | "high_yield";
export type IndexadorFii = "ipca" | "cdi" | "prefixado" | "outro";
export type TipoOperacaoFii = "compra" | "venda";
export type StatusPrecoFii = "desconto" | "justo" | "agio_moderado" | "agio_excessivo";

export interface AtivoFii {
  id: string;
  ticker: string;
  nome: string;
  tipo: TipoFii;
  segmento?: SegmentoFii | null;
  perfilRisco?: PerfilRiscoFii | null;
  indexador?: IndexadorFii | null;
  taxaAdm?: number;
  cotasAtuais: number;
  precoMedioCompra: number;
  precoAtualMercado: number;
  valorPatrimonialCota: number;
  taxaRetornoDesejada: number;
  observacoes?: string;
  ativo: boolean;
  criadoEm: string;
}

export interface OperacaoFii {
  id: string;
  ativoFiiId: string;
  tipo: TipoOperacaoFii;
  data: string;
  quantidade: number;
  precoUnitario: number;
  taxaB3?: number;
  corretora?: string;
  observacoes?: string;
  criadoEm: string;
}

export interface DividendoFii {
  id: string;
  ativoFiiId: string;
  competencia: string;
  dataPagamento: string;
  valorPorCota: number;
  quantidadeCotas: number;
  totalRecebido: number;
  recorrente: boolean;
  tipo?: string;
  observacoes?: string;
  criadoEm: string;
}

export interface IndicadoresFii {
  pVp: number;
  precoTeto: number;
  dyMensal: number;
  dyAnual: number;
  yieldOnCost: number;
  capRate?: number;
  statusPreco: StatusPrecoFii;
  alertaVenda: boolean;
  alertaGanhoNaoRecorrente: boolean;
  lucroPrejuizoValor: number;
  lucroPrejuizoPercentual: number;
}

export interface DadosAno {
  ano: number;
  transacoes: Transacao[];
  categorias: Categoria[];
  contas: Conta[];
  cartoes: Cartao[];
  metas: Meta[];
  config: Config;
  ativosFii: AtivoFii[];
  operacoesFii: OperacaoFii[];
  dividendosFii: DividendoFii[];
}
