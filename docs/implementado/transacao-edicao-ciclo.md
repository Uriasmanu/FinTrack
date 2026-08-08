# Implementado - Edição recorrente, gráfico Alimentação, subtipos

## Data: 08/08/2026

## 1. Contexto e Objetivo

- **O que é:** Três correções: (1) editar categoria de transação recorrente/parcelada pergunta se altera só essa ou todas, (2) Alimentação aparece no gráfico em vez de subtipos, (3) subtipos filtrados da lista de categorias
- **Por que existe:** Dialog de edição só触发ava para valor/data, gráfico ocultava Alimentação sob nomes de subtipos, subtipos poluíam a lista de categorias
- **Quem usa:** Usuário do FinTrack
- **Escopo:** `src/pages/EditarTransacao.tsx`, `src/pages/Graficos.tsx`, `src/components/transacoes/transacao-form.tsx`, `src/components/transacoes/transacao-item.tsx`

## 2. Requisitos Funcionais

- [x] RF-01: Editar categoria/subtipo de transação recorrente/parcelada mostra dialog "só esta / todas as seguintes"
- [x] RF-02: Opção "todas as seguintes" propaga mudança de categoria e subtipo para todas as transações do grupo
- [x] RF-03: Gráfico de despesas mostra "Alimentação" como categoria, não subtipos
- [x] RF-04: Subtipos (cat-016 a cat-019) não aparecem na lista de categorias do formulário
- [x] RF-05: Select de subtipo aparece apenas ao selecionar Alimentação

## 3. Critérios de Aceite

- [x] CA-01: Dado que editingo categoria de transação parcelada, quando confirmo, então pergunta "só esta ou todas"
- [x] CA-02: Dado que escolho "todas", quando salva, então todas as parcelas seguintes têm a nova categoria
- [x] CA-03: Dado que há transações de Alimentação com subtipo, quando o gráfico é exibido, então mostra "Alimentação" (não "Comida")
- [x] CA-04: Dado que tipo é "despesa", quando abre o select de categorias, então Limpeza/Comida/Besteira/Acougue não aparecem

## 4. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/EditarTransacao.tsx` | Modificar | Condição do dialog expandida, editarTodas propaga categoria/subtipo |
| `src/pages/Graficos.tsx` | Modificar | Remove lógica de subtipo, usa categoria pai |
| `src/components/transacoes/transacao-form.tsx` | Modificar | Filtra subtipos da lista, select de subtipo para Alimentação |
| `src/components/transacoes/transacao-item.tsx` | Modificar | Restaura exibição de subtipo |
