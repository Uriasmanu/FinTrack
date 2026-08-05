# Implementado - Editar Formulário Sempre com Valor Original

## Data: 05/08/2026

## 1. Contexto e Objetivo

- **O que é:** Todas as funcionalidades de edição no FinTrack agora sempre carregam os valores originais do item sendo editado
- **Por que existe:** Quando o usuário abria o formulário de edição para um segundo item (sem fechar o diálogo), o formulário ainda exibia os valores do item anterior, pois o `useForm` do React Hook Form não sincronizava com as novas `initialData`
- **Quem usa:** Usuário do FinTrack que edita contas, categorias, cartões e metas
- **Escopo:** ContaForm, CategoriaForm, CartaoForm, MetaForm (já estava correto)

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature
- `src/components/contas/conta-form.tsx`
- `src/components/categorias/categoria-form.tsx`
- `src/components/cartoes/cartao-form.tsx`
- `src/components/metas/meta-form.tsx`

## 3. História do Usuário

```
Como usuário do FinTrack,
quero que ao clicar em "Editar" qualquer item, o formulário sempre traga os valores originais daquele item,
para que eu possa editar os dados corretos sem confusão.
```

## 4. Requisitos Funcionais

- [x] RF-01: Ao abrir edição de conta, o formulário exibe os valores originais da conta selecionada
- [x] RF-02: Ao abrir edição de categoria, o formulário exibe os valores originais da categoria selecionada
- [x] RF-03: Ao abrir edição de cartão, o formulário exibe os valores originais do cartão selecionado
- [x] RF-04: Ao abrir edição de meta, o formulário exibe os valores originais da meta selecionada (já funcionava)
- [x] RF-05: Ao alternar entre itens diferentes para editar sem fechar o diálogo, o formulário atualiza com os valores do novo item

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/contas/conta-form.tsx` | Modificar | Adicionar `useEffect` + `reset()` para sincronizar `initialData` |
| `src/components/categorias/categoria-form.tsx` | Modificar | Adicionar `useEffect` + `reset()` para sincronizar `initialData` |
| `src/components/cartoes/cartao-form.tsx` | Modificar | Adicionar `useEffect` + `reset()` para sincronizar `initialData` |

## 6. Problemas e Impedimentos

### 8.1 Problemas Técnicos

- Os formulários de edição em diálogo (ContaForm, CategoriaForm, CartaoForm) não chamavam `reset()` quando `initialData` mudava, fazendo com que o formulário mantivesse os valores do item anteriormente editado

### 8.2 Ambiguidades nos Requisitos

- Nenhuma

### 8.3 Riscos

- Baixo risco: mudança isolada nos formulários, sem impacto em lógica de negócio

## 7. Critérios de Aceite

- [x] CA-01: Dado que o usuário abre edição de uma conta, quando o formulário abre, então todos os campos exibem os valores originais da conta
- [x] CA-02: Dado que o usuário fecha o diálogo e abre edição de outra conta, quando o formulário abre, então exibe os valores da segunda conta (não da primeira)
- [x] CA-03: Dado que o usuário edita uma categoria, quando o formulário abre, então todos os campos exibem os valores originais da categoria
- [x] CA-04: Dado que o usuário edita um cartão, quando o formulário abre, então todos os campos exibem os valores originais do cartão
- [x] CA-05: Dado que o usuário edita uma meta, quando o formulário abre, então exibe os valores originais da meta (comportamento já existente mantido)

## 8. Plano de Implementação

```
Passo 1: Adicionar useEffect + reset() no ContaForm
  - O que fazer: Importar useEffect e adicionar efeito que chama reset() quando initialData muda
  - Arquivo(s): src/components/contas/conta-form.tsx
  - Como validar: Abrir diálogo de edição para conta A, fechar, abrir para conta B, verificar se campos mostram dados de B

Passo 2: Adicionar useEffect + reset() no CategoriaForm
  - O que fazer: Importar useEffect e adicionar efeito que chama reset() quando initialData muda
  - Arquivo(s): src/components/categorias/categoria-form.tsx
  - Como validar: Abrir diálogo de edição para categoria A, fechar, abrir para categoria B, verificar se campos mostram dados de B

Passo 3: Adicionar useEffect + reset() no CartaoForm
  - O que fazer: Importar useEffect e adicionar efeito que chama reset() quando initialData muda
  - Arquivo(s): src/components/cartoes/cartao-form.tsx
  - Como validar: Abrir diálogo de edição para cartão A, fechar, abrir para cartão B, verificar se campos mostram dados de B
```

## 9. Rollout e Observabilidade

- **Estratégia de entrega:** Deploy direto
- **Como monitorar:** Nenhum monitoramento específico necessário (correção de UI)
- **Plano de rollback:** Reverter alterações nos 3 arquivos de formulário