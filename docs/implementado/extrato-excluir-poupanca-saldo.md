# Implementado - Extrato Exclui Saldo de Conta Poupança

## Data: 05/08/2026

## 1. Contexto e Objetivo

- **O que é:** O saldo de contas poupança não é mais incluído no cálculo do saldo do extrato bancário
- **Por que existe:** Contas poupança não devem ser somadas no extrato, pois representam um tipo de conta diferente das contas correntes de uso diário
- **Quem usa:** Usuário do FinTrack que visualiza o extrato bancário
- **Escopo:** Transacoes.tsx

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/pages/Transacoes.tsx`

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu visualizo o extrato bancário,
quero que o saldo não inclua as contas poupança,
para que eu tenha uma visão mais clara do saldo disponível para uso diário.
```

## 4. Requisitos Funcionais

- [x] RF-01: O saldo inicial do extrato não inclui contas do tipo "poupanca"
- [x] RF-02: As transações de contas poupança não são incluídas no cálculo do saldo acumulado
- [x] RF-03: As transações de contas poupança não são exibidas na lista de transações do extrato
- [x] RF-04: O saldo confirmado (efetivado) também exclui contas poupança

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/Transacoes.tsx` | Modificar | Excluir contas poupanca de todos os cálculos de saldo e da lista de transações |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário visualiza o extrato com uma conta poupança cadastrada, quando o saldo é calculado, então a poupança não é incluída
- [x] CA-02: Dado que o usuário visualiza o extrato, quando as transações são listadas, então transações de poupança não aparecem
- [x] CA-03: Dado que o usuário filtra por uma conta específica que é poupança, quando o extrato é exibido, então as transações daquela conta não aparecem

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações em Transacoes.tsx