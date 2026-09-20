# Mercado: Marca, Unidade de Medida e Catálogo de Itens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Extend the existing "Mercado" module so items can be measured by weight/volume (not just unit count), track an optional brand per item, and auto-populate a reusable catalog of previously bought item names/brands that suggests and pre-fills values when registering a new purchase.

**Architecture:** Extends `ItemMercado` with `marca`/`unidade` fields, adds a new `CatalogoItemMercado[]` array to `DadosApp` that is derived and merged automatically (never manually edited) every time a compra is added or edited, and wires that catalog into the existing form as native `<datalist>` suggestions plus an onBlur pre-fill. The price-comparison logic (RF-11/DDR-002) is untouched — brand and unit are metadata, not part of the comparison grouping key.

**Tech Stack:** React 19 + TypeScript, Zustand, React Hook Form + Zod, Radix Select (already used elsewhere in the app for enum-like fields), native HTML `<datalist>` for autocomplete (no new dependency), Express + JSON file persistence (unchanged shape of API, new field only).

**Spec:** `docs/superpowers/specs/2026-09-19-mercado-marca-unidade-catalogo-design.md`

## Global Constraints

- O catálogo (`catalogoMercado`) **só cresce**: editar ou excluir uma compra nunca remove uma entrada, nome ou marca já registrados no catálogo (spec, seção "Comportamento do Catálogo").
- `marca` é **opcional** em `ItemMercado`; itens sem marca continuam válidos.
- `unidade` é **obrigatória**, com os únicos valores possíveis `"un" | "kg" | "g" | "L" | "ml"`, default `"un"`.
- `marca` e `unidade` são metadado/rótulo: **não alteram** a fórmula de subtotal (`precoUnitario * quantidade`) nem a lógica de agrupamento do comparativo de preços (`calcularComparacaoItens` continua agrupando só por nome normalizado — spec, seção "Fora de escopo").
- Sem framework de testes automatizados neste projeto (mesma convenção do módulo Mercado original): cada task troca o ciclo TDD por (1) escrever o código, (2) `npm run build` para checagem de tipos, (3) validar manualmente via UI/leitura de código os casos de exemplo dados abaixo.
- Todo componente visual novo/modificado deve continuar funcionando em 375px, 768px, 1024px e 1440px sem quebra de layout.
- Compatibilidade com dados antigos: itens de compras já existentes sem `unidade`/`marca` devem ser tratados como `unidade: "un"` e `marca: undefined` ao serem lidos; `catalogoMercado` ausente em arquivos antigos deve ser normalizado para `[]`, seguindo exatamente o padrão de 3 pontos já usado para `comprasMercado` (Task 1 do módulo original: `src/lib/storage.ts`, e `server.js` em `criarDadosNovos`, `carregarOuCriar`, `PUT /api/data`).

---

### Task 1: Modelo de dados — marca, unidade e catálogo

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/storage.ts`
- Modify: `server.js`

**Interfaces:**
- Produces: `UnidadeMedida = "un" | "kg" | "g" | "L" | "ml"`, `ItemMercado` com os novos campos `marca?: string` e `unidade: UnidadeMedida`, `CatalogoItemMercado { nomeNormalizado, nomeExibicao, marcas, ultimaUnidade, ultimoPreco, atualizadoEm }`, e `DadosApp.catalogoMercado: CatalogoItemMercado[]` — todas as tasks seguintes leem/escrevem esses campos.

- [x] **Step 1: Adicionar os tipos em `src/types/index.ts`**

Localizar a interface `ItemMercado` atual (logo após `AtivoFii`):

```ts
export interface ItemMercado {
  id: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
}
```

Substituir por (adiciona o type `UnidadeMedida` antes, e os campos `marca`/`unidade` na interface):

```ts
export type UnidadeMedida = "un" | "kg" | "g" | "L" | "ml";

export interface ItemMercado {
  id: string;
  nome: string;
  marca?: string;
  unidade: UnidadeMedida;
  precoUnitario: number;
  quantidade: number;
}
```

Logo depois de `CompraMercado` (antes de `DadosApp`), adicionar:

```ts
export interface CatalogoItemMercado {
  nomeNormalizado: string;
  nomeExibicao: string;
  marcas: string[];
  ultimaUnidade: UnidadeMedida;
  ultimoPreco: number;
  atualizadoEm: string;
}
```

Atualizar `DadosApp` para incluir o novo campo:

```ts
export interface DadosApp {
  transacoes: Transacao[];
  categorias: Categoria[];
  contas: Conta[];
  cartoes: Cartao[];
  metas: Meta[];
  config: Config;
  ativosFii: AtivoFii[];
  comprasMercado: CompraMercado[];
  catalogoMercado: CatalogoItemMercado[];
}
```

- [x] **Step 2: Atualizar o fallback local em `src/lib/storage.ts`**

Na função `criarDadosNovos()` (linha 15 atualmente tem `comprasMercado: [],`), adicionar `catalogoMercado: [],` logo depois:

```ts
    comprasMercado: [],
    catalogoMercado: [],
```

- [x] **Step 3: Atualizar o backend `server.js` em três pontos**

Em `criarDadosNovos()` (linha 94 atualmente tem `comprasMercado: [],`):

```js
    comprasMercado: [],
    catalogoMercado: [],
```

Em `carregarOuCriar()` (linha 196 atualmente tem `dados.comprasMercado = dados.comprasMercado ?? [];`), adicionar logo depois:

```js
  dados.comprasMercado = dados.comprasMercado ?? [];
  dados.catalogoMercado = dados.catalogoMercado ?? [];
```

No handler `PUT /api/data` (linha 228 atualmente tem `dados.comprasMercado = dados.comprasMercado ?? [];`), o mesmo:

```js
    dados.comprasMercado = dados.comprasMercado ?? [];
    dados.catalogoMercado = dados.catalogoMercado ?? [];
```

- [x] **Step 4: Verificar tipos**

Run: `npm run build`
Expected: o build vai falhar até que `src/lib/storage.ts` e qualquer outro objeto literal tipado como `DadosApp` inclua `catalogoMercado` — depois do Step 2, deve compilar sem NOVOS erros (a baseline pré-existente do projeto já tem ~24-27 erros de TypeScript não relacionados a este módulo; confirme que nenhum erro novo menciona `catalogoMercado`, `UnidadeMedida`, `CatalogoItemMercado`, `marca` ou `unidade`).

- [x] **Step 5: Commit**

```bash
git add src/types/index.ts src/lib/storage.ts server.js
git commit -m "feat(mercado): adicionar tipos de marca, unidade e catálogo de itens"
```

---

### Task 2: Função pura de atualização do catálogo

**Files:**
- Modify: `src/lib/calculos-mercado.ts`

**Interfaces:**
- Consumes: `CompraMercado`, `ItemMercado`, `CatalogoItemMercado` de `@/types` (Task 1); `normalizarNomeItem` já existe neste mesmo arquivo.
- Produces: `atualizarCatalogoMercado(catalogoAtual: CatalogoItemMercado[], compra: CompraMercado): CatalogoItemMercado[]`. Task 3 chama esta função por este nome exato.

- [x] **Step 1: Adicionar a função no arquivo**

No topo do arquivo, atualizar o import para incluir o novo tipo:

```ts
import type { CompraMercado, ItemMercado, CatalogoItemMercado } from "@/types";
```

Adicionar a função no final do arquivo (depois de `calcularComparacaoItens`):

```ts
export function atualizarCatalogoMercado(
  catalogoAtual: CatalogoItemMercado[],
  compra: CompraMercado
): CatalogoItemMercado[] {
  const catalogo = new Map<string, CatalogoItemMercado>(
    catalogoAtual.map((entrada) => [entrada.nomeNormalizado, entrada])
  );

  for (const item of compra.itens) {
    const chave = normalizarNomeItem(item.nome);
    const existente = catalogo.get(chave);
    const marcas = new Set(existente?.marcas ?? []);

    if (item.marca && item.marca.trim() !== "") {
      marcas.add(item.marca.trim());
    }

    catalogo.set(chave, {
      nomeNormalizado: chave,
      nomeExibicao: item.nome,
      marcas: Array.from(marcas),
      ultimaUnidade: item.unidade,
      ultimoPreco: item.precoUnitario,
      atualizadoEm: new Date().toISOString(),
    });
  }

  return Array.from(catalogo.values());
}
```

Nota de design: a função nunca remove uma entrada de `catalogoAtual` — só adiciona/atualiza a partir dos itens da compra recebida (satisfaz a regra "catálogo só cresce" do Global Constraints). `marcas` é um `Set` só para deduplicar durante a montagem; o campo persistido continua `string[]`.

- [x] **Step 2: Verificar tipos**

Run: `npm run build`
Expected: sem erros novos.

- [x] **Step 3: Verificação manual (oráculo: exemplos do design)**

Trace à mão os seguintes casos lendo o código (sem framework de testes neste projeto):

1. **Catálogo vazio + compra com 1 item com marca:** `atualizarCatalogoMercado([], compra)` onde `compra.itens = [{ nome: "Arroz", marca: "Camil", unidade: "kg", precoUnitario: 25, quantidade: 1, id: "x" }]` deve retornar `[{ nomeNormalizado: "arroz", nomeExibicao: "Arroz", marcas: ["Camil"], ultimaUnidade: "kg", ultimoPreco: 25, atualizadoEm: <iso recente> }]`.
2. **Mesmo item, marca nova, catálogo já tem uma marca:** chamando de novo com `catalogoAtual` = resultado do passo 1 e uma nova compra do mesmo item com `marca: "Tio João"` deve retornar `marcas: ["Camil", "Tio João"]` (ambas presentes, nenhuma perdida).
3. **Item sem marca (`marca: undefined` ou `""`):** não deve adicionar string vazia a `marcas`.
4. **Nomes com grafia diferente, mesmo normalizado (`"arroz"` vs `" Arroz "`):** devem cair na mesma entrada do catálogo (mesma chave `nomeNormalizado`), e `nomeExibicao` deve refletir a grafia da chamada mais recente.

Confirme lendo o código que os 4 casos produzem exatamente esses resultados.

- [x] **Step 4: Commit**

```bash
git add src/lib/calculos-mercado.ts
git commit -m "feat(mercado): adicionar função de atualização do catálogo de itens"
```

---

### Task 3: Store — integrar catálogo às ações de compra

**Files:**
- Modify: `src/stores/useFinanceStore.ts`

**Interfaces:**
- Consumes: `atualizarCatalogoMercado` de `@/lib/calculos-mercado` (Task 2); `CatalogoItemMercado` de `@/types` (Task 1); ações existentes `adicionarCompraMercado`/`editarCompraMercado`/`excluirCompraMercado` (já implementadas no módulo original).
- Produces: nenhuma interface nova exposta — o comportamento interno de `adicionarCompraMercado`/`editarCompraMercado` muda para também atualizar `state.catalogoMercado`, mas as assinaturas públicas dessas ações não mudam.

- [x] **Step 1: Importar a função de cálculo e o tipo**

No bloco de import de tipos no topo do arquivo, adicionar `CatalogoItemMercado`:

```ts
import type {
  DadosApp,
  Transacao,
  Categoria,
  Conta,
  Cartao,
  Meta,
  Config,
  AtivoFii,
  CompraMercado,
  CatalogoItemMercado,
} from "@/types";
```

Adicionar um novo import (perto dos outros imports de `@/lib/*`):

```ts
import { atualizarCatalogoMercado } from "@/lib/calculos-mercado";
```

- [x] **Step 2: Atualizar `adicionarCompraMercado`**

Localizar a implementação atual:

```ts
  adicionarCompraMercado: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novaCompra: CompraMercado = {
      ...dados,
      id: gerarId(),
      criadoEm: new Date().toISOString(),
    };

    const novoState: DadosApp = {
      ...state,
      comprasMercado: adicionarItensArray(state.comprasMercado, novaCompra),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },
```

Substituir por (adiciona `catalogoMercado` ao `novoState`):

```ts
  adicionarCompraMercado: async (dados) => {
    const state = get().dados;
    if (!state) return;

    const novaCompra: CompraMercado = {
      ...dados,
      id: gerarId(),
      criadoEm: new Date().toISOString(),
    };

    const novoState: DadosApp = {
      ...state,
      comprasMercado: adicionarItensArray(state.comprasMercado, novaCompra),
      catalogoMercado: atualizarCatalogoMercado(state.catalogoMercado, novaCompra),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },
```

- [x] **Step 3: Atualizar `editarCompraMercado`**

Localizar a implementação atual:

```ts
  editarCompraMercado: async (id, dados) => {
    const state = get().dados;
    if (!state) return;

    const novoState: DadosApp = {
      ...state,
      comprasMercado: editarItemArray(state.comprasMercado, id, dados),
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },
```

Substituir por (calcula a lista atualizada primeiro, encontra a compra editada, e só chama `atualizarCatalogoMercado` se ela existir — sempre existe em uso normal, mas evita assumir isso sem checar):

```ts
  editarCompraMercado: async (id, dados) => {
    const state = get().dados;
    if (!state) return;

    const comprasAtualizadas = editarItemArray(state.comprasMercado, id, dados);
    const compraEditada = comprasAtualizadas.find((c) => c.id === id);

    const novoState: DadosApp = {
      ...state,
      comprasMercado: comprasAtualizadas,
      catalogoMercado: compraEditada
        ? atualizarCatalogoMercado(state.catalogoMercado, compraEditada)
        : state.catalogoMercado,
    };

    set({ dados: novoState });
    try {
      await salvar(novoState);
    } catch {
      set({ dados: state });
    }
  },
```

Nota: `excluirCompraMercado` **não muda** — a regra é que o catálogo nunca perde entradas ao excluir uma compra (Global Constraints).

- [x] **Step 4: Verificar tipos**

Run: `npm run build`
Expected: sem erros novos.

- [x] **Step 5: Commit**

```bash
git add src/stores/useFinanceStore.ts
git commit -m "feat(mercado): atualizar catálogo automaticamente ao salvar compras"
```

---

### Task 4: Formulário — marca, unidade, sugestões e pré-preenchimento

**Files:**
- Modify: `src/components/mercado/compra-form.tsx`
- Modify: `src/pages/Mercado.tsx`

**Interfaces:**
- Consumes: `UnidadeMedida`, `CatalogoItemMercado` de `@/types` (Task 1); `normalizarNomeItem` de `@/lib/calculos-mercado` (já existe); `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` de `@/components/ui/select` (já usado em outros formulários do app, ex. `src/components/contas/conta-form.tsx`).
- Produces: `CompraForm` passa a exigir uma nova prop `catalogo: CatalogoItemMercado[]`. Mercado.tsx (consumidor único) passa `dados?.catalogoMercado ?? []`.

- [x] **Step 1: Atualizar os imports e o schema em `compra-form.tsx`**

Substituir o bloco de imports do topo do arquivo:

```ts
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { gerarId } from "@/lib/uuid";
import type { CompraMercado } from "@/types";
```

Por:

```ts
import { useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { gerarId } from "@/lib/uuid";
import { normalizarNomeItem } from "@/lib/calculos-mercado";
import type { CompraMercado, UnidadeMedida, CatalogoItemMercado } from "@/types";
```

Substituir o `itemSchema` atual:

```ts
const itemSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  precoUnitario: z.number().min(0.01, "Preço deve ser maior que 0"),
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que 0"),
});
```

Por:

```ts
const UNIDADES: UnidadeMedida[] = ["un", "kg", "g", "L", "ml"];

const itemSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  marca: z.string().optional(),
  unidade: z.enum(["un", "kg", "g", "L", "ml"]),
  precoUnitario: z.number().min(0.01, "Preço deve ser maior que 0"),
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que 0"),
});
```

- [x] **Step 2: Atualizar `CompraFormProps`, `itemVazio` e `valoresIniciais`**

Substituir:

```ts
interface CompraFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompraMercado;
  onSubmit: (data: Omit<CompraMercado, "id" | "criadoEm">) => void;
}

function itemVazio() {
  return { nome: "", precoUnitario: 0, quantidade: 1 };
}

function valoresIniciais(initialData?: CompraMercado): CompraFormData {
  return {
    data: initialData?.data ?? new Date().toISOString().split("T")[0],
    itens: initialData?.itens.map((i) => ({
      nome: i.nome,
      precoUnitario: i.precoUnitario,
      quantidade: i.quantidade,
    })) ?? [itemVazio()],
    observacoes: initialData?.observacoes ?? "",
  };
}
```

Por:

```ts
interface CompraFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompraMercado;
  catalogo: CatalogoItemMercado[];
  onSubmit: (data: Omit<CompraMercado, "id" | "criadoEm">) => void;
}

function itemVazio() {
  return { nome: "", marca: "", unidade: "un" as UnidadeMedida, precoUnitario: 0, quantidade: 1 };
}

function valoresIniciais(initialData?: CompraMercado): CompraFormData {
  return {
    data: initialData?.data ?? new Date().toISOString().split("T")[0],
    itens: initialData?.itens.map((i) => ({
      nome: i.nome,
      marca: i.marca ?? "",
      unidade: i.unidade ?? "un",
      precoUnitario: i.precoUnitario,
      quantidade: i.quantidade,
    })) ?? [itemVazio()],
    observacoes: initialData?.observacoes ?? "",
  };
}
```

- [x] **Step 3: Atualizar a assinatura do componente, adicionar o ref de rastreio e o handler de pré-preenchimento**

Substituir a linha de declaração do componente e o `useForm`:

```ts
export function CompraForm({ open, onOpenChange, initialData, onSubmit }: CompraFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema),
    defaultValues: valoresIniciais(initialData),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
```

Por:

```ts
export function CompraForm({ open, onOpenChange, initialData, catalogo, onSubmit }: CompraFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema),
    defaultValues: valoresIniciais(initialData),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const ultimoNomeCasado = useRef<Record<number, string>>({});

  function handleNomeBlur(index: number, valor: string) {
    const chave = normalizarNomeItem(valor);
    if (!chave || ultimoNomeCasado.current[index] === chave) return;

    const entrada = catalogo.find((c) => c.nomeNormalizado === chave);
    if (!entrada) return;

    ultimoNomeCasado.current[index] = chave;
    setValue(`itens.${index}.unidade`, entrada.ultimaUnidade);
    setValue(`itens.${index}.precoUnitario`, entrada.ultimoPreco);
  }
```

Nota: `ultimoNomeCasado` evita reaplicar o pré-preenchimento repetidamente enquanto o usuário navega para fora e volta ao mesmo campo sem mudar o nome (spec, seção Formulário — "só dispara para itens novos").

- [x] **Step 4: Adicionar o `<datalist>` de nomes (uma vez, compartilhado entre as linhas)**

Logo depois da abertura do `<form onSubmit={...}>`, antes do campo Data, adicionar:

```tsx
          <datalist id="mercado-nomes-catalogo">
            {catalogo.map((c) => (
              <option key={c.nomeNormalizado} value={c.nomeExibicao} />
            ))}
          </datalist>

```

- [x] **Step 5: Atualizar a linha do item — nome com datalist+onBlur, marca, unidade**

Localizar o bloco que renderiza cada linha de item (dentro de `{fields.map((field, index) => { ... })}`). O bloco atual é:

```tsx
              return (
                <div key={field.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Input placeholder="Nome do item" {...register(`itens.${index}.nome` as const)} />
                      {errors.itens?.[index]?.nome && (
                        <p className="text-sm text-destructive">
                          {errors.itens[index]?.nome?.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Preço Unit. (R$)</label>
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
                    <div>
                      <label className="text-xs text-muted-foreground">Quantidade</label>
                      <Input
                        type="number"
                        step="0.01"
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
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    Subtotal:{" "}
                    <span className="font-medium text-foreground">{formatarMoeda(subtotal)}</span>
                  </div>
                </div>
              );
```

Substituir por:

```tsx
              const nomeAtual = item?.nome ?? "";
              const marcasSugeridas =
                catalogo.find((c) => c.nomeNormalizado === normalizarNomeItem(nomeAtual))
                  ?.marcas ?? [];
              const { onBlur: onBlurNomeRegistrado, ...restoRegistroNome } = register(
                `itens.${index}.nome` as const
              );

              return (
                <div key={field.id} className="rounded-lg border p-3 space-y-2">
                  <datalist id={`mercado-marcas-${index}`}>
                    {marcasSugeridas.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>

                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <div>
                        <Input
                          list="mercado-nomes-catalogo"
                          placeholder="Nome do item"
                          {...restoRegistroNome}
                          onBlur={(e) => {
                            onBlurNomeRegistrado(e);
                            handleNomeBlur(index, e.target.value);
                          }}
                        />
                        {errors.itens?.[index]?.nome && (
                          <p className="text-sm text-destructive">
                            {errors.itens[index]?.nome?.message}
                          </p>
                        )}
                      </div>
                      <Input
                        list={`mercado-marcas-${index}`}
                        placeholder="Marca (opcional)"
                        {...register(`itens.${index}.marca` as const)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Preço Unit. (R$)</label>
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
                    <div>
                      <label className="text-xs text-muted-foreground">Quantidade</label>
                      <Input
                        type="number"
                        step="0.01"
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
                      <label className="text-xs text-muted-foreground">Unidade</label>
                      <Select
                        value={watch(`itens.${index}.unidade`)}
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
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    Subtotal:{" "}
                    <span className="font-medium text-foreground">{formatarMoeda(subtotal)}</span>
                  </div>
                </div>
              );
```

- [x] **Step 6: Atualizar `handleFormSubmit` para incluir marca/unidade**

Localizar:

```ts
  function handleFormSubmit(data: CompraFormData) {
    onSubmit({
      data: data.data,
      itens: data.itens.map((item) => ({
        id: gerarId(),
        nome: item.nome,
        precoUnitario: item.precoUnitario,
        quantidade: item.quantidade,
      })),
      observacoes: data.observacoes,
    });
    reset(valoresIniciais(undefined));
    onOpenChange(false);
  }
```

Substituir por:

```ts
  function handleFormSubmit(data: CompraFormData) {
    onSubmit({
      data: data.data,
      itens: data.itens.map((item) => ({
        id: gerarId(),
        nome: item.nome,
        marca: item.marca?.trim() ? item.marca.trim() : undefined,
        unidade: item.unidade,
        precoUnitario: item.precoUnitario,
        quantidade: item.quantidade,
      })),
      observacoes: data.observacoes,
    });
    ultimoNomeCasado.current = {};
    reset(valoresIniciais(undefined));
    onOpenChange(false);
  }
```

(Reseta `ultimoNomeCasado` junto com o formulário, para que o próximo "Nova Compra" comece sem estado de rastreio residual das linhas da compra anterior.)

- [x] **Step 7: Passar a prop `catalogo` a partir de `src/pages/Mercado.tsx`**

Localizar em `Mercado.tsx`:

```tsx
      <CompraForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingCompra ?? undefined}
        onSubmit={handleSubmit}
      />
```

Substituir por:

```tsx
      <CompraForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingCompra ?? undefined}
        catalogo={dados?.catalogoMercado ?? []}
        onSubmit={handleSubmit}
      />
```

- [x] **Step 8: Verificar tipos**

Run: `npm run build`
Expected: sem erros novos. Se o `register`/`setValue` com o path `itens.${index}.unidade` reclamar de inferência de tipo, confirme que `UNIDADES`/`itemSchema` usam exatamente os mesmos 5 literais (`"un" | "kg" | "g" | "L" | "ml"`) em ambos os lugares.

- [x] **Step 9: Commit**

```bash
git add src/components/mercado/compra-form.tsx src/pages/Mercado.tsx
git commit -m "feat(mercado): adicionar marca, unidade e sugestões do catálogo no formulário"
```

---

### Task 5: Card de compra — exibir marca e unidade

**Files:**
- Modify: `src/components/mercado/compra-card.tsx`

**Interfaces:**
- Consumes: `ItemMercado.marca`/`ItemMercado.unidade` (Task 1) — já presentes em qualquer `CompraMercado` lido do estado.
- Produces: nenhuma interface nova — só muda a renderização.

- [x] **Step 1: Atualizar a exibição de cada item**

Localizar:

```tsx
        <ul className="mt-3 space-y-1 text-sm">
          {compra.itens.map((item) => (
            <li key={item.id} className="flex justify-between text-muted-foreground">
              <span>
                {item.nome} ({item.quantidade.toLocaleString("pt-BR")}x)
              </span>
              <span>{formatarMoeda(calcularSubtotalItem(item))}</span>
            </li>
          ))}
        </ul>
```

Substituir por:

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

- [x] **Step 2: Verificar tipos**

Run: `npm run build`
Expected: sem erros novos.

- [x] **Step 3: Commit**

```bash
git add src/components/mercado/compra-card.tsx
git commit -m "feat(mercado): exibir marca e unidade no card de compra"
```

---

### Task 6: Verificação manual end-to-end e documentação

**Files:**
- Modify: `implementado/mercado.md`
- Modify: `docs/REQUISITOS.md`

**Interfaces:**
- None (documentação only).

- [x] **Step 1: Verificação manual end-to-end**

Run: `npm run dev`, abrir `/mercado`.

1. Clicar "Nova Compra", digitar item "Tomate", unidade "kg", preço 8, quantidade 0.487 — confirmar que o subtotal calcula `8 * 0.487 = R$ 3,90` (arredondado) e que o card, depois de salvar, mostra algo como "Tomate — 0,487 kg".
2. No mesmo item, preencher marca "Nenhuma" — não preencher marca (deixar em branco) — salvar — confirmar que o card não mostra parênteses de marca para esse item.
3. Adicionar um segundo item "Arroz", marca "Camil", unidade "kg", preço 25, quantidade 5 — salvar. Confirmar no card: "Arroz (Camil) — 5 kg".
4. Abrir "Nova Compra" de novo (mês seguinte, ou editar a data para o mês seguinte antes de salvar) e digitar "Arroz" no campo nome — confirmar que aparece a sugestão de autocompletar (navegador mostra "Arroz" na lista suspensa nativa do campo). Selecionar/confirmar "Arroz", sair do campo (Tab ou clicar fora) — confirmar que os campos Preço Unit. e Unidade foram preenchidos automaticamente com 25 e "kg" (os últimos valores usados). Confirmar também que o campo marca sugere "Camil" ao focar nele.
5. Trocar a marca sugerida para "Tio João" (marca nova) e salvar. Reabrir o formulário e digitar "Arroz" de novo no campo marca — confirmar que agora aparecem DUAS opções sugeridas: "Camil" e "Tio João".
6. Confirmar que o comparativo de preços (`ItensComparacao`) continua agrupando por nome do item (não por marca) — ou seja, "Arroz" aparece como uma única linha no comparativo, misturando as compras de ambas as marcas no cálculo da média ponderada (comportamento esperado, ver Global Constraints).
7. Excluir a compra do item "Tomate" — confirmar que, ao abrir "Nova Compra" de novo e digitar "Tomate", a sugestão de autocompletar **continua aparecendo** (o catálogo não esqueceu o item por causa da exclusão).
8. Abrir DevTools responsivo em 375px — confirmar que a nova linha de 3 colunas (Preço/Quantidade/Unidade) e o campo de marca não quebram o layout nem forçam scroll horizontal. Repetir em 768px e 1440px.

- [x] **Step 2: Atualizar `implementado/mercado.md`**

Adicionar ao final da seção **Requisitos Funcionais** (mantendo a numeração existente RF-01 a RF-17, adicionando a partir de RF-18):

```markdown
- [x] RF-18: Cada item pode ter uma unidade de medida (un, kg, g, L, ml), com "un" como padrão; a unidade é apenas rótulo de exibição e não afeta o cálculo de subtotal
- [x] RF-19: Cada item pode ter uma marca opcional
- [x] RF-20: O sistema mantém um catálogo de itens/marcas já comprados, atualizado automaticamente a cada compra criada ou editada; o catálogo nunca perde uma entrada por causa de uma edição ou exclusão de compra
- [x] RF-21: Ao digitar o nome de um item, o formulário sugere nomes já usados (via catálogo); ao digitar/focar o campo marca, sugere as marcas já usadas para aquele item específico
- [x] RF-22: Ao reconhecer um nome de item já existente no catálogo, o formulário pré-preenche automaticamente a última unidade e o último preço unitário usados para aquele item
- [x] RF-23: A marca e a unidade não afetam o agrupamento do comparativo de preços por item (RF-11/RF-12 continuam agrupando só por nome normalizado)
```

Adicionar uma nova linha na tabela **Histórico de Alterações** com a data de hoje descrevendo esta extensão.

- [x] **Step 3: Atualizar `docs/REQUISITOS.md`**

Na seção "8. Mercado — Registro de Compras" (criada pelo módulo original), adicionar ao final da lista de bullets:

```markdown
- Itens podem ter marca (opcional) e unidade de medida (un/kg/g/L/ml, padrão "un")
- Catálogo de itens/marcas já comprados, atualizado automaticamente, usado para sugerir e pré-preencher nome/marca/unidade/preço ao digitar um item conhecido
```

Adicionar uma linha na tabela "Histórico de Alterações" ao final do documento com a data de hoje.

- [x] **Step 4: Commit**

```bash
git add implementado/mercado.md docs/REQUISITOS.md
git commit -m "docs(mercado): documentar marca, unidade e catálogo de itens"
```

---

## Self-Review Notes

- **Spec coverage:** seção "Modelo de Dados" → Task 1. Seção "Comportamento do Catálogo" → Tasks 2/3 (função pura + integração no store, regra "só cresce" respeitada em ambas: Task 2 nunca remove do `catalogoAtual`, Task 3 não toca o catálogo em `excluirCompraMercado`). Seção "Formulário" → Task 4 (datalists, pré-preenchimento com rastreio via ref, unidade fixa via Select). Seção "Exibição" → Task 5 (card mostra marca/unidade; comparativo deliberadamente inalterado). Seção "Backward Compatibility" → Task 1 (defaults nos mesmos 3 pontos do `comprasMercado` original) + Task 4 (`valoresIniciais` usa `i.unidade ?? "un"` e `i.marca ?? ""` para compras antigas sem esses campos). "Limitação Conhecida" (mistura de unidades entre meses) é documentada no spec e deliberadamente não corrigida nesta entrega — nenhuma task tenta resolvê-la.
- **Placeholder scan:** nenhum encontrado — todo step tem código literal ou instrução de verificação literal.
- **Type consistency:** `UnidadeMedida`, `CatalogoItemMercado` e seus campos (`nomeNormalizado`, `nomeExibicao`, `marcas`, `ultimaUnidade`, `ultimoPreco`, `atualizadoEm`) são idênticos entre Task 1 (definição), Task 2 (`atualizarCatalogoMercado`), Task 3 (chamada no store) e Task 4 (consumo no formulário via prop `catalogo`). `atualizarCatalogoMercado` é chamada com a assinatura exata definida na Task 2 em ambos os pontos da Task 3. A prop `catalogo` do `CompraForm` (Task 4) é passada com o mesmo nome e tipo em `Mercado.tsx`.
