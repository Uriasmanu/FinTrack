# Implementado - Guardar no extrato e exclusão do cálculo

## Data: 08/08/2026

## 1. Contexto e Objetivo

- **O que é:** Transações de receita em contas poupança agora aparecem no extrato. Categoria Guardar (cat-014) é excluída do cálculo de salário-base das metas
- **Por que existe:** O filtro de poupança no Transacoes.tsx excluía TODAS as transações de poupança, impedindo que receitas (como dividendos) aparecessem. A categoria Guardar (tipo "ambos") estava inflando o salário-base indevidamente
- **Quem usa:** Usuário do FinTrack
- **Escopo:** `src/pages/Transacoes.tsx`, `src/components/metas/metas-predefinidas.tsx`

## 2. Requisitos Funcionais

- [x] RF-01: Transações de receita em contas poupança aparecem no extrato
- [x] RF-02: Transações de despesa em contas poupança continuam excluídas do extrato
- [x] RF-03: Categoria Guardar (cat-014) não é considerada no cálculo de salário das metas

## 3. Critérios de Aceite

- [x] CA-01: Dado que há uma receita de R$ 22 "dividendos" em conta poupança, quando o extrato é exibido, então a transação aparece
- [x] CA-02: Dado que há uma despesa de R$ 570 "Apartamento" em conta poupança, quando o extrato é exibido, então a transação NÃO aparece
- [x] CA-03: Dado que há receitas Guardar de R$ 150, quando a meta "Guardar por Mês" calcula salário-base, então R$ 150 NÃO é incluído

## 4. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/Transacoes.tsx` | Modificar | Filtro poupança: `poupancaIds.includes(t.contaId) && t.tipo === "despesa"` |
| `src/components/metas/metas-predefinidas.tsx` | Modificar | Excluir cat-014 de `categoriasReceita` |
