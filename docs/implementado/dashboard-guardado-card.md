# Implementado - Percentual Guardado no Dashboard

## Data: 08/08/2026

## 1. Contexto e Objetivo

- **O que é:** Card "Receitas vs Despesas" no dashboard agora exibe coluna "Guardado" com valor total e percentual da receita
- **Por que existe:** O usuário queria ver nos gráficos quanto percentual da receita foi guardado (categoria Guardar)
- **Quem usa:** Usuário do FinTrack
- **Escopo:** `src/components/dashboard/receitas-despesas-card.tsx`

## 2. Requisitos Funcionais

- [x] RF-01: Card exibe coluna "Guardado" com ícone PiggyBank
- [x] RF-02: Exibe valor total de transações Guardar (cat-014) no mês
- [x] RF-03: Exibe percentual em relação às receitas do mês

## 3. Critérios de Aceite

- [x] CA-01: Dado que as receitas são R$ 1.577 e Guardar tem R$ 150, quando o card é exibido, então mostra "Guardado: R$ 150,00" e "9,5% da receita"
- [x] CA-02: Dado que não há transações Guardar no mês, quando o card é exibido, então mostra "Guardado: R$ 0,00" e "0,0% da receita"
- [x] CA-03: Layout responsivo — coluna aparece em grid 4 colunas (desktop) e 2 colunas (mobile)

## 4. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/dashboard/receitas-despesas-card.tsx` | Modificar | Adicionar coluna Guardado com PiggyBank, cálculo de guardarMes e percentualGuardado |
