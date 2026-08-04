# Implementado - Correção: Transações Recorrentes no Mês Seguinte

## Data: 04/08/2026

## 1. Contexto e Objetivo

- **O que é:** Correção de bug no card "Próximas Transações" do Dashboard
- **Por que existe:** Transações recorrentes criadas para meses futuros não apareciam ao navegar para o mês seguinte
- **Quem usa:** Usuário do FinTrack que navega entre meses no Dashboard
- **Escopo:** Apenas o card "Próximas Transações" no Dashboard

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `docs/REQUISITOS.md` - Requisitos do sistema
- `src/components/dashboard/proximas-transacoes.tsx` - Componente com o bug
- `src/stores/useFinanceStore.ts` - Store com dados de transações

## 3. História do Usuário

```
Como usuário do FinTrack,
quero ver as transações recorrentes pendentes ao navegar para meses futuros,
para que eu possa planejar minhas finanças com antecedência.
```

**Cenários:**
- Cenário principal: Usuário cria transação recorrente (ex: aluguel dia 01) e navega para o próximo mês
- Cenário alternativo: Usuário vê o mês atual e transações passadas não aparecem (comportamento correto)

## 4. Requisitos Funcionais

- [x] RF-01: O card "Próximas Transações" exibe transações pendentes do mês selecionado
- [x] RF-02: Ao navegar para meses futuros, transações recorrentes com datas antes de hoje são exibidas
- [x] RF-03: Ao visualizar o mês atual, apenas transações com data >= hoje são exibidas
- [x] RF-04: Transações confirmadas (efetivadas) nunca aparecem no card

## 5. Requisitos Não-Funcionais

- **Performance:** Sem impacto - apenas lógica de filtro alterada
- **UI/UX:** Comportamento consistente com a expectativa do usuário

## 6. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/dashboard/proximas-transacoes.tsx` | Modificar | Corrigir lógica de filtro |

## 7. Critérios de Aceite

- [x] CA-01: Dado que há transação recorrente para Setembro (dia 01), quando o usuário navega para Setembro no Dashboard, então a transação aparece no card
- [x] CA-02: Dado que é o mês atual (Agosto), quando o usuário visualiza o Dashboard, então apenas transações com data >= hoje aparecem
- [x] CA-03: Dado que uma transação foi efetivada, quando o Dashboard é renderizado, então a transação não aparece no card

## 8. Plano de Implementação

```
Passo 1: Analisar o bug no filtro
  - O que fazer: Identificar que `t.data >= hojeStr` usa comparação de strings que falha para meses futuros
  - Arquivo(s): src/components/dashboard/proximas-transacoes.tsx
  - Como validar: Verificar que "2026-09-01" < "2026-08-04" em comparação de strings

Passo 2: Corrigir o filtro
  - O que fazer: Aplicar filtro de data apenas quando o mês selecionado é o mês atual
  - Arquivo(s): src/components/dashboard/proximas-transacoes.tsx
  - Como validar: Navegar para mês futuro e verificar que transações recorrentes aparecem
```

## 9. Rollout e Observabilidade

- **Estratégia:** Deploy direto (correção de bug simples)
- **Como monitorar:** Verificar que transações recorrentes aparecem ao navegar entre meses
- **Rollback:** Reverter alteração no componente

## 10. Definição de Pronto (DoD)

- [x] Todos os critérios de aceite foram verificados
- [x] Código revisado
- [x] Sem warnings ou erros não tratados
- [x] Seção "Histórico de Correções" em spec.md atualizada
