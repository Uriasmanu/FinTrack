# FASE 01 — Tipos, Store e Persistência

> **Entrega 1:** Fundação da feature — definição de tipos TypeScript, extension da interface `DadosAno`, persistência em `storage.ts` e methods do Zustand store.

## Objetivo

Estabelecer toda a base de dados e lógica de estado necessária para que as próximas entregas possam ser construídas sem retrabalho. Esta fase não entrega valor visual ao usuário, mas é prerequisite obrigatória para todas as outras.

---

## Funcionalidades

- Tipos `TipoFii`, `SegmentoFii`, `PerfilRiscoFii`, `IndexadorFii`, `TipoOperacaoFii`, `StatusPrecoFii` definidos
- Interface `AtivoFii` com todos os campos do modelo de dados
- Interface `OperacaoFii` para compras e vendas
- Interface `DividendoFii` para dividendos recebidos
- Interface `IndicadoresFii` (calculada, não persistida)
- Array `ativosFii` adicionado a `DadosAno`
- Array `operacoesFii` adicionado a `DadosAno`
- Array `dividendosFii` adicionado a `DadosAno`
- Fallback `?? []` em `storage.ts` para JSONs antigos
- Inclusão dos três arrays em `criarDadosAnoNovo`
- Métodos CRUD de ativos no store
- Métodos de operações com recálculo de preço médio
- Métodos CRUD de dividendos
- Seletores e funções de agregação

---

## Alterações no Backend (Store + Persistência)

### Tipos (`src/types/index.ts`)

Adicionar os seguintes tipos e interfaces:

```typescript
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
```

### Interface `DadosAno` (`src/types/index.ts`)

Adicionar três novos campos:

```typescript
export interface DadosAno {
  // ... campos existentes ...
  ativosFii: AtivoFii[];
  operacoesFii: OperacaoFii[];
  dividendosFii: DividendoFii[];
}
```

### Persistência (`src/lib/storage.ts`)

- Ao carregar JSON de anos anteriores à feature: tratar campos ausentes como `[]`
- Na função `criarDadosAnoNovo`: incluir `ativosFii: []`, `operacoesFii: []`, `dividendosFii: []`
- Na migração de ano: copiar apenas `ativosFii` com `ativo: true`, não copiar operações/dividendos

### Store (`src/stores/useFinanceStore.ts`)

Adicionar à interface `FinanceState`:

```typescript
// Ativos
ativosFii: AtivoFii[];
operacoesFii: OperacaoFii[];
dividendosFii: DividendoFii[];

adicionarAtivoFii: (dados: Omit<AtivoFii, "id" | "criadoEm" | "cotasAtuais" | "precoMedioCompra" | "ativo">) => void;
editarAtivoFii: (id: string, dados: Partial<AtivoFii>) => void;
excluirAtivoFii: (id: string) => void;

// Operações
adicionarOperacaoFii: (dados: Omit<OperacaoFii, "id" | "criadoEm">) => void;
excluirOperacaoFii: (id: string) => void;

// Dividendos
adicionarDividendoFii: (dados: Omit<DividendoFii, "id" | "criadoEm" | "totalRecebido">) => void;
editarDividendoFii: (id: string, dados: Partial<DividendoFii>) => void;
excluirDividendoFii: (id: string) => void;

// Seletores
obterAtivosFiiAtivos: () => AtivoFii[];
obterOperacoesFii: (ativoFiiId: string) => OperacaoFii[];
obterDividendosFii: (ativoFiiId: string) => DividendoFii[];
obterDividendosFiiMes: (mes: number, ano: number) => DividendoFii[];
obterTotalDividendosAno: (ano: number) => number;
obterIndicadoresFii: (ativoFiiId: string) => IndicadoresFii;
```

### Regras de Negócio no Store

**Preço médio na compra:**
```
novoPrecoMedio = (precoMedioAtual × cotasAtuais + precoUnitario × quantidade) / (cotasAtuais + quantidade)
```
`taxaB3` deve ser diluída no preço médio (soma ao custo total antes de dividir).

**Na venda:**
- Decrementar `cotasAtuais` pela quantidade vendida
- NÃO alterar `precoMedioCompra`
- Se `cotasAtuais` chegar a 0: marcar `ativo: false`
- Bloquear venda de quantidade > `cotasAtuais`

**Exclusão do ativo:**
- Só permitido quando NÃO há `operacoesFii` nem `dividendosFii` vinculados

---

## Alterações no Frontend

Nenhuma nesta fase. A UI será implementada nas fases seguintes.

---

## Critérios de Aceite

- [ ] CA-01: todos os tipos TypeScript são exportados e compilam sem erros
- [ ] CA-02: `DadosAno` inclui os três novos arrays e o TypeScript reconhece os campos
- [ ] CA-03: ao carregar um JSON antigo sem campos FII, `storage.ts` retorna `[]` para os três arrays
- [ ] CA-04: ao criar dados de novo ano, os três arrays são inicializados como `[]`
- [ ] CA-05: `adicionarAtivoFii` cria um ativo com `cotasAtuais: 0`, `precoMedioCompra: 0` e `ativo: true`
- [ ] CA-06: `excluirAtivoFii` lança erro/bloqueio quando há operações ou dividendos vinculados
- [ ] CA-07: `adicionarOperacaoFii` tipo "compra" na primeira vez define `cotasAtuais` e `precoMedioCompra`
- [ ] CA-08: `adicionarOperacaoFii` tipo "compra" em ativo com cotas recalcula preço médio ponderado
- [ ] CA-09: `adicionarOperacaoFii` tipo "venda" decrementa `cotasAtuais` sem alterar `precoMedioCompra`
- [ ] CA-10: `adicionarOperacaoFii` tipo "venda" com quantidade > `cotasAtuais` é bloqueada
- [ ] CA-11: quando `cotasAtuais` chega a 0 após venda, `ativo` fica `false`
- [ ] CA-12: `adicionarDividendoFii` calcula `totalRecebido` = `valorPorCota × quantidadeCotas`
- [ ] CA-13: seletores retornam dados corretos para queries por ID, mês e ano

---

## Dependências

Nenhuma. Esta é a primeira entrega.

---

## Valor Entregue

Esta fase não gera valor visual para o usuário, mas é a fundação técnica para todas as próximas entregas. Sem ela, nenhuma funcionalidade de investimentos pode ser construída.

---

## Pode ir para produção?

```
Não
```

Sem interface visual, esta entrega não tem uso direto pelo usuário. Porém, todos os dados e lógica de estado estarão prontos e testáveis.

---

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/types/index.ts` | Modificar | Adicionar tipos e interfaces de FII |
| `src/lib/storage.ts` | Modificar | Fallback para JSONs antigos + migração |
| `src/stores/useFinanceStore.ts` | Modificar | Adicionar métodos e seletores de FII |
