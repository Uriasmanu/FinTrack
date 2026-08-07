# Implementado - Transações Recorrentes com Intervalo Personalizado

## Data: 05/08/2026

## 1. Contexto e Objetivo

- **O que é:** Transações recorrentes agora podem ser configuradas para se repetir em intervalos personalizados em dias (ex: a cada 25 dias), além do padrão mensal
- **Por que existe:** Anteriormente, transações recorrentes só podiam ser configuradas para repetir mensalmente na mesma data. O usuário precisava de flexibilidade para intervalos diferentes
- **Quem usa:** Usuário do FinTrack que possui despesas/receitas com periodicidade não mensal (ex: boleto a cada 25 dias)
- **Escopo:** types/index.ts, lib/transacoes.ts, TransacaoForm.tsx, NovaTransacao.tsx, EditarTransacao.tsx, useFinanceStore.ts

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/types/index.ts` - TipoRecorrencia
- `src/lib/transacoes.ts` - criarTransacoesRecorrentes
- `src/components/transacoes/transacao-form.tsx`
- `src/pages/NovaTransacao.tsx`
- `src/pages/EditarTransacao.tsx`
- `src/stores/useFinanceStore.ts`

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu cadastrar uma transação recorrente com periodicidade personalizada,
quero poder definir o intervalo em dias (ex: a cada 25 dias),
para que o sistema gere as transações automaticamente com a frequência correta.
```

## 4. Requisitos Funcionais

- [x] RF-01: O tipo "recorrente_personalizado" é adicionado ao TipoRecorrencia
- [x] RF-02: O campo `intervaloDias` é adicionado à interface Transacao (number | null)
- [x] RF-03: Ao selecionar "Recorrente (personalizado)" no formulário, exibir campo "Repetir a cada (dias)"
- [x] RF-04: A função criarTransacoesRecorrentes gera transações com base no intervalo em dias ao invés de mensalmente
- [x] RF-05: Transações com tipo "recorrente_personalizado" exibem o ícone de recorrência e badge "Recorrente" no extrato

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/types/index.ts` | Modificar | Adicionar "recorrente_personalizado" ao TipoRecorrencia e `intervaloDias` à Transacao |
| `src/lib/transacoes.ts` | Modificar | Adicionar caso "recorrente_personalizado" em criarTransacoesRecorrentes com geração por intervalo de dias |
| `src/components/transacoes/transacao-form.tsx` | Modificar | Adicionar opção no Select e campo de intervalo em dias |
| `src/pages/NovaTransacao.tsx` | Modificar | Adicionar "recorrente_personalizado" ao tipo do handleSubmit |
| `src/pages/EditarTransacao.tsx` | Modificar | Adicionar "recorrente_personalizado" ao tipo do handleSubmit e isRecorrente |
| `src/stores/useFinanceStore.ts` | Modificar | Passar intervaloDias na chamada criarTransacoesRecorrentes |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário seleciona "Recorrente (personalizado)", quando o formulário renderiza, então exibe campo numérico "Repetir a cada (dias)"
- [x] CA-02: Dado que o usuário define intervalo de 25 dias, quando a transação é salva, então são geradas transações a cada 25 dias por 12 meses
- [x] CA-03: Dado que o intervalo não é informado, quando salva, então usa 30 dias como padrão
- [x] CA-04: Transações com tipo "recorrente_personalizado" exibem ícone de recorrência no extrato

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações nos arquivos modificados
