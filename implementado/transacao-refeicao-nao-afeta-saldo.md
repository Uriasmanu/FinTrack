# Feature: Transações Conta Ticket — Aparecem no Extrato sem Afetar Saldo

## Status
Implementado

## Data
21/08/2026

## Contexto e Objetivo

- **O que é:** Transações em contas do tipo "ticket" devem aparecer no extrato mas não afetar o cálculo do saldo
- **Por que existe:** O extrato deve calcular somente transações de conta corrente. Transações de cartão ticket são informativas mas não impactam o saldo geral
- **Quem usa:** Usuários do FinTrack
- **Escopo:** `src/pages/Transacoes.tsx`

## Problema Resolvido

**Comportamento atual:** Transações em contas ticket eram completamente excluídas do extrato (não apareciam na lista).

**Comportamento esperado:** Transações em contas ticket devem aparecer visualmente no extrato, mas não devem somar/subtrair do saldo acumulado e saldo confirmado.

**Escopo:** `src/pages/Transacoes.tsx`

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Transacoes.tsx` | Removido filtro que excluía ticket de `transacoesFiltradas`. Adicionada exclusão de ticket no cálculo de `saldoAcumulado` e `saldoConfirmado` em `transacoesComSaldo` |

## Lógica Implementada

1. **`transacoesFiltradas`**: Transações de contas ticket agora são incluídas (antes eram excluídas com `if (ticketIds.includes(t.contaId)) return false;`)
2. **`transacoesComSaldo`**: Adicionada verificação `!ticketIds.includes(t.contaId)` para excluir ticket do cálculo de saldo
3. **`transacoesAnteriores`** e **`saldoConfirmadoAnterior`**: Mantida a exclusão de ticket (correto para saldo)

## Critérios de Aceite

- [x] CA-01: Dado que existe transação em conta ticket, quando o extrato é exibido, então a transação aparece na lista
- [x] CA-02: Dado que existe transação em conta ticket, quando o saldo acumulado é calculado, então o valor da transação não é somado/subtraído
- [x] CA-03: Dado que existe transação em conta ticket confirmada, quando o saldo confirmado é calculado, então o valor não é considerado
- [x] CA-04: Dado que existe transação em conta corrente, quando o extrato é exibido, então a transação afeta o saldo normalmente
