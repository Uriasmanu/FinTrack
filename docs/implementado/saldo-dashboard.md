# Implementado - Dashboard Saldo Total e Receitas vs Despesas

## Data: 04/08/2026

## 1. Contexto e Objetivo

- **O que é:** Cards do Dashboard exibem saldo de hoje e saldo do mês
- **Por que existe:** Saldo Total mostrava saldo projetado do mês, não o saldo real de hoje
- **Quem usa:** Usuário do FinTrack que visualiza o dashboard
- **Escopo:** Componentes SaldoCard e ReceitasDespesasCard

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/components/dashboard/saldo-card.tsx`
- `src/components/dashboard/receitas-despesas-card.tsx`

## 3. História do Usuário

```
Como usuário do FinTrack,
quero ver o saldo real de hoje no card Saldo Total,
para saber exatamente quanto tenho disponível agora.
```

## 4. Requisitos Funcionais

- [x] RF-01: Saldo Total exibe saldoReal de hoje (saldoInicial + transações até hoje)
- [x] RF-02: Receitas vs Despesas exibe 3 colunas: Receitas, Despesas e Saldo
- [x] RF-03: Saldo no card Receitas vs Despesas é receitas - despesas do mês

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/dashboard/saldo-card.tsx` | Modificar | Calcular saldo de hoje |
| `src/components/dashboard/receitas-despesas-card.tsx` | Modificar | Adicionar coluna Saldo |

## 6. Critérios de Aceite

- [x] CA-01: Dado que há transações até hoje, quando o dashboard é renderizado, então Saldo Total mostra o saldo real
- [x] CA-02: Dado que há receitas e despesas no mês, quando o dashboard é renderizado, então Receitas vs Despesas mostra 3 valores

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações nos arquivos
