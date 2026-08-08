# Implementado - Correções Dashboard (3 itens)

## Data: 08/08/2026

## 1. Contexto e Objetivo

- **O que é:** Três correções no dashboard: visual do card Receitas vs Despesas, Saldo Total filtrado por conta corrente, e textos dos gráficos legíveis no tema escuro
- **Por que existe:** Layout do card estava com 4 colunas em mobile (apertado), Saldo Total misturava todas as contas, e textos dos gráficos recharts apareciam pretos no fundo escuro
- **Quem usa:** Usuário do FinTrack
- **Escopo:** `src/components/dashboard/receitas-despesas-card.tsx`, `src/components/dashboard/saldo-card.tsx`, `src/pages/Graficos.tsx`

## 2. Requisitos Funcionais

- [x] RF-01: Card Receitas vs Despesas usa grid 2 cols mobile / 4 cols desktop
- [x] RF-02: SaldoCard filtra apenas contas corrente (exclui poupança, investimento, ticket)
- [x] RF-03: SaldoCard renomeado para "Saldo Conta Corrente"
- [x] RF-04: Textos de eixos X/Y, legendas e labels dos gráficos recharts usam muted-foreground

## 3. Critérios de Aceite

- [x] CA-01: Em mobile (375px), o card mostra 2 colunas; em desktop (1280px), 4 colunas
- [x] CA-02: Contas poupança não são incluídas no Saldo Conta Corrente
- [x] CA-03: No tema escuro, textos dos gráficos de barras e linhas são legíveis

## 4. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/dashboard/receitas-despesas-card.tsx` | Modificar | Grid ajustado para 2 cols mobile / 4 cols desktop |
| `src/components/dashboard/saldo-card.tsx` | Modificar | Filtro por contas corrente, renomeado para "Saldo Conta Corrente" |
| `src/pages/Graficos.tsx` | Modificar | Adicionado axisTextStyle com fill muted-foreground |
