# Implementado - Progresso e Breakdown nas Metas Padrão

## Data: 08/08/2026

## 1. Contexto e Objetivo

- **O que é:** Cards das metas padrão agora exibem o breakdown da receita base do cálculo e calculam o progresso com base em dados reais (saldo poupança, despesas do mês, transações de guardar)
- **Por que existe:** O progresso sempre mostrava 0% porque usava `meta.valorAtual` que nunca era atualizado. O usuário queria ver de onde vinham os valores do salário e quanto já tinha acumulado/gasto em relação à meta
- **Quem usa:** Usuário do FinTrack que controla metas financeiras
- **Escopo:** `src/components/metas/metas-predefinidas.tsx`, `src/components/metas/meta-card.tsx`

## 2. Requisitos Funcionais

- [x] RF-01: Card exibe breakdown da receita base com badges (ex: "Salário: R$ 1.177", "Investimentos: R$ 400")
- [x] RF-02: "Reserva de Emergência" e "Viver de Renda" calculam progresso com saldo de contas tipo poupança
- [x] RF-03: "Guardar por Mês" calcula progresso com soma de transações da categoria Guardar (cat-014) no mês
- [x] RF-04: "Conta Fixa" e "Lazer" calculam progresso com despesas reais do mês vs valor alvo
- [x] RF-05: Progresso de Conta Fixa/Lazer é invertido (gastar mais = mais perto do limite), com max 100%

## 3. Critérios de Aceite

- [x] CA-01: Dado que o salário é R$ 1.177 e investimentos R$ 400, quando o card é exibido, então mostra badges "Salário: R$ 1.177" e "Investimentos: R$ 400"
- [x] CA-02: Dado que há R$ 5.000 em contas poupança e a meta de Reserva é R$ 9.462, quando o card é exibido, então progresso = 52,8%
- [x] CA-03: Dado que foram guardados R$ 150 no mês e a meta é R$ 157,70, quando o card é exibido, então progresso = 95,1%
- [x] CA-04: Dado que o gasto de lazer é R$ 45,80 e o limite é R$ 473,10, quando o card é exibido, então progresso = 9,7%

## 4. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/metas/metas-predefinidas.tsx` | Modificar | Adicionar obterBreakdownReceita, obterSaldoPoupanca, obterValorGuardadoMes, valorAtualCalculado |
| `src/components/metas/meta-card.tsx` | Modificar | Aceitar breakdown e valorAtualCalculado, exibir badges e usar valorAtualCalculado no progresso |
