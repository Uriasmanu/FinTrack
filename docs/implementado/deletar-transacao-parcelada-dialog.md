# Implementado - Excluir Transação Parcelada Mostra Diálogo com Opções

## Data: 05/08/2026

## 1. Contexto e Objetivo

- **O que é:** Ao excluir uma transação que faz parte de um grupo parcelado, o sistema exibe um diálogo perguntando se deseja excluir apenas esta parcela ou todas as parcelas seguintes
- **Por que existe:** Anteriormente, ao excluir uma transação parcelada, apenas aquela parcela era removida sem oferecer a opção de excluir as parcelas seguintes do mesmo grupo
- **Quem usa:** Usuário do FinTrack que gerencia transações parceladas
- **Escopo:** TransacaoItem.tsx

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/components/transacoes/transacao-item.tsx`
- `src/stores/useFinanceStore.ts` - excluirParcelasFuturas

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu tentar excluir uma transação que faz parte de um grupo parcelado,
quero que o sistema pergunte se desejo excluir apenas esta parcela ou todas as seguintes,
para que eu tenha controle sobre o que está sendo removido.
```

## 4. Requisitos Funcionais

- [x] RF-01: Ao excluir uma transação com grupoParcelaId, exibir diálogo com 3 opções: "Só esta", "Todas as seguintes", "Cancelar"
- [x] RF-02: Ao escolher "Só esta", excluir apenas a transação selecionada
- [x] RF-03: Ao escolher "Todas as seguintes", excluir a transação selecionada e todas as transações do mesmo grupo com data igual ou posterior
- [x] RF-04: Ao escolher "Cancelar", nenhuma exclusão é realizada
- [x] RF-05: Transações sem grupoParcelaId mantêm o diálogo de exclusão simples original

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/transacoes/transacao-item.tsx` | Modificar | Adicionar AlertDialog para exclusão de parcelas com 3 opções |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário exclui uma transação parcelada, quando o diálogo abre, então exibe 3 botões: "Só esta", "Todas as seguintes", "Cancelar"
- [x] CA-02: Dado que o usuário escolhe "Só esta", quando confirma, então apenas a transação selecionada é removida
- [x] CA-03: Dado que o usuário escolhe "Todas as seguintes", quando confirma, então a transação e todas as do mesmo grupo com data >= são removidas
- [x] CA-04: Dado que o usuário exclui uma transação não parcelada, quando o diálogo abre, então exibe o diálogo de confirmação simples original

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações em TransacaoItem.tsx
