# Implementado - Converter Transação Única para Recorrente/Parcelada

## Data: 04/08/2026

## 1. Contexto e Objetivo

- **O que é:** Geração automática de transações futuras ao converter única para recorrente/parcelada
- **Por que existe:** Transações alteradas de únicas para recorrentes não apareciam nos próximos meses
- **Quem usa:** Usuário do FinTrack que edita transações
- **Escopo:** Página EditarTransacao.tsx

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/pages/EditarTransacao.tsx` - Página de edição
- `src/stores/useFinanceStore.ts` - Store com ações de transação

## 3. História do Usuário

```
Como usuário do FinTrack,
quero alterar uma transação de única para recorrente,
para que ela apareça nos próximos meses automaticamente.
```

## 4. Requisitos Funcionais

- [x] RF-01: Ao alterar tipoRecorrencia de "unica" para "recorrente", transações futuras são geradas
- [x] RF-02: Ao alterar tipoRecorrencia de "unica" para "parcelado", parcelas futuras são geradas
- [x] RF-03: A transação original é excluída e substituída pelo grupo de transações

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/EditarTransacao.tsx` | Modificar | Detectar mudança de tipo e gerar transações |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário altera uma transação única para recorrente, quando salva, então transações para os próximos 12 meses são geradas
- [x] CA-02: Dado que o usuário altera uma transação única para parcelada, quando salva, então as parcelas são geradas

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alteração no arquivo
