# FinTrack - Feature: Aba de Investimentos (Card FII)

> **Versão consolidada.** Este documento une a proposta inicial com a versão gerada pela IA com acesso ao repositório, resolvendo divergências entre as duas. Ver seção **"Notas de Consolidação"** ao final para entender o que foi ajustado e por quê.

## Visão Geral

Nova aba **Investimentos** no menu lateral do FinTrack, com foco inicial no card de **FIIs (Fundos de Investimento Imobiliário)**. A estrutura já nasce preparada para comportar futuramente CDB e outros ativos.

Segue o padrão arquitetural já usado no restante do app: Zustand + `storage.ts` (JSON por ano no localStorage), shadcn/ui + Tailwind, React Hook Form + Zod.

---

## 1. Escopo desta Feature

- Nova aba "Investimentos" no menu lateral
- Card de FII com CRUD completo do ativo
- Registro de **operações de compra e venda** de cotas, com recálculo automático de preço médio
- Registro de **dividendos** recebidos, com histórico
- Cálculos automáticos: P/VP, Preço Teto, DY mensal/anual, YoC, Cap Rate, lucro/prejuízo
- Alertas de compra/venda baseados nas faixas de P/VP e ágio excessivo
- Dashboard da aba com resumo consolidado da carteira de FIIs

---

## 2. Estrutura de Pastas

```
fintrack/
├── src/
│   ├── types/
│   │   └── index.ts                          # adicionar tipos de FII aqui (ou investimentos.ts separado)
│   ├── stores/
│   │   └── useFinanceStore.ts                 # adicionar métodos de FII (ou store dedicado)
│   ├── lib/
│   │   └── calculos-fii.ts                    # novo
│   ├── pages/
│   │   └── Investimentos.tsx                  # novo
│   └── components/
│       └── investimentos/
│           ├── fii-dashboard.tsx              # resumo consolidado da carteira
│           ├── fii-card.tsx                   # card individual do FII (lista/grid)
│           ├── fii-form.tsx                   # cadastro/edição do ativo
│           ├── fii-detalhes.tsx               # tela/dialog de detalhe do FII
│           ├── fii-operacao-form.tsx          # lançar compra/venda
│           ├── fii-historico-operacoes.tsx    # histórico de compras/vendas
│           ├── fii-dividendo-form.tsx         # lançar dividendo mensal
│           ├── fii-dividendo-item.tsx         # item de dividendo na listagem
│           ├── fii-historico-dividendos.tsx   # tabela + gráfico de dividendos
│           └── fii-preco-teto-calc.tsx        # calculadora de preço teto (simulação)
```

> **Nota:** o array `investimentos-tabs.tsx` (navegação FII | CDB) só é necessário quando o CDB começar a ser desenvolvido. Por ora, `Investimentos.tsx` renderiza diretamente o card de FII.

---

## 3. Tipos TypeScript (`src/types/index.ts`)

### 3.1 Tipos auxiliares

```typescript
export type TipoFii =
  | "tijolo"           // Imóveis físicos
  | "papel"             // Títulos de dívida (CRIs)
  | "fof"                // Fundos de Fundos
  | "misto"             // Híbrido
  | "fiagro"             // Fiagro-Imobiliário
  | "desenvolvimento";  // Fundos de Desenvolvimento

// Aplicável apenas quando tipo === "tijolo" (ou "fiagro" no caso de "agropecuario")
export type SegmentoFii =
  | "logistico"     // Galpões / Centros de distribuição
  | "lajes"           // Lajes corporativas
  | "shopping"        // Shopping centers
  | "varejo"          // Renda urbana
  | "hospitalar"      // Hospitais
  | "educacional"     // Instituições de ensino
  | "hotel"           // Hotéis
  | "agropecuario"    // Fiagros (terras, galpões rurais)
  | "outro";

export type PerfilRiscoFii = "high_grade" | "high_yield"; // apenas tipo === "papel"
export type IndexadorFii = "ipca" | "cdi" | "prefixado" | "outro"; // apenas tipo === "papel"
export type TipoOperacaoFii = "compra" | "venda";
export type StatusPrecoFii = "desconto" | "justo" | "agio_moderado" | "agio_excessivo";
```

### 3.2 Interface principal: `AtivoFii`

```typescript
export interface AtivoFii {
  id: string;
  ticker: string;                // Ex: "HGLG11", "XPML11" — deve ser único na carteira
  nome: string;
  tipo: TipoFii;
  segmento?: SegmentoFii | null;      // obrigatório se tipo = "tijolo" ou "fiagro"
  perfilRisco?: PerfilRiscoFii | null; // obrigatório se tipo = "papel"
  indexador?: IndexadorFii | null;     // obrigatório se tipo = "papel"
  taxaAdm?: number;              // Taxa de administração (% a.a.), opcional
  cotasAtuais: number;           // derivado das operações, mas mantido como campo para performance
  precoMedioCompra: number;      // recalculado automaticamente a cada compra
  precoAtualMercado: number;     // atualizado manualmente pelo usuário
  valorPatrimonialCota: number;  // VP — atualizado manualmente pelo usuário
  taxaRetornoDesejada: number;   // ex: 0.10 = 10% a.a. — usado no cálculo do Preço Teto
  observacoes?: string;
  ativo: boolean;                // false quando cotasAtuais chega a 0 (posição zerada)
  criadoEm: string;              // ISO timestamp
}
```

> **Removidos os campos `dividendosMes` e `dataUltimoDividendo`** que existiam na proposta do repositório: esses valores são **derivados** da coleção `dividendosFii` (último registro por competência), evitando duplicidade de fonte de verdade. Se a UI precisar de acesso rápido, calcular via seletor/memo, não persistir no ativo.

### 3.3 Interface: `OperacaoFii` (compra/venda)

```typescript
export interface OperacaoFii {
  id: string;
  ativoFiiId: string;
  tipo: TipoOperacaoFii;
  data: string;             // YYYY-MM-DD
  quantidade: number;
  precoUnitario: number;
  taxaB3?: number;
  corretora?: string;
  observacoes?: string;
  criadoEm: string;
}
```

### 3.4 Interface: `DividendoFii`

```typescript
export interface DividendoFii {
  id: string;
  ativoFiiId: string;
  competencia: string;       // "YYYY-MM" — mês de referência do dividendo
  dataPagamento: string;     // YYYY-MM-DD
  valorPorCota: number;
  quantidadeCotas: number;   // cotas na data do pagamento (snapshot)
  totalRecebido: number;     // valorPorCota × quantidadeCotas
  recorrente: boolean;       // false = ganho atípico (ex: venda de imóvel do portfólio)
  tipo?: string;              // "Rendimento", "Amortização", etc. (opcional, informativo)
  observacoes?: string;
  criadoEm: string;
}
```

### 3.5 Interface calculada (não persistida): `IndicadoresFii`

```typescript
export interface IndicadoresFii {
  pVp: number;
  precoTeto: number;
  dyMensal: number;               // %
  dyAnual: number;                // % (soma últimos 12 meses / preço atual)
  yieldOnCost: number;            // %
  capRate?: number;               // apenas se receita/valor de imóveis forem informados manualmente
  statusPreco: StatusPrecoFii;
  alertaVenda: boolean;
  alertaGanhoNaoRecorrente: boolean;
  lucroPrejuizoValor: number;     // (precoAtualMercado - precoMedioCompra) × cotasAtuais
  lucroPrejuizoPercentual: number;
}
```

### 3.6 Atualização do `DadosAno`

```typescript
export interface DadosAno {
  // ... campos existentes (transacoes, categorias, contas, cartoes, metas, config) ...
  ativosFii: AtivoFii[];
  operacoesFii: OperacaoFii[];
  dividendosFii: DividendoFii[];
}
```

> Em `storage.ts`, ao ler JSONs de anos anteriores à feature, tratar `ativosFii`, `operacoesFii` e `dividendosFii` ausentes como `[]` (fallback `?? []`), e incluir os três arrays na função `criarDadosAnoNovo` / migração de ano.

---

## 4. Funções de Cálculo (`src/lib/calculos-fii.ts`)

Todas puras e testáveis:

```typescript
// Preço Teto (Método Barsi Adaptado)
// Preço Teto = Dividendo Anual Esperado por Cota / Taxa de Retorno Desejada
export function calcularPrecoTeto(dividendoAnualPorCota: number, taxaRetornoDesejada: number): number {
  return dividendoAnualPorCota / taxaRetornoDesejada;
}

// P/VP = Preço de Mercado / Valor Patrimonial por Cota
export function calcularPvp(precoMercado: number, valorPatrimonial: number): number {
  return precoMercado / valorPatrimonial;
}

// DY Mensal = (Dividendo Mensal / Preço de Mercado) × 100
export function calcularDyMensal(dividendoMensal: number, precoMercado: number): number {
  return (dividendoMensal / precoMercado) * 100;
}

// DY Anual = (Σ Dividendos últimos 12 meses / Preço de Mercado) × 100
export function calcularDyAnual(dividendos12Meses: number, precoMercado: number): number {
  return (dividendos12Meses / precoMercado) * 100;
}

// Yield on Cost = (Dividendo Anual Recebido / Preço Médio de Compra) × 100
export function calcularYoc(dividendoAnualPorCota: number, precoMedioCompra: number): number {
  return (dividendoAnualPorCota / precoMedioCompra) * 100;
}

// Cap Rate = Receita Operacional Líquida Anual / Valor de Avaliação dos Imóveis
export function calcularCapRate(receitaOperacionalAnual: number, valorAvaliacaoImoveis: number): number {
  return (receitaOperacionalAnual / valorAvaliacaoImoveis) * 100;
}

// Valor total da posição
export function calcularValorTotalPosicao(cotasAtuais: number, precoAtualMercado: number): number {
  return cotasAtuais * precoAtualMercado;
}

// Lucro/prejuízo (não realizado)
export function calcularLucroPrejuizo(
  cotasAtuais: number,
  precoAtual: number,
  precoMedio: number
): { valor: number; percentual: number } {
  const valor = (precoAtual - precoMedio) * cotasAtuais;
  const percentual = ((precoAtual - precoMedio) / precoMedio) * 100;
  return { valor, percentual };
}

// Total de dividendos recebidos em um ano
export function calcularTotalDividendosAno(dividendos: DividendoFii[], ano: number): number {
  return dividendos
    .filter((d) => d.competencia.startsWith(String(ano)))
    .reduce((soma, d) => soma + d.totalRecebido, 0);
}

// Agregados da carteira
export function calcularValorCarteiraFii(ativos: AtivoFii[]): number {
  return ativos.reduce((soma, a) => soma + a.cotasAtuais * a.precoAtualMercado, 0);
}

export function calcularDyMedioCarteira(ativos: AtivoFii[], indicadoresPorAtivo: Record<string, IndicadoresFii>): number {
  const valorTotal = calcularValorCarteiraFii(ativos);
  if (valorTotal === 0) return 0;
  const somaPonderada = ativos.reduce((soma, a) => {
    const valorAtivo = a.cotasAtuais * a.precoAtualMercado;
    return soma + indicadoresPorAtivo[a.id].dyAnual * valorAtivo;
  }, 0);
  return somaPonderada / valorTotal;
}
```

### Função de agregação: `calcularIndicadoresFii(ativo, dividendos): IndicadoresFii`

Classificação de `statusPreco` — combina o tipo do fundo com a faixa de P/VP, conforme o texto de referência:

| Condição | statusPreco |
|---|---|
| Papel e P/VP ≤ 1,00 | `desconto` |
| Tijolo e P/VP entre 0,90 e 1,00 | `desconto` |
| Tijolo e P/VP entre 1,00 e 1,05 | `justo` |
| Papel e P/VP entre 1,00 e 1,15 | `justo` |
| P/VP entre 1,15 e 1,20 (qualquer tipo) | `agio_moderado` |
| P/VP > 1,20 | `agio_excessivo` → `alertaVenda: true` |

`alertaGanhoNaoRecorrente`: `true` quando o dividendo mais recente tem `recorrente: false` e seu valor está ≥ 50% acima da média dos últimos 6 meses de dividendos recorrentes do mesmo FII — heurística simples para sinalizar ganho atípico (ex.: venda de imóvel do portfólio).

---

## 5. Store — Métodos Novos

Adicionar ao `useFinanceStore.ts` (ou extrair para `useInvestimentosStore.ts` se preferir separar por domínio, seguindo o mesmo padrão de composição de stores já usado no projeto):

```typescript
interface FinanceState {
  // ... existentes ...

  // Ativos
  adicionarAtivoFii: (dados: Omit<AtivoFii, "id" | "criadoEm" | "cotasAtuais" | "precoMedioCompra" | "ativo">) => void;
  editarAtivoFii: (id: string, dados: Partial<AtivoFii>) => void;
  excluirAtivoFii: (id: string) => void; // bloqueado se houver operações ou dividendos vinculados

  // Operações (compra/venda)
  adicionarOperacaoFii: (dados: Omit<OperacaoFii, "id" | "criadoEm">) => void;
  excluirOperacaoFii: (id: string) => void; // recalcula preço médio e cotasAtuais do ativo

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
}
```

### Regra de preço médio na compra

Um FII começa sem cotas; a primeira compra define `cotasAtuais` e `precoMedioCompra`. A partir da segunda compra:

```
novoPrecoMedio = (precoMedioAtual × cotasAtuais + precoUnitario × quantidade) / (cotasAtuais + quantidade)
```

`taxaB3`, se informada, deve ser diluída no preço médio (somada ao custo total da operação antes de dividir pela quantidade), refletindo o custo real de aquisição.

### Regra na venda

- Decrementar `cotasAtuais` pela quantidade vendida.
- **Não alterar** `precoMedioCompra` (mantém o custo médio histórico para cálculo de lucro/prejuízo realizado).
- Se `cotasAtuais` chegar a 0, marcar `ativo: false` (arquivado, não excluído — preserva histórico de operações e dividendos).
- Bloquear venda de quantidade maior que `cotasAtuais`.

### Regra de exclusão do ativo

`excluirAtivoFii` só é permitido quando **não há** `operacoesFii` nem `dividendosFii` vinculados ao `ativoFiiId` — mesma política de proteção já usada em contas, cartões e categorias. Se o usuário zerar a posição (vender tudo), o caminho correto é deixar `ativo: false`, não excluir.

---

## 6. Navegação e Rotas

### Sidebar

```typescript
import { Landmark } from "lucide-react";
// Adicionar ao menuItems:
{ path: "/investimentos", label: "Investimentos", icon: Landmark },
```

### App.tsx

```tsx
<Route path="/investimentos" element={<Investimentos />} />
```

| Rota | Página | Descrição |
|---|---|---|
| `/investimentos` | Investimentos | Dashboard + carteira de FIIs (CDB entra futuramente na mesma rota, com tabs) |

---

## 7. Componentes de UI

### `Investimentos.tsx` (página)

- Header "Investimentos" + botão "Novo FII"
- `fii-dashboard.tsx` no topo
- Tabs internas: **Carteira** (grid de `fii-card.tsx`) | **Dividendos** (histórico consolidado de todos os FIIs)

### `fii-dashboard.tsx`

4 cards de resumo, no padrão visual do Dashboard principal:

- Valor total da carteira (Σ cotasAtuais × precoAtualMercado)
- DY médio ponderado da carteira
- Total de dividendos recebidos no ano corrente
- Quantidade de FIIs ativos

### `fii-card.tsx`

- Ticker + nome + badge de tipo (cores: Tijolo=verde, Papel=azul, FOF=roxo, Misto=amarelo, Fiagro=laranja, Desenvolvimento=vermelho)
- Preço médio, preço atual, P/VP
- Badge/cor de `statusPreco` (verde=desconto, amarelo=justo, laranja=ágio moderado, vermelho=ágio excessivo)
- DY mensal, DY anual (12m), Yield on Cost
- Preço Teto vs preço de mercado (indicador visual se está abaixo/acima do teto)
- Cotas atuais e valor total da posição
- Lucro/prejuízo não realizado (valor e %)
- Menu de ações: Editar, Registrar Operação, Registrar Dividendo, Ver Detalhes/Histórico, Excluir (se sem vínculos)

⚠️ Quando `alertaGanhoNaoRecorrente` for `true`, exibir aviso no card: o dividendo recente pode não ser recorrente (possível venda de imóvel do portfólio) — recomendar checar o histórico antes de usar esse valor no DY.

⚠️ Quando `alertaVenda` for `true` (P/VP > 1,20), exibir aviso de ágio excessivo no card.

### `fii-form.tsx` (cadastro/edição do ativo)

Campos: Ticker (uppercase automático, validação de unicidade), Nome, Tipo (select), Segmento (select condicional — só aparece se Tipo = Tijolo ou Fiagro), Perfil de Risco (select condicional — só se Tipo = Papel), Indexador (select condicional — só se Tipo = Papel), Taxa de Administração (opcional), Valor Patrimonial por Cota (VP), Taxa de Retorno Anual Desejada (%, usado no Preço Teto), Observações.

> Cadastro inicial **não** define cotas/preço médio diretamente — isso é feito pela primeira operação de compra (`fii-operacao-form.tsx`), mantendo uma única fonte de verdade para a posição.

### `fii-operacao-form.tsx`

Campos: Tipo (Compra/Venda), Data, Quantidade de Cotas, Preço Unitário, Taxa B3 (opcional), Corretora (opcional), Observações. Validação: venda não pode exceder `cotasAtuais`.

### `fii-historico-operacoes.tsx`

Tabela com todas as operações do FII (data, tipo, quantidade, preço unitário, taxa, corretora), ordenada da mais recente para a mais antiga.

### `fii-dividendo-form.tsx`

Campos: Competência (mês/ano), Data de Pagamento, Valor por Cota, Tipo de Provento (opcional), Checkbox "Dividendo não recorrente", Observações. `quantidadeCotas` e `totalRecebido` são calculados automaticamente a partir da posição atual do ativo no momento do lançamento.

Opcional: checkbox "Criar transação de receita vinculada" — ao marcar, gera automaticamente uma transação na categoria "Investimentos" (cat-008) com valor = `totalRecebido` e descrição `"Dividendo {ticker} - {competência}"`.

### `fii-historico-dividendos.tsx`

Tabela com todos os dividendos lançados (competência, valor por cota, total recebido, recorrente/não recorrente) + gráfico de barras (Recharts, reaproveitando o padrão de `Graficos.tsx`) mostrando a evolução mensal do dividendo por cota.

### `fii-detalhes.tsx`

Dialog/tela agregando: dados do ativo, indicadores calculados, `fii-historico-operacoes.tsx`, `fii-historico-dividendos.tsx` e `fii-preco-teto-calc.tsx`.

### `fii-preco-teto-calc.tsx`

Calculadora com pré-visualização em tempo real (mesmo padrão de `objetivos-personalizados.tsx` nas Metas): usuário ajusta dividendo anual esperado e taxa de retorno desejada, vê o Preço Teto resultante instantaneamente, comparado ao preço de mercado atual.

---

## 8. Validações e Regras de Negócio

| Regra | Comportamento |
|---|---|
| Ticker único | Não pode haver dois `AtivoFii` com o mesmo ticker |
| Quantidade ≥ 1 na operação | Mínimo ao registrar compra/venda |
| Preço unitário > 0 | Deve ser positivo em toda operação |
| Venda ≤ cotasAtuais | Quantidade vendida não pode exceder a posição atual |
| Taxa de retorno desejada > 0 | Necessária para calcular Preço Teto |
| P/VP > 1,20 | Badge de ágio excessivo + alerta visual de possível ponto de venda |
| Papel com P/VP > 1,00 | Sinalizar que a compra está fora da faixa prioritária recomendada |
| Tijolo fora da faixa 0,90–1,05 | Sinalizar necessidade de analisar Cap Rate e qualidade do ativo |
| Dividendo marcado como não recorrente | ⚠️ Aviso de que o valor pode distorcer o DY se usado isoladamente no cálculo anual |
| Cap Rate informado abaixo da taxa livre de risco (ex.: Tesouro IPCA+) | ⚠️ Alerta de que o investimento pode estar perdendo sentido em risco/retorno |
| Exclusão de `AtivoFii` com operações ou dividendos vinculados | Bloqueada — usar `ativo: false` (arquivar) em vez de excluir |

---

## 9. Persistência e Migração entre Anos

- `ativosFii`, `operacoesFii` e `dividendosFii` fazem parte do mesmo JSON `fintrack_{ano}`, seguindo o padrão de `storage.ts`.
- Ao criar o JSON de um novo ano, **copiar os `AtivoFii` com `ativo: true`** para o novo ano (mesma lógica já usada para contas/cartões), preservando `cotasAtuais` e `precoMedioCompra` acumulados.
- `operacoesFii` e `dividendosFii` são **específicos de cada ano/competência** e não são copiados — permanecem no ano em que ocorreram, para fins de histórico.

---

## 10. Checklist de Implementação

1. [ ] Adicionar tipos (`TipoFii`, `SegmentoFii`, `PerfilRiscoFii`, `IndexadorFii`, `AtivoFii`, `OperacaoFii`, `DividendoFii`, `IndicadoresFii`) em `types/index.ts`
2. [ ] Atualizar `DadosAno` com `ativosFii`, `operacoesFii`, `dividendosFii`
3. [ ] Atualizar `storage.ts`: fallback `?? []` para JSONs antigos + inclusão nos três arrays em `criarDadosAnoNovo`/migração de ano
4. [ ] Criar `lib/calculos-fii.ts` com todas as funções de cálculo e `calcularIndicadoresFii`
5. [ ] Adicionar métodos de FII ao store (CRUD de ativo, operações com recálculo de preço médio, dividendos, seletores)
6. [ ] Implementar regra de bloqueio de venda > cotasAtuais e de exclusão com vínculos
7. [ ] Criar rota `/investimentos` e página `Investimentos.tsx`
8. [ ] Adicionar item "Investimentos" no `sidebar.tsx` (ícone `Landmark`)
9. [ ] Implementar `fii-dashboard.tsx`
10. [ ] Implementar `fii-card.tsx` com badges de tipo e status de preço
11. [ ] Implementar `fii-form.tsx` com Zod schema (validação de ticker único, taxaRetornoDesejada > 0)
12. [ ] Implementar `fii-operacao-form.tsx` + `fii-historico-operacoes.tsx`
13. [ ] Implementar `fii-dividendo-form.tsx` (+ integração opcional com transações) + `fii-historico-dividendos.tsx`
14. [ ] Implementar `fii-detalhes.tsx` agregando os componentes acima
15. [ ] Implementar `fii-preco-teto-calc.tsx`
16. [ ] Testes manuais dos cálculos com os exemplos do requisito (ex.: dividendo R$ 12,00/ano, taxa 10% → Preço Teto R$ 120,00)

---

## 11. Próximos Passos (fora do escopo desta etapa)

- **Card CDB**: reutilizar estrutura da aba, padrão de card/form, store e funções de cálculo. Campos específicos: indexador (CDI, IPCA+, Prefixado), taxa contratada, data de vencimento, instituição emissora, valor investido, rendimento projetado. Ao chegar essa etapa, transformar `Investimentos.tsx` em um shell com tabs "FII | CDB".
- Indicador de patrimônio em investimentos no Dashboard principal.
- Exportação da posição consolidada de FIIs junto com a exportação geral (JSON/CSV/PDF).

---

## Notas de Consolidação

Comparando as duas versões da spec, os principais ajustes feitos aqui foram:

- **Adotado o modelo de `OperacaoFii`** (compra/venda com preço médio ponderado) da versão do repositório — era a peça mais importante que faltava na proposta inicial, pois sem isso o preço médio teria que ser editado manualmente, o que não reflete a realidade de uma carteira.
- **Removidos os campos `dividendosMes`/`dataUltimoDividendo`** de `AtivoFii` (presentes na versão do repositório): eles duplicavam informação que já vem de `dividendosFii` e criavam risco de dessincronia. Ficaram como valores derivados/calculados.
- **Mantidas as faixas de P/VP por tipo de fundo** (Tijolo vs Papel) e o alerta de ganho não recorrente da proposta inicial — não estavam na versão do repositório, mas vêm diretamente do texto de referência sobre avaliação de compra/venda.
- **Mantida a calculadora de Preço Teto (`fii-preco-teto-calc.tsx`)** e a integração opcional de dividendo → transação da proposta inicial, por serem funcionalidades de valor prático que a versão do repositório não cobria.
- **Adotado `segmento` como campo único** (em vez de `segmentoTijolo` separado), aplicável tanto a Tijolo quanto a Fiagro, seguindo a modelagem mais enxuta da versão do repositório.
- **Padronizado nome do tipo "misto"** (em vez de "hibrido") por já ser o termo usado na versão com acesso ao código real.