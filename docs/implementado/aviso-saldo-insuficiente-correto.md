# Implementado - Aviso de Saldo Insuficiente Corrigido no Extrato

## Data: 05/08/2026

## 1. Contexto e Objetivo

- **O que é:** O aviso de saldo insuficiente no formulário de transação agora considera corretamente o valor previsto de estar na conta no fim do dia
- **Por que existe:** Ao editar uma transação existente, o cálculo do saldo após a transação não considerava o valor original da transação sendo editada, resultando em um saldo previsto incorreto
- **Quem usa:** Usuário do FinTrack que cria ou edita transações no extrato
- **Escopo:** TransacaoForm.tsx

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/components/transacoes/transacao-form.tsx`
- `src/stores/useFinanceStore.ts`

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu estiver editando uma transação existente,
quero que o aviso de saldo insuficiente mostre corretamente o saldo previsto no fim do dia,
para que eu possa tomar decisões informadas sobre meus gastos.
```

## 4. Requisitos Funcionais

- [x] RF-01: Ao editar uma transação de despesa, o saldo previsto após a transação deve descontar o valor original da transação antes de aplicar o novo valor
- [x] RF-02: Ao editar uma transação de receita, o saldo previsto após a transação deve adicionar o valor original da transação antes de aplicar o novo valor
- [x] RF-03: Ao criar uma nova transação, o cálculo do saldo previsto permanece inalterado

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/transacoes/transacao-form.tsx` | Modificar | Ajustar cálculo de saldoAposTransacao para edição |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário está editando uma despesa de 100 para 200, quando o formulário calcula o saldo previsto, então o saldo original de 100 é restaurado antes de subtrair 200
- [x] CA-02: Dado que o usuário está criando uma nova despesa, quando o formulário calcula o saldo previsto, então o cálculo permanece correto (subtrai o novo valor do saldo atual)
- [x] CA-03: Dado que o usuário está editando uma receita, quando o formulário calcula o saldo previsto, então o saldo original da receita é restaurado antes de aplicar o novo valor

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações em TransacaoForm.tsx