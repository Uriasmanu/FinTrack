# Implementado - Converter Recorrente para Única Apaga Transações de Outros Meses

## Data: 05/08/2026

## 1. Contexto e Objetivo

- **O que é:** Ao converter uma transação recorrente/parcelada para única, todas as transações geradas nos outros meses são automaticamente apagadas
- **Por que existe:** Quando o usuário muda o tipo de recorrência de "recorrente"/"parcelado" para "única", as transações futuras geradas pelo sistema deveriam ser removidas, mas não eram
- **Quem usa:** Usuário do FinTrack que edita transações recorrentes
- **Escopo:** EditarTransacao.tsx

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/pages/EditarTransacao.tsx`
- `src/stores/useFinanceStore.ts`

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu converter uma transação recorrente para única,
quero que todas as transações geradas nos outros meses sejam apagadas automaticamente,
para que eu não tenha transações duplicadas ou órfãs.
```

## 4. Requisitos Funcionais

- [x] RF-01: Ao mudar tipoRecorrencia de "recorrente" ou "parcelado" para "única", o sistema deve excluir todas as transações do grupo recorrente, exceto a atual
- [x] RF-02: A transação atual deve ser convertida para "única" (grupoParcelaId removido)
- [x] RF-03: As transações excluídas devem ser removidas do store e do localStorage

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/EditarTransacao.tsx` | Modificar | Adicionar lógica de conversão recorrente → única |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário edita uma transação recorrente e muda o tipo para "única", quando salva, então todas as outras transações do grupo são apagadas
- [x] CA-02: Dado que o usuário converte para única, quando a lista de transações é atualizada, então apenas a transação atual permanece
- [x] CA-03: Dado que o usuário converte para única, a transação atual mantém seus dados mas perde o grupoParcelaId

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações em EditarTransacao.tsx