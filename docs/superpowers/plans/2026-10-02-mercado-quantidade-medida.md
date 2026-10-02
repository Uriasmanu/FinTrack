# Mercado: Quantidade, Peso/Volume e Preço por Medida Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o painel do Mercado (mês calculado com fuso errado), fazer `kg/g/L/ml` registrarem só o valor pago com peso/volume anotado, comparar preços por kg/L/un, mover "Adicionar Item" para baixo da lista e permitir mesclar itens do catálogo propagando o novo nome às compras.

**Architecture:** Toda regra nova entra como funções puras em `src/lib/calculos-mercado.ts` (subtotal por unidade, preço por unidade base, comparativo por nome+dimensão, renomeação nas compras). Os componentes só consomem essas funções. Nenhum campo novo em `ItemMercado`; o campo `unidade` passa a mandar no cálculo.

**Tech Stack:** React 19 + TypeScript, Zustand, React Hook Form + Zod, Radix Select, Express + JSON file (`data/fintrack.json`, inalterado em formato).

**Spec:** `docs/superpowers/specs/2026-10-02-mercado-quantidade-medida-design.md`

## Global Constraints

- Regra do subtotal: `unidade === "un"` → `precoUnitario × quantidade`; `kg`, `g`, `L`, `ml` → `precoUnitario` (valor pago), a quantidade é só anotação.
- `UnidadeMedida` continua `"un" | "kg" | "g" | "L" | "ml"`; dimensões: `un` contagem, `g`/`kg` massa, `ml`/`L` volume; unidade base `un`, `kg`, `L`; fatores `g`→0,001, `kg`→1, `ml`→0,001, `L`→1.
- Preço por unidade base = `subtotal ÷ (quantidade × fator)`; comparativo agrupa por **nome normalizado + dimensão**, nunca por marca, sem converter entre dimensões.
- Dados antigos: itens existentes continuam com os mesmos totais; não há migração automática de nomes nem de unidades.
- O catálogo continua só crescendo por compras; excluir compra nunca apaga entrada do catálogo.
- Todo layout alterado deve funcionar em 375, 768, 1024 e 1440 px, sem scroll horizontal.
- Sem framework de testes no projeto (convenção do módulo Mercado). Cada task usa: (1) script de verificação em arquivo temporário **fora do repo** (`$SCRATCH`, o diretório scratchpad da sessão), (2) `npm run build`, (3) conferência manual na UI quando houver tela.
- Verificação de funções puras roda com `TZ=America/Sao_Paulo npx --yes tsx <script>` (Node 20, sem runner instalado; `tsx` é baixado pelo npx e não entra no `package.json`).
- `npm run build` tem uma baseline de erros de TypeScript não relacionados (~24-27); o critério é **nenhum erro novo** mencionando os símbolos tocados na task.
- **Git:** o usuário não autoriza comandos git automáticos. Ao fim de cada task, apenas sugerir a mensagem de commit e aguardar o usuário rodar/autorizar.
- Comentários de código: no máximo 2 linhas, só para armadilhas não óbvias.

## Review Focus

- Compra lançada no **dia 1º** (ou 31) deve contar no mês certo, no fuso de Brasília — Task 1 pinna com o caso `2026-10-01`.
- Data padrão do formulário depois das **21h** em Brasília não pode virar o dia seguinte — Task 1.
- Item de peso/volume com **quantidade 0 ou vazia** não pode gerar `Infinity`/`NaN` no preço por kg nem no total — Task 2 (função devolve `null`) e Task 3 (formulário usa `|| 0`).
- Mesmo nome em **dimensões diferentes** (kg e un) deve virar duas linhas no comparativo, sem misturar — Task 2.
- Entradas de catálogo **legadas** com unidade não-`un` têm `ultimoPreco` no significado antigo até a próxima compra do item; a dica "último" pode estar errada nesses casos — Task 3 documenta, editar/recriar a compra corrige.
- **Mesclar** item do catálogo para um nome que já existe: compras antigas passam ao nome novo, `marcas` unidas, sem perder item — Task 4.

---

### Task 1: Corrigir mês e data local (bug do painel)

**Files:**
- Modify: `src/lib/calculos-mercado.ts:15-18`
- Modify: `src/components/mercado/compra-form.tsx:58`

**Interfaces:**
- Produces: `dataLocalISO(data?: Date): string` exportada de `@/lib/calculos-mercado` (formato `YYYY-MM-DD` no fuso local). `estaNoMes(data: string, mes: number, ano: number): boolean` mantém assinatura e continua privada.

- [ ] **Step 1: Escrever o script de verificação (deve falhar)**

Criar `$SCRATCH/verificar-mercado-t1.ts`:

```ts
import {
  calcularTotalMes,
  calcularQuantidadeComprasMes,
  dataLocalISO,
} from "C:/git/FinTrack/src/lib/calculos-mercado.ts";

let falhas = 0;
function conferir(nome: string, atual: unknown, esperado: unknown) {
  const ok = Object.is(atual, esperado);
  if (!ok) falhas++;
  console.log(ok ? "OK  " : "FAIL", nome, "→", atual, ok ? "" : `(esperado ${esperado})`);
}

const item = { id: "i", nome: "x", unidade: "un" as const, precoUnitario: 10, quantidade: 1 };
const compras = [
  { id: "a", data: "2026-09-07", itens: [item], criadoEm: "" },
  { id: "b", data: "2026-10-01", itens: [item], criadoEm: "" },
  { id: "c", data: "2026-09-30", itens: [item], criadoEm: "" },
];

conferir("compras em out/2026", calcularQuantidadeComprasMes(compras, 9, 2026), 1);
conferir("compras em set/2026", calcularQuantidadeComprasMes(compras, 8, 2026), 2);
conferir("total out/2026", calcularTotalMes(compras, 9, 2026), 10);
conferir("dataLocalISO 22h BRT", dataLocalISO(new Date(2026, 9, 2, 22, 30)), "2026-10-02");
conferir("dataLocalISO 00h BRT", dataLocalISO(new Date(2026, 9, 1, 0, 5)), "2026-10-01");

process.exit(falhas ? 1 : 0);
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `TZ=America/Sao_Paulo npx --yes tsx "$SCRATCH/verificar-mercado-t1.ts"`
Expected: erro de import (`dataLocalISO` não existe) ou FAIL nas contagens de outubro.

- [ ] **Step 3: Corrigir `estaNoMes` e adicionar `dataLocalISO`**

Em `src/lib/calculos-mercado.ts`, substituir:

```ts
function estaNoMes(data: string, mes: number, ano: number): boolean {
  const d = new Date(data);
  return d.getMonth() === mes && d.getFullYear() === ano;
}
```

por:

```ts
// Não usar new Date(data): "YYYY-MM-DD" é lido como UTC e recua um dia no fuso do Brasil.
function estaNoMes(data: string, mes: number, ano: number): boolean {
  const [anoData, mesData] = data.split("-").map(Number);
  return anoData === ano && mesData - 1 === mes;
}

export function dataLocalISO(data: Date = new Date()): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}
```

- [ ] **Step 4: Usar `dataLocalISO` como data padrão do formulário**

Em `src/components/mercado/compra-form.tsx`, trocar o import:

```ts
import { normalizarNomeItem } from "@/lib/calculos-mercado";
```

por:

```ts
import { normalizarNomeItem, dataLocalISO } from "@/lib/calculos-mercado";
```

e em `valoresIniciais` trocar:

```ts
    data: initialData?.data ?? new Date().toISOString().split("T")[0],
```

por:

```ts
    data: initialData?.data ?? dataLocalISO(),
```

- [ ] **Step 5: Rodar a verificação e o build**

Run: `TZ=America/Sao_Paulo npx --yes tsx "$SCRATCH/verificar-mercado-t1.ts"`
Expected: 5 linhas `OK`, exit 0.

Run: `npm run build`
Expected: nenhum erro novo mencionando `calculos-mercado` ou `compra-form`.

- [ ] **Step 6: Conferir o painel com os dados reais**

Run: `npm run dev`, abrir `/mercado` (hoje em outubro/2026): Total Mês Atual R$ 343,61, Total Mês Anterior R$ 443,16, Variação −22,5%, Compras no Mês 1.

- [ ] **Step 7: Checkpoint**

Sugerir commit: `fix(mercado): calcular mês e data padrão no fuso local`

---

### Task 2: Cálculos por unidade, preço por unidade base e comparativo por dimensão

**Files:**
- Modify: `src/lib/calculos-mercado.ts`

**Interfaces:**
- Consumes: `UnidadeMedida`, `ItemMercado`, `CompraMercado`, `CatalogoItemMercado` de `@/types` (já existem, não mudam).
- Produces (exportados de `@/lib/calculos-mercado`, usados nas Tasks 3 e 4):
  - `type Dimensao = "contagem" | "massa" | "volume"`
  - `dimensaoDaUnidade(unidade: UnidadeMedida): Dimensao`
  - `unidadeBaseDaDimensao(dimensao: Dimensao): UnidadeMedida`
  - `calcularSubtotalItem(item: ItemCalculavel): number`, onde `type ItemCalculavel = Pick<ItemMercado, "unidade" | "precoUnitario" | "quantidade">`
  - `calcularPrecoPorUnidadeBase(item: ItemCalculavel): number | null` (`null` se a quantidade na base for ≤ 0)
  - `ComparacaoItem` com os campos novos `chave: string`, `dimensao: Dimensao`, `unidadeBase: UnidadeMedida`
  - `calcularComparacaoItens(compras, mes, ano): ComparacaoItem[]` (mesma assinatura)
  - `atualizarCatalogoMercado` passa a gravar `ultimoPreco` = preço por unidade base (para `un`, o preço unitário)

- [ ] **Step 1: Escrever o script de verificação (deve falhar)**

Criar `$SCRATCH/verificar-mercado-t2.ts`:

```ts
import {
  calcularSubtotalItem,
  calcularTotalCompra,
  calcularPrecoPorUnidadeBase,
  calcularComparacaoItens,
  atualizarCatalogoMercado,
  dimensaoDaUnidade,
  unidadeBaseDaDimensao,
} from "C:/git/FinTrack/src/lib/calculos-mercado.ts";

let falhas = 0;
function perto(nome: string, atual: number | null, esperado: number | null, tol = 0.005) {
  const ok =
    atual === esperado ||
    (atual !== null && esperado !== null && Math.abs(atual - esperado) <= tol);
  if (!ok) falhas++;
  console.log(ok ? "OK  " : "FAIL", nome, "→", atual, ok ? "" : `(esperado ${esperado})`);
}

type U = "un" | "g" | "kg" | "ml" | "L";
const item = (o: { nome?: string; unidade?: U; precoUnitario: number; quantidade: number; marca?: string }) => ({
  id: "i", nome: "x", unidade: "un" as U, ...o,
});
const compra = (data: string, itens: ReturnType<typeof item>[]) => ({
  id: data, data, itens, criadoEm: data,
});

perto("subtotal un 4×1,79", calcularSubtotalItem(item({ precoUnitario: 1.79, quantidade: 4 })), 7.16);
perto("subtotal kg 1,6 kg por 17,49", calcularSubtotalItem(item({ unidade: "kg", precoUnitario: 17.49, quantidade: 1.6 })), 17.49);
perto("total compra mistura", calcularTotalCompra(compra("2026-10-01", [
  item({ precoUnitario: 1.79, quantidade: 4 }),
  item({ unidade: "kg", precoUnitario: 17.49, quantidade: 1.6 }),
])), 7.16 + 17.49);
perto("preço/kg 17,49 por 1,6 kg", calcularPrecoPorUnidadeBase(item({ unidade: "kg", precoUnitario: 17.49, quantidade: 1.6 })), 10.93125, 0.0001);
perto("preço/kg 500 g por 4,00", calcularPrecoPorUnidadeBase(item({ unidade: "g", precoUnitario: 4, quantidade: 500 })), 8);
perto("preço/un 4×1,79", calcularPrecoPorUnidadeBase(item({ precoUnitario: 1.79, quantidade: 4 })), 1.79);
perto("quantidade 0 → null", calcularPrecoPorUnidadeBase(item({ unidade: "kg", precoUnitario: 5, quantidade: 0 })), null);
perto("dimensão g = massa", dimensaoDaUnidade("g") === "massa" ? 1 : 0, 1);
perto("base de volume = L", unidadeBaseDaDimensao("volume") === "L" ? 1 : 0, 1);

const setembro = [compra("2026-09-07", [item({ nome: "Tomate", unidade: "kg", precoUnitario: 7, quantidade: 1 })])];
const outubro = [
  compra("2026-10-01", [
    item({ nome: "tomate", unidade: "kg", precoUnitario: 8, quantidade: 1 }),
    item({ nome: "Tomate", unidade: "g", precoUnitario: 5, quantidade: 500 }),
    item({ nome: "tomate", precoUnitario: 2, quantidade: 3 }),
  ]),
];
const comparacao = calcularComparacaoItens([...setembro, ...outubro], 9, 2026);
const tomatesKg = comparacao.find((c) => c.dimensao === "massa");
const tomatesUn = comparacao.find((c) => c.dimensao === "contagem");
perto("linhas no comparativo (kg + un)", comparacao.length, 2);
perto("média kg out = (8+5)/1,5", tomatesKg?.precoMedioAtual ?? null, 8.6667, 0.001);
perto("antes kg set", tomatesKg?.precoMedioAnterior ?? null, 7);
perto("variação kg", tomatesKg?.variacaoPercentual ?? null, ((13 / 1.5 - 7) / 7) * 100, 0.01);
perto("un sem mês anterior", tomatesUn?.precoMedioAnterior ?? null, null);
console.log("unidadeBase kg/un:", tomatesKg?.unidadeBase, tomatesUn?.unidadeBase);
if (tomatesKg?.unidadeBase !== "kg" || tomatesUn?.unidadeBase !== "un") falhas++;

const catalogo = atualizarCatalogoMercado([], compra("2026-10-01", [
  item({ nome: "Tomate", unidade: "kg", precoUnitario: 17.49, quantidade: 1.6 }),
  item({ nome: "Leite", precoUnitario: 4.5, quantidade: 2 }),
]));
perto("catálogo kg → R$/kg", catalogo.find((c) => c.nomeNormalizado === "tomate")?.ultimoPreco ?? null, 10.93125, 0.0001);
perto("catálogo un → preço unitário", catalogo.find((c) => c.nomeNormalizado === "leite")?.ultimoPreco ?? null, 4.5);

process.exit(falhas ? 1 : 0);
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `TZ=America/Sao_Paulo npx --yes tsx "$SCRATCH/verificar-mercado-t2.ts"`
Expected: falha de import (`calcularPrecoPorUnidadeBase` etc. não existem).

- [ ] **Step 3: Atualizar imports e adicionar o bloco de unidades no topo de `calculos-mercado.ts`**

Trocar a primeira linha:

```ts
import type { CompraMercado, ItemMercado, CatalogoItemMercado } from "@/types";
```

por:

```ts
import type { CompraMercado, ItemMercado, CatalogoItemMercado, UnidadeMedida } from "@/types";

export type Dimensao = "contagem" | "massa" | "volume";
export type ItemCalculavel = Pick<ItemMercado, "unidade" | "precoUnitario" | "quantidade">;

const DIMENSAO_POR_UNIDADE: Record<UnidadeMedida, Dimensao> = {
  un: "contagem",
  g: "massa",
  kg: "massa",
  ml: "volume",
  L: "volume",
};

const FATOR_PARA_BASE: Record<UnidadeMedida, number> = {
  un: 1,
  g: 0.001,
  kg: 1,
  ml: 0.001,
  L: 1,
};

const UNIDADE_BASE: Record<Dimensao, UnidadeMedida> = {
  contagem: "un",
  massa: "kg",
  volume: "L",
};

export function dimensaoDaUnidade(unidade: UnidadeMedida): Dimensao {
  return DIMENSAO_POR_UNIDADE[unidade];
}

export function unidadeBaseDaDimensao(dimensao: Dimensao): UnidadeMedida {
  return UNIDADE_BASE[dimensao];
}

function quantidadeNaBase(item: ItemCalculavel): number {
  return item.quantidade * FATOR_PARA_BASE[item.unidade];
}
```

- [ ] **Step 4: Trocar `calcularSubtotalItem` e adicionar `calcularPrecoPorUnidadeBase`**

Substituir:

```ts
export function calcularSubtotalItem(item: ItemMercado): number {
  return item.precoUnitario * item.quantidade;
}
```

por:

```ts
export function calcularSubtotalItem(item: ItemCalculavel): number {
  return item.unidade === "un" ? item.precoUnitario * item.quantidade : item.precoUnitario;
}

export function calcularPrecoPorUnidadeBase(item: ItemCalculavel): number | null {
  const base = quantidadeNaBase(item);
  if (!(base > 0)) return null;
  return calcularSubtotalItem(item) / base;
}
```

- [ ] **Step 5: Reescrever o comparativo por nome + dimensão**

Substituir da linha `export interface ComparacaoItem {` até o final de `calcularComparacaoItens` (inclusive) por:

```ts
export interface ComparacaoItem {
  chave: string;
  nome: string;
  dimensao: Dimensao;
  unidadeBase: UnidadeMedida;
  precoMedioAtual: number;
  precoMedioAnterior: number | null;
  variacaoPercentual: number | null;
}

function chaveComparacao(item: ItemMercado): string {
  return `${normalizarNomeItem(item.nome)}|${dimensaoDaUnidade(item.unidade)}`;
}

function calcularPrecoMedioPonderado(
  compras: CompraMercado[],
  chave: string,
  mes: number,
  ano: number
): number | null {
  let valorTotal = 0;
  let baseTotal = 0;

  for (const compra of compras) {
    if (!estaNoMes(compra.data, mes, ano)) continue;
    for (const item of compra.itens) {
      if (chaveComparacao(item) !== chave) continue;
      valorTotal += calcularSubtotalItem(item);
      baseTotal += quantidadeNaBase(item);
    }
  }

  if (baseTotal <= 0) return null;
  return valorTotal / baseTotal;
}

export function calcularComparacaoItens(
  compras: CompraMercado[],
  mes: number,
  ano: number
): ComparacaoItem[] {
  const { mes: mesAnt, ano: anoAnt } = obterMesAnterior(mes, ano);

  const exibicao = new Map<string, { nome: string; data: string; dimensao: Dimensao }>();
  for (const compra of compras) {
    if (!estaNoMes(compra.data, mes, ano)) continue;
    for (const item of compra.itens) {
      const chave = chaveComparacao(item);
      const atual = exibicao.get(chave);
      if (!atual || compra.data >= atual.data) {
        exibicao.set(chave, {
          nome: item.nome,
          data: compra.data,
          dimensao: dimensaoDaUnidade(item.unidade),
        });
      }
    }
  }

  const resultado: ComparacaoItem[] = [];
  for (const [chave, { nome, dimensao }] of exibicao) {
    const precoMedioAtual = calcularPrecoMedioPonderado(compras, chave, mes, ano);
    if (precoMedioAtual === null) continue;

    const precoMedioAnterior = calcularPrecoMedioPonderado(compras, chave, mesAnt, anoAnt);

    resultado.push({
      chave,
      nome,
      dimensao,
      unidadeBase: unidadeBaseDaDimensao(dimensao),
      precoMedioAtual,
      precoMedioAnterior,
      variacaoPercentual:
        precoMedioAnterior !== null
          ? calcularVariacaoPercentual(precoMedioAtual, precoMedioAnterior)
          : null,
    });
  }

  return resultado.sort(
    (a, b) => a.nome.localeCompare(b.nome, "pt-BR") || a.dimensao.localeCompare(b.dimensao)
  );
}
```

- [ ] **Step 6: `atualizarCatalogoMercado` grava preço por unidade base**

Em `atualizarCatalogoMercado`, trocar a linha:

```ts
      ultimoPreco: item.precoUnitario,
```

por:

```ts
      ultimoPreco: calcularPrecoPorUnidadeBase(item) ?? existente?.ultimoPreco ?? item.precoUnitario,
```

- [ ] **Step 7: Rodar a verificação**

Run: `TZ=America/Sao_Paulo npx --yes tsx "$SCRATCH/verificar-mercado-t2.ts"`
Expected: todas as linhas `OK`, exit 0.

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: nenhum erro novo. Se `itens-comparacao.tsx` ou `compra-card.tsx` reclamarem de algo, são consumidores ajustados na Task 3 (`ComparacaoItem` só ganhou campos; `calcularSubtotalItem` aceita `ItemMercado`, que satisfaz `ItemCalculavel`).

- [ ] **Step 9: Checkpoint**

Sugerir commit: `feat(mercado): subtotal por unidade, preço por unidade base e comparativo por dimensão`

---

### Task 3: Formulário, card, comparativo e catálogo na UI

**Files:**
- Modify: `src/components/mercado/compra-form.tsx`
- Modify: `src/components/mercado/compra-card.tsx`
- Modify: `src/components/mercado/itens-comparacao.tsx`
- Modify: `src/components/mercado/catalogo-lista.tsx`

**Interfaces:**
- Consumes (Task 2): `calcularSubtotalItem`, `calcularPrecoPorUnidadeBase`, `dimensaoDaUnidade`, `unidadeBaseDaDimensao`, `ComparacaoItem.chave/unidadeBase`.
- Produces: nenhuma interface nova; só renderização e comportamento do formulário.

- [ ] **Step 1: `compra-form.tsx` — imports, rótulos e subtotal do formulário**

Trocar:

```ts
import { normalizarNomeItem, dataLocalISO } from "@/lib/calculos-mercado";
```

por:

```ts
import {
  normalizarNomeItem,
  dataLocalISO,
  calcularSubtotalItem,
  calcularPrecoPorUnidadeBase,
  dimensaoDaUnidade,
  unidadeBaseDaDimensao,
} from "@/lib/calculos-mercado";
```

Logo depois de `const UNIDADES: UnidadeMedida[] = ["un", "kg", "g", "L", "ml"];` adicionar:

```ts
const ROTULO_QUANTIDADE: Record<UnidadeMedida, string> = {
  un: "Quantidade",
  kg: "Peso (kg)",
  g: "Peso (g)",
  L: "Volume (L)",
  ml: "Volume (ml)",
};
```

Depois de `type CompraFormData = z.infer<typeof compraSchema>;` adicionar:

```ts
function subtotalDoFormulario(item?: CompraFormData["itens"][number]): number {
  if (!item) return 0;
  return calcularSubtotalItem({
    unidade: item.unidade,
    precoUnitario: item.precoUnitario || 0,
    quantidade: item.quantidade || 0,
  });
}
```

Trocar o cálculo do total:

```ts
  const totalCompra = itensAtuais.reduce(
    (soma, item) => soma + (item.precoUnitario || 0) * (item.quantidade || 0),
    0
  );
```

por:

```ts
  const totalCompra = itensAtuais.reduce((soma, item) => soma + subtotalDoFormulario(item), 0);
```

- [ ] **Step 2: `compra-form.tsx` — pré-preenchimento só de preço para `un`**

Em `handleNomeBlur`, trocar:

```ts
    setValue(`itens.${index}.unidade`, entrada.ultimaUnidade);
    setValue(`itens.${index}.precoUnitario`, entrada.ultimoPreco);
```

por:

```ts
    setValue(`itens.${index}.unidade`, entrada.ultimaUnidade);
    if (entrada.ultimaUnidade === "un") {
      setValue(`itens.${index}.precoUnitario`, entrada.ultimoPreco);
    }
```

- [ ] **Step 3: `compra-form.tsx` — botão "Adicionar Item" abaixo da lista**

Trocar o cabeçalho da seção de itens:

```tsx
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Itens</label>
              <Button type="button" variant="outline" size="sm" onClick={() => append(itemVazio())}>
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
```

por:

```tsx
            <label className="text-sm font-medium">Itens</label>
```

e logo depois do fechamento do `{fields.map((field, index) => { ... })}` (a linha `            })}` que antecede o `</div>` que fecha `space-y-3`), adicionar:

```tsx
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append(itemVazio())}
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Item
            </Button>
```

- [ ] **Step 4: `compra-form.tsx` — linha do item (Unidade → Quantidade → Valor, com texto auxiliar)**

No corpo do `fields.map`, substituir as linhas de preparação:

```tsx
              const item = itensAtuais[index];
              const subtotal = (item?.precoUnitario || 0) * (item?.quantidade || 0);
              const nomeAtual = item?.nome ?? "";
              const marcasSugeridas =
                catalogo.find((c) => c.nomeNormalizado === normalizarNomeItem(nomeAtual))
                  ?.marcas ?? [];
```

por:

```tsx
              const item = itensAtuais[index];
              const subtotal = subtotalDoFormulario(item);
              const nomeAtual = item?.nome ?? "";
              const entradaCatalogo = catalogo.find(
                (c) => c.nomeNormalizado === normalizarNomeItem(nomeAtual)
              );
              const marcasSugeridas = entradaCatalogo?.marcas ?? [];
              const unidade = item?.unidade ?? "un";
              const ehUnidade = unidade === "un";
              const unidadeBase = unidadeBaseDaDimensao(dimensaoDaUnidade(unidade));
              const precoBase =
                !ehUnidade && item?.precoUnitario > 0 && item?.quantidade > 0
                  ? calcularPrecoPorUnidadeBase({
                      unidade,
                      precoUnitario: item.precoUnitario,
                      quantidade: item.quantidade,
                    })
                  : null;
              const ultimoPrecoBase =
                entradaCatalogo &&
                !ehUnidade &&
                dimensaoDaUnidade(entradaCatalogo.ultimaUnidade) === dimensaoDaUnidade(unidade)
                  ? entradaCatalogo.ultimoPreco
                  : null;
```

Substituir todo o bloco `<div className="grid grid-cols-3 gap-2"> ... </div>` (as três colunas Preço, Quantidade, Unidade) por:

```tsx
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Unidade</label>
                      <Select
                        value={unidade}
                        onValueChange={(v) => setValue(`itens.${index}.unidade`, v as UnidadeMedida)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIDADES.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {ROTULO_QUANTIDADE[unidade]}
                      </label>
                      <Input
                        type="number"
                        step={ehUnidade ? "1" : "0.001"}
                        {...register(`itens.${index}.quantidade` as const, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.itens?.[index]?.quantidade && (
                        <p className="text-sm text-destructive">
                          {errors.itens[index]?.quantidade?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {ehUnidade ? "Preço Unit. (R$)" : "Valor pago (R$)"}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`itens.${index}.precoUnitario` as const, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.itens?.[index]?.precoUnitario && (
                        <p className="text-sm text-destructive">
                          {errors.itens[index]?.precoUnitario?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {(precoBase !== null || ultimoPrecoBase !== null) && (
                    <p className="text-xs text-muted-foreground">
                      {precoBase !== null && `≈ ${formatarMoeda(precoBase)}/${unidadeBase}`}
                      {precoBase !== null && ultimoPrecoBase !== null && " · "}
                      {ultimoPrecoBase !== null &&
                        `último: ${formatarMoeda(ultimoPrecoBase)}/${unidadeBase}`}
                    </p>
                  )}
```

- [ ] **Step 5: `compra-card.tsx` — detalhe por unidade**

Substituir o `<ul>` dos itens:

```tsx
        <ul className="mt-3 space-y-1 text-sm">
          {compra.itens.map((item) => (
            <li key={item.id} className="flex justify-between text-muted-foreground">
              <span>
                {item.nome}
                {item.marca ? ` (${item.marca})` : ""} —{" "}
                {item.quantidade.toLocaleString("pt-BR")} {item.unidade}
              </span>
              <span>{formatarMoeda(calcularSubtotalItem(item))}</span>
            </li>
          ))}
        </ul>
```

por:

```tsx
        <ul className="mt-3 space-y-1 text-sm">
          {compra.itens.map((item) => {
            const quantidade = item.quantidade.toLocaleString("pt-BR");
            const detalhe =
              item.unidade === "un"
                ? `${quantidade} un × ${formatarMoeda(item.precoUnitario)}`
                : `${quantidade} ${item.unidade}`;

            return (
              <li key={item.id} className="flex justify-between gap-2 text-muted-foreground">
                <span>
                  {item.nome}
                  {item.marca ? ` (${item.marca})` : ""} — {detalhe}
                </span>
                <span className="shrink-0">{formatarMoeda(calcularSubtotalItem(item))}</span>
              </li>
            );
          })}
        </ul>
```

- [ ] **Step 6: `itens-comparacao.tsx` — preço por unidade base**

Trocar `key={item.nome}` por `key={item.chave}`. Trocar:

```tsx
              <span className="text-muted-foreground">{formatarMoeda(item.precoMedioAtual)}</span>
```

por:

```tsx
              <span className="text-muted-foreground">
                {formatarMoeda(item.precoMedioAtual)}/{item.unidadeBase}
              </span>
```

e trocar:

```tsx
                    (antes {formatarMoeda(item.precoMedioAnterior)})
```

por:

```tsx
                    (antes {formatarMoeda(item.precoMedioAnterior)}/{item.unidadeBase})
```

- [ ] **Step 7: `catalogo-lista.tsx` — última compra por unidade base**

Adicionar ao import do topo: `import { dimensaoDaUnidade, unidadeBaseDaDimensao } from "@/lib/calculos-mercado";`

Trocar:

```tsx
                Última compra: {formatarMoeda(item.ultimoPreco)} / {item.ultimaUnidade}
```

por:

```tsx
                Última compra: {formatarMoeda(item.ultimoPreco)} /{" "}
                {unidadeBaseDaDimensao(dimensaoDaUnidade(item.ultimaUnidade))}
```

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: nenhum erro novo mencionando `compra-form`, `compra-card`, `itens-comparacao` ou `catalogo-lista`. Se `item?.precoUnitario > 0` reclamar de `possibly undefined`, trocar por `(item?.precoUnitario ?? 0) > 0` e `(item?.quantidade ?? 0) > 0`.

- [ ] **Step 9: Conferência manual na UI**

Run: `npm run dev`, `/mercado` → "Nova Compra":

1. Item novo, unidade `kg`, peso 1,6, valor pago 17,49 → subtotal e total R$ 17,49; texto "≈ R$ 10,93/kg"; rótulos "Peso (kg)" e "Valor pago (R$)".
2. Item `un`, quantidade 4, preço 1,79 → subtotal R$ 7,16; sem texto "≈".
3. Trocar a unidade de `kg` para `un` na mesma linha → rótulos voltam e subtotal passa a multiplicar.
4. Quantidade vazia em item `kg` → subtotal R$ 0,00, sem "NaN" nem "Infinity" em lugar nenhum.
5. Botão "Adicionar Item" aparece abaixo do último item, largura total, e adiciona linha nova abaixo.
6. Digitar nome de item `un` conhecido, sair do campo → unidade e preço pré-preenchidos. Item cujo catálogo tem unidade `kg` → só a unidade; a dica "último: R$ x/kg" aparece com unidade `kg` selecionada.
7. Salvar e conferir o card: "1,6 kg" (sem "×") para peso, "4 un × R$ 1,79" para `un`.
8. Comparativo com o mesmo nome em `kg` e `un` → duas linhas.
9. 375 px, 768 px e 1440 px: linha de 3 colunas sem scroll horizontal.

Nota: entradas de catálogo antigas com unidade não-`un` (ex.: "tomate" em `g`) têm `ultimoPreco` no significado antigo até a próxima vez que a compra for salva; editar e salvar a compra de outubro corrige.

- [ ] **Step 10: Checkpoint**

Sugerir commit: `feat(mercado): peso/volume com valor pago, preço por kg/L e botão de adicionar item abaixo da lista`

---

### Task 4: Mesclar itens do catálogo propagando o nome às compras

**Files:**
- Modify: `src/lib/calculos-mercado.ts`
- Modify: `src/stores/useFinanceStore.ts` (import, interface em `:75-78`, ação em `:907-926`)
- Modify: `src/components/mercado/catalogo-item-form.tsx`
- Modify: `src/pages/MercadoCatalogo.tsx`

**Interfaces:**
- Consumes: `editarEntradaCatalogoMercado(catalogo, nomeNormalizadoAntigo, { nome, marcas })` (existe e já mescla quando o novo nome colide, unindo `marcas`).
- Produces:
  - `renomearItemNasCompras(compras: CompraMercado[], nomeNormalizadoAntigo: string, novoNome: string, marcaParaItensSemMarca?: string): CompraMercado[]` em `@/lib/calculos-mercado`
  - `editarItemCatalogoMercado(nomeNormalizadoAntigo: string, dados: { nome: string; marcas: string[]; marcaComprasAntigas?: string }): Promise<void>` na store
  - `CatalogoItemForm.onSubmit(nomeNormalizadoAntigo, dados: { nome; marcas; marcaComprasAntigas?: string })`

- [ ] **Step 1: Escrever o script de verificação (deve falhar)**

Criar `$SCRATCH/verificar-mercado-t4.ts`:

```ts
import {
  renomearItemNasCompras,
  editarEntradaCatalogoMercado,
  atualizarCatalogoMercado,
  calcularComparacaoItens,
} from "C:/git/FinTrack/src/lib/calculos-mercado.ts";

let falhas = 0;
function conferir(nome: string, atual: unknown, esperado: unknown) {
  const ok = JSON.stringify(atual) === JSON.stringify(esperado);
  if (!ok) falhas++;
  console.log(ok ? "OK  " : "FAIL", nome, "→", JSON.stringify(atual), ok ? "" : `(esperado ${JSON.stringify(esperado)})`);
}

const it = (id: string, nome: string, preco: number, marca?: string) => ({
  id, nome, marca, unidade: "un" as const, precoUnitario: preco, quantidade: 1,
});
const setembro = { id: "s", data: "2026-09-07", criadoEm: "1", itens: [it("1", "creme de leite mococa", 1.79), it("2", "Sazon", 6)] };
const outubro = { id: "o", data: "2026-10-01", criadoEm: "2", itens: [it("3", "creme de leite", 1.89, "Mococa")] };

const antes = calcularComparacaoItens([setembro, outubro], 9, 2026);
conferir("antes da mescla: item novo", antes[0].precoMedioAnterior, null);

const renomeadas = renomearItemNasCompras([setembro, outubro], "creme de leite mococa", "creme de leite", "Mococa");
conferir("nome novo nas compras antigas", renomeadas[0].itens[0].nome, "creme de leite");
conferir("marca aplicada ao item sem marca", renomeadas[0].itens[0].marca, "Mococa");
conferir("outros itens intactos", renomeadas[0].itens[1], setembro.itens[1]);
conferir("compra sem o item mantém a mesma referência", renomeadas[1], outubro);

const semMarca = renomearItemNasCompras([setembro], "creme de leite mococa", "creme de leite");
conferir("sem marca informada, marca fica indefinida", semMarca[0].itens[0].marca, undefined);

const jaTemMarca = renomearItemNasCompras(
  [{ ...setembro, itens: [it("1", "creme de leite mococa", 1.79, "Outra")] }],
  "creme de leite mococa", "creme de leite", "Mococa"
);
conferir("não sobrescreve marca existente", jaTemMarca[0].itens[0].marca, "Outra");

const depois = calcularComparacaoItens(renomeadas, 9, 2026);
conferir("depois da mescla: preço anterior", depois[0].precoMedioAnterior, 1.79);

let catalogo = atualizarCatalogoMercado([], setembro);
catalogo = atualizarCatalogoMercado(catalogo, outubro);
const mesclado = editarEntradaCatalogoMercado(catalogo, "creme de leite mococa", {
  nome: "creme de leite",
  marcas: ["Mococa"],
});
conferir("catálogo mesclado em uma entrada", mesclado.filter((c) => c.nomeNormalizado === "creme de leite").length, 1);
conferir("catálogo sem a entrada antiga", mesclado.some((c) => c.nomeNormalizado === "creme de leite mococa"), false);

process.exit(falhas ? 1 : 0);
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `TZ=America/Sao_Paulo npx --yes tsx "$SCRATCH/verificar-mercado-t4.ts"`
Expected: falha de import (`renomearItemNasCompras` não existe).

- [ ] **Step 3: Adicionar `renomearItemNasCompras` em `calculos-mercado.ts`**

Adicionar no final do arquivo:

```ts
export function renomearItemNasCompras(
  compras: CompraMercado[],
  nomeNormalizadoAntigo: string,
  novoNome: string,
  marcaParaItensSemMarca?: string
): CompraMercado[] {
  const marcaNova = marcaParaItensSemMarca?.trim() || undefined;

  return compras.map((compra) => {
    let mudou = false;
    const itens = compra.itens.map((item) => {
      if (normalizarNomeItem(item.nome) !== nomeNormalizadoAntigo) return item;
      mudou = true;
      return {
        ...item,
        nome: novoNome.trim(),
        marca: item.marca?.trim() ? item.marca : marcaNova,
      };
    });
    return mudou ? { ...compra, itens } : compra;
  });
}
```

- [ ] **Step 4: Rodar a verificação**

Run: `TZ=America/Sao_Paulo npx --yes tsx "$SCRATCH/verificar-mercado-t4.ts"`
Expected: todas `OK`, exit 0.

- [ ] **Step 5: Store — assinatura e ação**

Em `src/stores/useFinanceStore.ts`, no import de `@/lib/calculos-mercado` (linhas 16-20), adicionar `renomearItemNasCompras`. Trocar a assinatura na interface:

```ts
  editarItemCatalogoMercado: (
    nomeNormalizadoAntigo: string,
    dados: { nome: string; marcas: string[] }
  ) => Promise<void>;
```

por:

```ts
  editarItemCatalogoMercado: (
    nomeNormalizadoAntigo: string,
    dados: { nome: string; marcas: string[]; marcaComprasAntigas?: string }
  ) => Promise<void>;
```

Trocar o corpo da ação:

```ts
    const novoState: DadosApp = {
      ...state,
      catalogoMercado: editarEntradaCatalogoMercado(
        state.catalogoMercado,
        nomeNormalizadoAntigo,
        dados
      ),
    };
```

por:

```ts
    const marcaComprasAntigas = dados.marcaComprasAntigas?.trim();

    const novoState: DadosApp = {
      ...state,
      comprasMercado: renomearItemNasCompras(
        state.comprasMercado,
        nomeNormalizadoAntigo,
        dados.nome,
        marcaComprasAntigas
      ),
      catalogoMercado: editarEntradaCatalogoMercado(state.catalogoMercado, nomeNormalizadoAntigo, {
        nome: dados.nome,
        marcas: marcaComprasAntigas ? [...dados.marcas, marcaComprasAntigas] : dados.marcas,
      }),
    };
```

- [ ] **Step 6: `catalogo-item-form.tsx` — campo "Marca das compras antigas"**

Trocar o schema:

```ts
const catalogoItemFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  marcas: z.array(z.object({ valor: z.string() })),
});
```

por:

```ts
const catalogoItemFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  marcaComprasAntigas: z.string().optional(),
  marcas: z.array(z.object({ valor: z.string() })),
});
```

Trocar o tipo da prop `onSubmit`:

```ts
  onSubmit: (nomeNormalizadoAntigo: string, dados: { nome: string; marcas: string[] }) => void;
```

por:

```ts
  onSubmit: (
    nomeNormalizadoAntigo: string,
    dados: { nome: string; marcas: string[]; marcaComprasAntigas?: string }
  ) => void;
```

Em `valoresIniciais`, adicionar `marcaComprasAntigas: "",` logo depois de `nome: item?.nomeExibicao ?? "",`. Em `handleFormSubmit`, trocar:

```ts
    onSubmit(item.nomeNormalizado, {
      nome: data.nome,
      marcas: data.marcas.map((m) => m.valor),
    });
```

por:

```ts
    onSubmit(item.nomeNormalizado, {
      nome: data.nome,
      marcas: data.marcas.map((m) => m.valor),
      marcaComprasAntigas: data.marcaComprasAntigas,
    });
```

Depois do bloco do campo Nome (`{errors.nome && ...}</div>`), inserir:

```tsx
          <div>
            <label className="text-sm font-medium">Marca das compras antigas</label>
            <Input placeholder="Opcional" {...register("marcaComprasAntigas")} />
            <p className="text-xs text-muted-foreground">
              Aplicada às compras deste item que estão sem marca. O nome novo vale para todas.
            </p>
          </div>
```

- [ ] **Step 7: `MercadoCatalogo.tsx` — tipo do handler**

Trocar:

```ts
  function handleSubmit(
    nomeNormalizadoAntigo: string,
    dadosItem: { nome: string; marcas: string[] }
  ) {
```

por:

```ts
  function handleSubmit(
    nomeNormalizadoAntigo: string,
    dadosItem: { nome: string; marcas: string[]; marcaComprasAntigas?: string }
  ) {
```

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: nenhum erro novo mencionando `renomearItemNasCompras`, `editarItemCatalogoMercado`, `marcaComprasAntigas` ou `catalogo-item-form`.

- [ ] **Step 9: Conferência manual na UI**

Run: `npm run dev`, `/mercado/catalogo`:

1. Editar "creme de leite mococa": nome "creme de leite", marca das compras antigas "Mococa", salvar.
2. Catálogo mostra uma única entrada "creme de leite" com a marca Mococa; não sobra "creme de leite mococa".
3. Em `/mercado`, o card da compra de 07/09 mostra "creme de leite (Mococa)".
4. O comparativo de outubro mostra "creme de leite" com "(antes R$ 1,79/un)" e variação positiva.
5. Editar só as marcas de um item sem mudar o nome e deixar o campo novo vazio: nomes e marcas das compras não mudam.

- [ ] **Step 10: Checkpoint**

Sugerir commit: `feat(mercado): mesclar itens do catálogo propagando nome e marca às compras`

---

### Task 5: Documentação

**Files:**
- Modify: `implementado/mercado.md`
- Modify: `docs/REQUISITOS.md`
- Modify: `docs/superpowers/specs/2026-10-02-mercado-quantidade-medida-design.md`

**Interfaces:**
- Nenhuma (só documentação).

- [ ] **Step 1: `implementado/mercado.md` — novos requisitos e ajuste do RF-25**

Em RF-25, trocar o trecho final `a edição afeta apenas sugestões futuras, nunca compras já registradas` por `a edição de nome passa a valer também para as compras já registradas (ver RF-35)`.

Depois de RF-29, adicionar:

```markdown
- [x] RF-30: Para itens em `kg`, `g`, `L` ou `ml`, o campo de valor é "Valor pago" e a quantidade é só o peso/volume anotado; o subtotal é o valor pago (sem multiplicar). Para `un`, o subtotal continua `preço × quantidade`
- [x] RF-31: O formulário mostra o preço por unidade base ("≈ R$ 10,93/kg") para itens de peso/volume e a dica do último preço por kg/L do catálogo
- [x] RF-32: O comparativo de preços agrupa por nome + dimensão (contagem, massa, volume) e exibe o preço médio por unidade base (R$/un, R$/kg, R$/L); o mesmo nome em dimensões diferentes vira linhas separadas
- [x] RF-33: O mês de cada compra e a data padrão do formulário são calculados no fuso local (compra do dia 1º conta no mês correto)
- [x] RF-34: O botão "Adicionar Item" fica abaixo da lista de itens no formulário de compra
- [x] RF-35: Editar o nome de um item no catálogo renomeia o item em todas as compras e, opcionalmente, aplica uma marca às compras que estão sem marca; nomes que colidem são mesclados
```

Adicionar uma linha no Histórico de Alterações do arquivo, se existir, com a data `02/10/2026`.

- [ ] **Step 2: `docs/REQUISITOS.md`**

Na seção de Mercado, adicionar bullets:

```markdown
- Itens em kg/g/L/ml registram o valor pago e o peso/volume como anotação (sem multiplicar); itens em `un` calculam preço × quantidade
- Comparativo de preços por nome e dimensão, exibido em R$/un, R$/kg ou R$/L
- Edição do nome de um item no catálogo renomeia as compras e permite aplicar marca às compras sem marca
```

Adicionar na tabela "Histórico de Alterações":

```markdown
| 02/10/2026 | Feature: Mercado — peso/volume com valor pago e preço por kg/L, comparativo por dimensão, mesclagem de itens do catálogo nas compras, botão "Adicionar Item" abaixo da lista; correção do mês/data no fuso local |
```

- [ ] **Step 3: Ajustar a spec ao que foi implementado**

Em `docs/superpowers/specs/2026-10-02-mercado-quantidade-medida-design.md`, na seção "Formulário", item 3, trocar `quando há valor e quantidade` por `quando há valor e quantidade e a unidade é de peso/volume (para `un` seria igual ao preço unitário)`. Na seção "Bug do painel", acrescentar ao final do último parágrafo: `A data padrão do formulário (`new Date().toISOString()`, em UTC) vira "amanhã" depois das 21h em Brasília; passa a usar `dataLocalISO()`.` Na seção "Nomes diferentes entre meses", acrescentar: `A mesclagem é feita pela edição do item no catálogo (nome novo + marca opcional das compras antigas).`

- [ ] **Step 4: Checkpoint**

Sugerir commit: `docs(mercado): documentar peso/volume, comparativo por dimensão e correção de fuso`

---

## Self-Review Notes

- **Spec coverage:** bug de mês/fuso → Task 1; regra central de subtotal e preço por unidade base → Task 2; comparativo por nome+dimensão → Task 2; catálogo (`ultimoPreco` por base, pré-preenchimento só de `un`, dica por kg) → Tasks 2 e 3; formulário (ordem Unidade/Quantidade/Valor, rótulos, texto auxiliar, botão abaixo) → Task 3; exibição (card, comparativo, catálogo) → Task 3; mesclagem de nomes entre meses → Task 4; compatibilidade (sem migração, itens `un` iguais) → Global Constraints e Task 2 (`un` mantém a fórmula); verificação 1-10 da spec → scripts das Tasks 1, 2 e 4 mais conferências manuais da Task 3.
- **Placeholder scan:** nenhum "TBD"/"TODO"; todo step de código traz o código.
- **Type consistency:** `ItemCalculavel`, `Dimensao`, `dimensaoDaUnidade`, `unidadeBaseDaDimensao`, `calcularPrecoPorUnidadeBase`, `renomearItemNasCompras`, `marcaComprasAntigas` e `ComparacaoItem.chave/unidadeBase` têm o mesmo nome e assinatura nas tasks que definem e nas que consomem.
