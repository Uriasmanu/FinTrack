# Exclusão de Contas Ticket do Extrato

## Status
Aceito

## Data
20/08/2026

## Contexto
O saldo de contas do tipo "ticket" (mercado) era contabilizado no extrato bancário, gerando distorção nos saldos acumulados. O usuário esperava que o comportamento fosse o mesmo da poupança: contas ticket não deveriam impactar o saldo do extrato.

## Decisão
Excluir todas as transações associadas a contas do tipo "ticket" dos cálculos de saldo e da listagem do extrato, seguindo o mesmo padrão já aplicado para contas poupança.

## Alternativas consideradas

### Alternativa 1: Excluir apenas despesas de ticket (mesmo padrão da poupança)
- Prós: Consistência com o padrão existente
- Contras: Receitas de ticket continuariam impactando o saldo, o que não faz sentido para um campo "verbas de alimentação"

### Alternativa 2: Excluir todas as transações de ticket (escolhida)
- Prós: O saldo do extrato reflete apenas contas correntes e investimentos, que são as contas "reais" do usuário
- Contras: Transações de ticket ficam invisíveis no extrato (podem ser visualizadas na página de transações filtrando por conta)

## Consequências

### Positivas
- Saldo do extrato é mais preciso e reflete apenas o patrimônio financeiro real
- Comportamento consistente com a exclusão de poupança
- Contribuições de ticket (receitas) não distorcem o saldo acumulado

### Negativas
- Usuário não vê transações de ticket no extrato padrão (precisa usar filtros)

## Arquivos Afetados
- `src/pages/Transacoes.tsx` — Adicionadas exclusões para contas ticket em:
  - `contasFiltradas` (filtro de contas)
  - `ticketIds` (array de IDs para filtragem)
  - `transacoesAnteriores` (saldo anterior ao período)
  - `saldoConfirmadoAnterior` (saldo confirmado anterior)
  - `transacoesFiltradas` (lista de transações do extrato)

## Padrão Aplicado
Mesmo padrão da poupança:
- Contas ticket excluídas da lista de contas filtradas
- Array `ticketIds` criado para identificar transações de ticket
- Transações de ticket excluídas dos cálculos de saldo (anterior, confirmado e acumulado)
- Transações de ticket excluídas da listagem visual do extrato

## RF/CA Afetados
- Requisito de que o extrato reflita apenas saldos de contas correntes e investimentos
