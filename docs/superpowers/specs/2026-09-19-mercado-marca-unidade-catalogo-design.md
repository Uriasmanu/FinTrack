# Mercado: Marca, Unidade de Medida e Catálogo de Itens — Design

## Contexto

O módulo Mercado (implementado em `implementado/mercado.md`, commits `adc4aea..3b23e6e`) já permite registrar compras com itens (nome, preço unitário, quantidade) e comparar preço médio ponderado mês a mês. Esta extensão nasceu de uma limitação real observada em uso: alguns itens são vendidos por peso/volume (não por unidade), não existe forma de registrar a marca do produto, e não há sugestão de itens/marcas já usados ao digitar uma nova compra — cada compra é digitada do zero.

Esta extensão reabre parcialmente a decisão original de "catálogo de produtos fora de escopo" (ver `implementado/mercado.md`, seção Contexto e Objetivo), mas de forma restrita: um catálogo auto-populado, não uma tela de gestão de produtos.

## Objetivo

1. Suportar itens medidos por peso/volume (kg, g, L, ml), não só por unidade.
2. Registrar a marca do produto comprado (opcional).
3. Sugerir, ao digitar um item, nomes e marcas já usados em compras anteriores — e pré-preencher unidade e preço com os últimos valores usados para aquele item — para agilizar o cadastro mês a mês.

## Fora de escopo

- Tela dedicada de gestão/edição manual do catálogo (o catálogo é só um efeito colateral automático do cadastro de compras).
- Conversão entre unidades (ex.: somar 500g + 0.5kg como a mesma quantidade). Cada `ItemMercado` mantém sua própria unidade; não há normalização entre unidades diferentes do mesmo item.
- Qualquer mudança na fórmula de comparação de preço (RF-11/DDR-002) — marca e unidade são adicionadas como metadado/rótulo, não como parte da lógica de agrupamento.

## Modelo de Dados

### `ItemMercado` (modificado)

```ts
export type UnidadeMedida = "un" | "kg" | "g" | "L" | "ml";

export interface ItemMercado {
  id: string;
  nome: string;
  marca?: string;
  unidade: UnidadeMedida;
  precoUnitario: number; // preço por 1 unidade da `unidade` informada
  quantidade: number;
}
```

- `marca` é opcional — itens genéricos (hortifruti, a granel) podem não ter marca.
- `unidade` é obrigatória, com valor padrão `"un"` para manter o comportamento atual quando o usuário não pensa em unidade.
- `precoUnitario * quantidade` continua sendo o subtotal do item, independente da unidade — a unidade é só rótulo de exibição, não entra em nenhuma conta.

### `CatalogoItemMercado` (novo)

```ts
export interface CatalogoItemMercado {
  nomeNormalizado: string; // trim().toLowerCase() — chave de agrupamento, igual ao usado na comparação de preços
  nomeExibicao: string;    // grafia mais recente digitada para este item
  marcas: string[];        // todas as marcas distintas (não vazias) já usadas para este item, ordem de primeiro uso
  ultimaUnidade: UnidadeMedida;
  ultimoPreco: number;     // último precoUnitario informado para este item (útil para pré-preencher o formulário)
  atualizadoEm: string;    // ISO timestamp da última atualização
}
```

### `DadosApp` (modificado)

```ts
export interface DadosApp {
  // ...campos existentes
  comprasMercado: CompraMercado[];
  catalogoMercado: CatalogoItemMercado[]; // novo
}
```

## Comportamento do Catálogo

**Regra central: o catálogo só cresce.** Ele nunca remove ou "esquece" um item/marca por causa de uma compra editada ou excluída. É pensado como uma memória cumulativa de tudo que já foi comprado, reaproveitável mês a mês — não um espelho ao vivo das compras atuais.

- **Ao adicionar uma compra:** para cada item da compra, faz merge no catálogo: se o nome normalizado já existe, atualiza `nomeExibicao` (sempre a grafia mais recente), adiciona a marca à lista `marcas` se ainda não estiver lá (e se não for vazia), e atualiza `ultimaUnidade`/`ultimoPreco`/`atualizadoEm` com os valores desta compra. Se o nome normalizado não existe, cria uma nova entrada.
- **Ao editar uma compra:** mesmo merge, aplicado sobre os itens da versão editada (o efeito é sempre aditivo — nunca remove uma marca que já estava no catálogo, mesmo que a edição tenha trocado o nome/marca do item).
- **Ao excluir uma compra:** o catálogo **não é alterado**. Itens/marcas que só existiam naquela compra continuam disponíveis para sugestão.
- **Cálculo:** função pura `atualizarCatalogoMercado(catalogoAtual: CatalogoItemMercado[], compra: CompraMercado): CatalogoItemMercado[]` em `src/lib/calculos-mercado.ts`, chamada pelo store logo após montar a compra (em `adicionarCompraMercado` e `editarCompraMercado`), antes de persistir.

## Formulário (`compra-form.tsx`)

- **Nome do item:** input de texto com sugestões via `<datalist>` nativo (`<input list="catalogo-nomes">`), populado com `nomeExibicao` de todas as entradas do catálogo. Sem dependência nova — o projeto não tem um componente de combobox, e datalist é suficiente para "digite e sugere, mas aceita texto livre".
- **Marca:** input de texto opcional, também com `<datalist>` — mas a lista de sugestões é filtrada pelo nome do item já digitado naquela linha (mostra só as marcas daquele item específico, vindas de `catalogoMercado.find(c => c.nomeNormalizado === normalizarNomeItem(nomeDigitado))?.marcas`).
- **Unidade:** `<select>` com as 5 opções fixas (un/kg/g/L/ml), default `"un"`.
- **Pré-preenchimento:** no evento `onBlur` do campo nome (usuário saiu do campo), se o nome digitado casa exatamente (após normalização) com uma entrada do catálogo, os campos `unidade` e `precoUnitario` daquela linha são sobrescritos com `ultimaUnidade`/`ultimoPreco` daquela entrada — regra simples e previsível: sempre que o nome bate com um item conhecido, os dois campos são preenchidos com o último valor usado, e o usuário edita por cima se precisar. Não há tentativa de detectar "o usuário já mexeu nesses campos" (evita ambiguidade de implementação). Isso só dispara para itens novos (a linha ainda não tinha um nome que já batia antes do blur), para não sobrescrever repetidamente um valor que o usuário acabou de digitar de propósito.

## Exibição (`compra-card.tsx`, `itens-comparacao.tsx`)

- `compra-card.tsx`: linha do item passa a mostrar `{quantidade} {unidade}` (ex.: "0,487 kg") em vez de `{quantidade}x`; se houver `marca`, exibida como texto secundário ao lado do nome (ex.: "Arroz (Camil)").
- `itens-comparacao.tsx`: sem mudança na lógica de agrupamento (continua por nome normalizado, ignorando marca). Opcionalmente pode mostrar a unidade ao lado do preço para dar contexto (ex.: "R$ 4,60/kg"), mas isso é polimento visual, não obrigatório para esta entrega.

## Backward Compatibility

- Compras já existentes em `data/fintrack.json` não têm `unidade`/`marca` nos itens. Ao ler dados antigos, itens sem `unidade` são tratados como `"un"` (default), e sem `marca` como `undefined` — igual ao padrão já usado para `comprasMercado` em si (Task 1 do módulo original).
- `catalogoMercado` ausente em arquivos antigos é normalizado para `[]`, seguindo o mesmo padrão de 3 pontos em `server.js` (`criarDadosNovos`, `carregarOuCriar`, `PUT /api/data`) e o fallback em `src/lib/storage.ts` usados para `comprasMercado`.
- Compras antigas (sem `unidade` gravada) que forem editadas vão popular o catálogo com `unidade: "un"` a partir daquele ponto — não há migração retroativa do catálogo a partir de compras nunca reabertas.

## Limitação Conhecida (documentada, não corrigida nesta entrega)

Se o mesmo item for comprado em unidades diferentes em meses diferentes (ex.: "tomate" em kg um mês, "tomate" em unidade no mês seguinte), o preço médio ponderado da comparação (RF-11) vai misturar as duas unidades como se fossem comensuráveis, produzindo um número sem sentido prático. Isso é uma extensão da limitação já aceita em DDR-002 (nomes digitados de forma inconsistente não são agrupados) — fica documentado aqui como um risco equivalente, aceito conscientemente, sem solução nesta entrega.

## Testes

Mesma convenção do módulo original (`implementado/mercado.md`): sem framework de testes automatizados neste projeto. Verificação via `npm run build` (tipos) + revisão de código com casos manuais traçados à mão (merge do catálogo com item novo, item repetido com marca nova, edição que muda o nome do item, exclusão que não deve alterar o catálogo).

## Arquivos Afetados (estimativa para a fase de planejamento)

| Arquivo | Ação |
|---|---|
| `src/types/index.ts` | Modificar — `UnidadeMedida`, `marca`/`unidade` em `ItemMercado`, `CatalogoItemMercado`, `catalogoMercado` em `DadosApp` |
| `src/lib/calculos-mercado.ts` | Modificar — nova função `atualizarCatalogoMercado` |
| `src/lib/storage.ts` | Modificar — default `catalogoMercado: []` |
| `server.js` | Modificar — default `catalogoMercado: []` nos mesmos 3 pontos de `comprasMercado` |
| `src/stores/useFinanceStore.ts` | Modificar — `adicionarCompraMercado`/`editarCompraMercado` também atualizam `catalogoMercado` |
| `src/components/mercado/compra-form.tsx` | Modificar — campos marca/unidade, datalists, pré-preenchimento |
| `src/components/mercado/compra-card.tsx` | Modificar — exibir unidade e marca |
| `implementado/mercado.md` | Modificar — documentar a extensão (novos RFs) |
| `docs/REQUISITOS.md` | Modificar — atualizar seção Mercado |
