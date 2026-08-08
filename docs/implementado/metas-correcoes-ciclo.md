# Implementado - Correções nas Metas Padrão (4 itens)

## Data: 08/08/2026

## 1. Contexto e Objetivo

- **O que é:** Corrigir 4 problemas nas metas padrão: valores com mais de 2 casas decimais, Conta Fixa e Lazer usando % fixo em vez de despesas reais, e falta de alerta quando gasto extrapola o limite
- **Por que existe:** Os valores calculados tinham muitas casas decimais (ex: 1249,8000000000002), Conta Fixa e Lazer não consideravam despesas reais do mês, e o usuário não era alertado quando ultrapassava o limite
- **Quem usa:** Usuário do FinTrack que controla gastos fixos e de lazer
- **Escopo:** `src/components/metas/metas-predefinidas.tsx`, `src/components/metas/meta-card.tsx`

## 2. Requisitos Funcionais

- [x] RF-01: Valores alvo devem ser limitados a 2 casas decimais
- [x] RF-02: Conta Fixa deve exibir o total de despesas parceladas e recorrentes do mês atual
- [x] RF-03: Lazer deve exibir o total de despesas da categoria Lazer (cat-004) do mês atual
- [x] RF-04: Ambas devem exibir o percentual da receita (% do salário)
- [x] RF-05: Quando o gasto do mês ultrapassar o valor alvo, exibir alerta visual de extrapolação

## 3. Critérios de Aceite

- [x] CA-01: Dado que o salário é R$ 1.577, quando "Conta Fixa" é calculada, então valorAlvo = R$ 946,20 (2 casas decimais)
- [x] CA-02: Dado que há despesas recorrentes de R$ 1.249,80 no mês, quando "Conta Fixa" é exibida, então mostra "Gasto no mês: R$ 1.249,80"
- [x] CA-03: Dado que o gasto de R$ 1.249,80 > limite de R$ 946,20, quando o card é exibido, então mostra alerta "Extrapolou o limite"
- [x] CA-04: Dado que há despesas de lazer de R$ 45,80 no mês, quando "Lazer" é exibida, então mostra "Gasto no mês: R$ 45,80"
- [x] CA-05: Dado que o gasto de R$ 45,80 < limite de R$ 473,10, quando o card é exibido, então NÃO mostra alerta

## 4. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/metas/metas-predefinidas.tsx` | Modificar | Adicionar arredondar2, obterDespesasMesAtual, cálculo de extrapolou |
| `src/components/metas/meta-card.tsx` | Modificar | Adicionar valorGastoMes, extrapolou, alerta visual |
