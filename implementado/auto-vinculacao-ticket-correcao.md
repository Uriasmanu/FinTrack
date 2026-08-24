# Feature: Auto-vinculação Conta Ticket — Correção

## Status
Implementado

## Data
21/08/2026

## Contexto e Objetivo

- **O que é:** Remover a vinculação automática forçada da conta "ticket" ao selecionar categorias de Alimentação
- **Por que existe:** O usuário deve poder escolher livremente a conta para transações de Alimentação, Ticket ou VA/VR
- **Quem usa:** Usuários do FinTrack
- **Escopo:** `src/components/transacoes/transacao-form.tsx`

## Problema Resolvido

**Comportamento atual:** Ao selecionar categorias "Alimentação", "Ticket" ou "VA/VR", o formulário forçava automaticamente a seleção da conta do tipo "ticket". O usuário não podia escolher outra conta.

**Comportamento esperado:** O usuário deve poder escolher qualquer conta disponível, independentemente da categoria selecionada. A auto-vinculação não deve ocorrer.

**Escopo:** `src/components/transacoes/transacao-form.tsx` (linha 140-142)

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/transacoes/transacao-form.tsx` | Removido bloco de auto-vinculação forçada (linhas 140-142) |

## Funcionalidades Implementadas

- Removida a lógica que forçava `setValue("contaId", contaTicket.id)` quando a categoria era Alimentação, Ticket ou VA/VR
- Usuário agora pode selecionar qualquer conta independentemente da categoria

## Critérios de Aceite

- [x] CA-01: Dado que o usuário seleciona categoria "Alimentação", quando ele abre o seletor de contas, então todas as contas disponíveis são exibidas
- [x] CA-02: Dado que o usuário seleciona categoria "Ticket", quando ele escolhe uma conta, então a conta selecionada é mantida (não revertida para ticket)
- [x] CA-03: Dado que o usuário seleciona categoria "VA/VR", quando ele escolhe uma conta diferente de ticket, então a conta escolhida permanece selecionada
