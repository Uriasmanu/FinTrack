# Metas - Correção da Visibilidade de Contas no Formulário

**Status:** Implementado
**Data:** 18/08/2026

---

## 1. Contexto e Objetivo

- **O que é:** Correção de bug no formulário de criar/editar metas que impedia a exibição correta das contas cadastradas no dropdown "Conta bancária para monitorar"
- **Por que existe:** Usuários não conseguiam selecionar contas ao criar ou editar metas personalizadas, comprometendo a funcionalidade de progresso baseado em saldo de conta
- **Quem usa:** Usuários do FinTrack que criam ou editam metas personalizadas
- **Escopo:** Correção de 3 bugs encadeados nos componentes `meta-card.tsx`, `metas-predefinidas.tsx` e `meta-form.tsx`

---

## 2. História de Usuario

```
Como usuário do FinTrack,
quero editar ou criar uma meta personalizada e selecionar a conta bancária para monitorar,
para que o progresso da meta seja calculado com base no saldo real da conta selecionada.
```

**Cenários alternativos:**
- Usuário edita uma meta padrão (ex: "Viver de Renda") → deve ver checkboxes de categorias de receita, NÃO o dropdown de contas
- Usuário não tem contas cadastradas → deve ver mensagem orientando a cadastrar em "Contas"
- Usuário clica em "Editar" de uma meta padrão no card → o formulário deve abrir no modo correto (padrão)

---

## 3. Problemas Encontrados (Causa Raiz)

### Bug 1: `meta-card.tsx:85` — Propriedade inexistente `meta.type`

**Comportamento atual:** Ao clicar "Editar" no dropdown de um MetaCard, a chamada `onEditar(meta.id, undefined, undefined, meta.type)` usa `meta.type` que não existe na interface `Meta` (a propriedade correta é `meta.tipo`). Isso faz `metaType` ser sempre `undefined`.

**Comportamento esperado:** Deveria usar `meta.tipo` para passar o tipo correto da meta ("padrao" | "personalizado").

### Bug 2: `metas-predefinidas.tsx:207` — `metaType` não é passado

**Comportamento atual:** Ao editar uma meta padrão a partir do MetasPredefinidas, a chamada `onEditar(id, overrides, meta.nome)` não passa o 4º argumento `metaType`, deixando-o como `undefined`.

**Comportamento esperado:** Deveria passar `metaType="padrao"` para que o formulário saiba que é uma meta padrão.

### Bug 3: `meta-form.tsx:59` — Lógica `isPersonalizado` incorreta

**Comportamento atual:** A condição `const isPersonalizado = metaType === "personalizado" || (!metaName && !metaType)` avalia como `true` quando `metaType` é `undefined` e `metaName` é definido (edição de meta padrão). Isso faz o formulário mostrar o dropdown de contas em vez dos checkboxes de categorias de receita.

**Comportamento esperado:** Deveria mostrar checkboxes quando `metaType === "padrao"`, e dropdown de contas quando `metaType === "personalizado"` ou quando é uma criação nova.

### Bug 4: `meta-form.tsx:209` — `conta.nome` não existe

**Comportamento atual:** O código renderiza `{conta.nome}` mas a interface `Conta` não tem campo `nome` — apenas `banco`.

**Comportamento esperado:** Deveria renderizar `{conta.banco}`.

---

## 4. Requisitos Funcionais

- [x] RF-01: O formulário de criar meta personalizada exibe o dropdown "Conta bancária para monitorar" com todas as contas cadastradas
- [x] RF-02: O formulário de editar meta padrão exibe os checkboxes de "Receitas base para cálculo" (não o dropdown de contas)
- [x] RF-03: O dropdown de contas mostra o nome do banco (`conta.banco`) de cada conta
- [x] RF-04: Ao editar uma meta padrão a partir do card, o formulário abre no modo correto
- [x] RF-05: Ao criar uma nova meta personalizada, o formulário abre com o dropdown de contas

---

## 5. Requisitos Nao-Funcionais

- **Compatibilidade:** Funciona em todos os breakpoints (desktop, notebook, tablet, mobile)
- **Observabilidade:** Sem mudanças em logs ou métricas

---

## 6. Arquivos Envolvidos

| Arquivo | Acao | Razao |
|---|---|---|
| `src/components/metas/meta-card.tsx` | Modificar | Corrigir `meta.type` para `meta.tipo` |
| `src/components/metas/metas-predefinidas.tsx` | Modificar | Passar `metaType="padrao"` no `onEditar` e atualizar interface |
| `src/components/metas/meta-form.tsx` | Modificar | Corrigir lógica `isPersonalizado` e `conta.nome` para `conta.banco` |

---

## 7. Criterios de Aceite

- [x] CA-01: dado que existem contas cadastradas, quando o usuário abre o formulário de nova meta personalizada, então o dropdown "Conta bancária para monitorar" exibe todas as contas com o nome do banco
- [x] CA-02: dado que o usuário clica "Editar" em uma meta padrão, quando o formulário abre, então são exibidos os checkboxes de categorias de receita (não o dropdown de contas)
- [x] CA-03: dado que o usuário clica "Editar" em uma meta personalizada, quando o formulário abre, então o dropdown de contas é exibido com a conta vinculada selecionada
- [x] CA-04: dado que não existem contas cadastradas, quando o usuário abre o formulário de meta personalizada, então é exibida a mensagem "Cadastre uma conta bancária primeiro em Contas"

---

## 8. Plano de Implementacao

```
Passo 1: Corrigir meta-card.tsx — usar meta.tipo ao invés de meta.type
  - O que fazer: Na linha 85, trocar `meta.type` por `meta.tipo`
  - Arquivo: src/components/metas/meta-card.tsx
  - Como validar: Editar uma meta padrão a partir do card → formulário deve abrir no modo correto

Passo 2: Corrigir metas-predefinidas.tsx — passar metaType="padrao"
  - O que fazer: Atualizar interface MetasPredefinidasProps para incluir metaType no callback, e passar metaType="padrao" nas chamadas onEditar
  - Arquivo: src/components/metas/metas-predefinidas.tsx
  - Como validar: Editar uma meta padrão → formulário abre com checkboxes

Passo 3: Corrigir meta-form.tsx — lógica isPersonalizado e conta.nome
  - O que fazer: Alterar a condição isPersonalizado para verificar explicitamente `metaType === "padrao"` para a branch de checkboxes. Trocar `conta.nome` por `conta.banco` na linha 209
  - Arquivo: src/components/metas/meta-form.tsx
  - Como validar: Criar nova meta personalizada → dropdown de contas aparece; Editar meta padrão → checkboxes aparecem
```

---

## 9. Rollout e Observabilidade

- **Estratégia de entrega:** Deploy direto (correção de bug, sem feature flag)
- **Como monitorar:** Verificar que o formulário de metas abre corretamente nos dois modos
- **Plano de rollback:** Reverter os 3 arquivos para versão anterior

---

## 10. Definição de Pronto

- [x] Todos os critérios de aceite foram verificados
- [x] Código revisado (auto-revisão documentada)
- [x] Sem warnings ou erros não tratados introduzidos

---

## 11. DDR — Design Decision Record

### DDR-001 - Correção do fluxo de edição de metas

**Status:** Aceito
**Data:** 18/08/2026

**Contexto:** O formulário de metas não exibia as contas cadastradas ao criar/editar metas personalizadas, e mostrava dropdown de contas ao invés de checkboxes ao editar metas padrão. A causa raiz era uma combinação de 3 bugs: propriedade inexistente (`meta.type`), parâmetro não passado (`metaType`), e lógica condicional incorreta.

**Decisão:** Corrigir os 3 componentes encadeadamente, mantendo o padrão existente de passar `metaType` como parâmetro.

**Alternativas consideradas:**
- *Refatorar para usar `meta.tipo` diretamente no form:* Requereria mudanças maiores e não resolve o caso de criação nova (onde `metaType` é passado explicitamente).

**Consequências:**
- Positivas: Correção mínima e cirúrgica, sem risco de regressão
- Negativas: Nenhuma
