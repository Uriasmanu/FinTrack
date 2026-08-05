# Implementado - Extrato Indica se Transação é Recorrente ou Única

## Data: 05/08/2026

## 1. Contexto e Objetivo

- **O que é:** O extrato agora exibe um badge e ícone indicando se cada transação é recorrente, parcelada ou única
- **Por que existe:** Anteriormente, não havia nenhuma indicação visual no extrato sobre o tipo de recorrência de cada transação
- **Quem usa:** Usuário do FinTrack que visualiza o extrato bancário
- **Escopo:** TransacaoItem.tsx

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/components/transacoes/transacao-item.tsx`

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu visualizo o extrato bancário,
quero saber se cada transação é recorrente, parcelada ou única,
para que eu possa entender melhor meu fluxo de gastos e receitas.
```

## 4. Requisitos Funcionais

- [x] RF-01: Transações recorrentes exibem um badge "Recorrente" e o ícone RefreshCw
- [x] RF-02: Transações parceladas exibem um badge "Parcelado" e o ícone Repeat
- [x] RF-03: Transações únicas exibem um badge "Única" com variante outline

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/transacoes/transacao-item.tsx` | Modificar | Adicionar badge de recorrência e ícone Repeat para parceladas |

## 6. Critérios de Aceite

- [x] CA-01: Dado que uma transação é recorrente, quando exibida no extrato, então mostra badge "Recorrente" e ícone RefreshCw
- [x] CA-02: Dado que uma transação é parcelada, quando exibida no extrato, então mostra badge "Parcelado" e ícone Repeat
- [x] CA-03: Dado que uma transação é única, quando exibida no extrato, então mostra badge "Única" com variante outline

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações em TransacaoItem.tsx