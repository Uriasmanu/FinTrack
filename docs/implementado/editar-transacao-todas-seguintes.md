# Implementado - Editar "Todas as Seguintes" em Transação Recorrente/Parcelada

## Data: 07/08/2026

## 1. Contexto e Objetivo

- **O que é:** Ao editar uma transação recorrente/parcelada e escolher "Todas as seguintes" no dialog, a transação selecionada e todas as transações futuras do mesmo `grupoParcelaId` passam a ser editadas com o novo valor e data
- **Por que existe:** A opção "Todas as seguintes" não aplicava nenhuma alteração: a função `editarTodas` sombreava a variável `dados` do store com os dados do formulário (sem campo `transacoes`), resultando em grupo vazio; e as chamadas assíncronas em loop sem `await` faziam o estado final conter apenas a última operação (race condition)
- **Quem usa:** Usuário do FinTrack que edita transações recorrentes ou parceladas
- **Escopo:** `src/pages/EditarTransacao.tsx`

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/pages/EditarTransacao.tsx`
- `src/stores/useFinanceStore.ts`
- `src/lib/transacoes.ts`

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu edito uma transação recorrente/parcelada e escolho "Todas as seguintes",
quero que a transação que eu escolhi e todas as futuras do mesmo grupo sejam editadas,
para que o valor/vencimento se atualizem em toda a série sem eu precisar editar uma a uma.
```

## 4. Requisitos Funcionais

- [x] RF-01: Ao escolher "Todas as seguintes", o sistema deve editar a transação selecionada e todas as transações do mesmo `grupoParcelaId` com data igual ou posterior à selecionada
- [x] RF-02: O novo valor deve ser aplicado a todas as ocorrências do grupo a partir da selecionada
- [x] RF-03: Se a data for alterada, o sistema deve deslocar as datas das ocorrências futuras pelo mesmo offset de dias, preservando o intervalo entre elas
- [x] RF-04: O `grupoParcelaId` e demais dados individuais (descrição, confirmada, etc.) de cada ocorrência devem ser preservados
- [x] RF-05: As operações em loop devem ser aguardadas (await) para evitar perda de alterações por race condition

## 5. Requisitos Não-Funcionais

- **Performance:** Operações de edição em grupo devem persistir cada ocorrência de forma sequencial e confiável
- **Consistência:** O estado final após "Todas as seguintes" deve refletir todas as ocorrências editadas, sem perdas

## 6. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/EditarTransacao.tsx` | Modificar | Corrigir `editarTodas` para editar a ocorrência atual + futuras; aguardar chamadas assíncronas em loop |

## 7. Problemas e Impedimentos

### 7.1 Problemas Técnicos

- Sombra de variável: `const dados = data` dentro de `editarTodas` escondia o store `dados`, tornando o filtro do grupo sempre vazio
- Race condition: `editarTransacao`/`excluirTransacao` são assíncronas e lêem `get().dados` no início; chamadas em loop sem `await` fazem todas lerem o estado original e o último `set` sobrescrever os demais
- O mesmo padrão de loop sem `await` existia no fluxo `mudouParaUnica` (exclusão dos irmãos do grupo), que também perdia alterações

### 7.2 Ambiguidades nos Requisitos

- Nenhuma

### 7.3 Riscos

- Baixo risco: mudança isolada no fluxo de edição de transações recorrentes/parceladas

## 8. Critérios de Aceite

- [x] CA-01: Dado que o usuário edita uma transação recorrente com valor alterado e escolhe "Todas as seguintes", quando salva, então a transação selecionada e todas as futuras do grupo ficam com o novo valor
- [x] CA-02: Dado que o usuário altera a data de uma ocorrência e escolhe "Todas as seguintes", quando salva, então todas as ocorrências futuras são deslocadas pelo mesmo número de dias
- [x] CA-03: Dado que o usuário escolhe "Só esta", quando salva, então apenas a transação selecionada é alterada (comportamento existente preservado)
- [x] CA-04: Dado que o usuário converte uma recorrência para "única", quando salva, então todas as ocorrências do grupo são excluídas (persistência confiável sem race condition)

## 9. Plano de Implementação

```
Passo 1: Reescrever editarTodas
  - O que fazer: Usar o store dados (sem sombrear), filtrar grupo com data >= ocorrência atual, calcular offset de dias e aplicar valor + data via editarTransacao aguardando cada chamada
  - Arquivo(s): src/pages/EditarTransacao.tsx
  - Como validar: Editar recorrência, mudar valor, escolher "Todas as seguintes" e conferir extrato

Passo 2: Corrigir race condition no fluxo mudouParaUnica
  - O que fazer: Tornar handleSubmit async e aguardar cada excluirTransacao antes de editar a atual
  - Arquivo(s): src/pages/EditarTransacao.tsx
  - Como validar: Converter recorrência para única e conferir que todas as outras ocorrências foram excluídas
```

## 10. Rollout e Observabilidade

- **Estratégia de entrega:** Deploy direto
- **Como monitorar:** Inspeção visual do extrato após edição em grupo
- **Plano de rollback:** Reverter alterações em `EditarTransacao.tsx`
