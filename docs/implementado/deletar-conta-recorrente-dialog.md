# Implementado - Deletar Conta com Transações Recorrentes Mostra Diálogo

## Data: 05/08/2026

## 1. Contexto e Objetivo

- **O que é:** Ao deletar uma conta que possui transações recorrentes vinculadas, o sistema mostra um diálogo explicando que as transações recorrentes também serão removidas
- **Por que existe:** Anteriormente, o sistema bloqueava a exclusão com um alert genérico sem explicar o que aconteceria com as transações recorrentes
- **Quem usa:** Usuário do FinTrack que gerencia contas bancárias
- **Escopo:** ContaCard.tsx

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/components/contas/conta-card.tsx`

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu tentar deletar uma conta que tem transações recorrentes,
quero que o sistema me explique o que acontecerá com essas transações,
para que eu possa tomar uma decisão informada.
```

## 4. Requisitos Funcionais

- [x] RF-01: Ao tentar deletar uma conta com transações recorrentes, o sistema deve mostrar um diálogo explicando que as transações recorrentes também serão removidas
- [x] RF-02: Ao tentar deletar uma conta sem transações recorrentes mas com outras transações, o comportamento permanece o mesmo (diálogo de confirmação normal)
- [x] RF-03: O alert() nativo foi substituído por um AlertDialog estilizado

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/contas/conta-card.tsx` | Modificar | Substituir alert por AlertDialog com informações sobre transações recorrentes |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário tenta deletar uma conta com transações recorrentes, quando o diálogo abre, então exibe mensagem explicando que as transações recorrentes serão removidas
- [x] CA-02: Dado que o usuário tenta deletar uma conta sem transações recorrentes, quando o diálogo abre, então exibe a mensagem padrão de confirmação
- [x] CA-03: Dado que o usuário confirma a exclusão, então a conta e todas as transações vinculadas são removidas

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações em ContaCard.tsx