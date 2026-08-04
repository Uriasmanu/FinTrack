# Implementado - Correções de Bugs

## Data: 03/08/2026

## Problemas Corrigidos

### 1. Tela em branco ao clicar em "Nova Transação"

**Problema:** As rotas `/transacoes/nova` e `/transacoes/:id` não estavam definidas no App.tsx.

**Solução:** Adicionadas rotas e imports das páginas NovaTransacao e EditarTransacao.

**Arquivos modificados:** `src/App.tsx`

### 2. Tema escuro não persiste ao recarregar

**Problema:** A preferência de tema não era salva no JSON.

**Solução:** Temo é persistido no JSON via `atualizarConfig` e carregado na inicialização.

**Arquivos modificados:** `src/components/layout/layout.tsx`

### 3. Botão "Nova Transação" habilitado sem contas

**Problema:** Botão estava sempre habilitado, mesmo sem contas cadastradas.

**Solução:** Verificação `temContas` e card de aviso com link para cadastrar conta.

**Arquivos modificados:** `src/pages/Transacoes.tsx`

### 4. Campo "nome" no formulário de contas

**Problema:** Campo "nome" era desnecessário no formulário de contas.

**Solução:** Campo "nome" removido completamente do código (interface, formulário, card e referências).

**Arquivos modificados:** `src/types/index.ts`, `src/components/contas/conta-form.tsx`, `src/components/contas/conta-card.tsx`, `src/components/transacoes/filtros.tsx`, `src/components/transacoes/transacao-form.tsx`, `src/components/transacoes/transacao-item.tsx`

### 5. Confirmação antes de excluir

**Problema:** Verificar se todas as exclusões possuem confirmação.

**Solução:** Substituído `confirm()` nativo por `AlertDialog` do shadcn/ui em todos os componentes de exclusão.

**Arquivos modificados:** `src/components/cartoes/cartao-card.tsx`, `src/components/contas/conta-card.tsx`, `src/components/categorias/categoria-card.tsx`, `src/components/metas/meta-card.tsx`, `src/components/transacoes/transacao-item.tsx`, `src/components/ui/delete-confirm-dialog.tsx`, `src/components/ui/alert-dialog.tsx`

### 6. Tipo de conta "ticket"

**Problema:** Não existia tipo de conta para compras no mercado.

**Solução:** Adicionado tipo "ticket" na interface TipoConta e no formulário de contas.

**Arquivos modificados:** `src/types/index.ts`, `src/components/contas/conta-form.tsx`, `src/components/contas/conta-card.tsx`, `src/pages/Contas.tsx`

### 7. Categoria de receita "Ticket"

**Problema:** Não existia categoria de receita para ticket.

**Solução:** Adicionada categoria "Ticket" (id: cat-009) no arquivo de categorias default.

**Arquivos modificados:** `src/data/categorias-default.json`

### 8. Extrato com saldo por data

**Problema:** Extrato mostrava todas as transações sem agrupamento por data.

**Solução:** Transações são agrupadas por data, com saldo acumulado exibido ao final de cada dia.

**Arquivos modificados:** `src/pages/Transacoes.tsx`

### 9. Conta ticket como padrão para alimentação

**Problema:** Ao cadastrar transação de alimentação, não havia seleção automática da conta.

**Solução:** Ao selecionar categoria "Alimentação", conta do tipo "ticket" é selecionada automaticamente.

**Arquivos modificados:** `src/components/transacoes/transacao-form.tsx`

### 10. Metas baseadas no salário

**Problema:** Metas padrão não calculavam valores com base no salário.

**Solução:** Metas calculam `valorAlvo` e `parcelaMensal` com base nas transações de receita da categoria "Salário" e multiplicadores da configuração.

**Arquivos modificados:** `src/components/metas/metas-predefinidas.tsx`

### 11. Campo "confirmada" na transação

**Problema:** Não havia opção para marcar se transação foi efetivada.

**Solução:** Adicionado campo `confirmada: boolean` na interface Transacao, no formulário e no card de exibição.

**Arquivos modificados:** `src/types/index.ts`, `src/components/transacoes/transacao-form.tsx`, `src/components/transacoes/transacao-item.tsx`, `src/pages/NovaTransacao.tsx`, `src/pages/EditarTransacao.tsx`, `src/lib/transacoes.ts`

## DDR (Design Decision Record)

### DDR-001 - Persistência de Tema

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** O usuário deve ter sua preferência de tema persistida entre sessões.
**Decisão:** Utilizar apenas o JSON anual para persistir o tema via `atualizarConfig({ tema })`.

### DDR-002 - Validação de Contas antes de Transações

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** Usuário precisa ter pelo menos 1 conta cadastrada para criar transações.
**Decisão:** Desabilitar botão "Nova Transação" e exibir card de aviso quando não há contas.

### DDR-003 - Campo Nome Removido de Contas

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** Campo "nome" no formulário de contas era redundante com o campo "banco".
**Decisão:** Remover campo "nome" completamente. Identificador da conta é o banco.

---

## Data: 03/08/2026 - Ciclo 2: Correções de UX e Funcionalidades

### 12. Meta de despesa fixa considera despesas recorrentes

**Problema:** A meta "Conta Fixa" usava apenas percentual do salário, sem considerar despesas reais recorrentes.

**Solução:** Cálculo da meta "Conta Fixa" agora soma despesas recorrentes do mês atual. Se não houver despesas recorrentes, usa o percentual do salário como fallback.

**Arquivos modificados:** `src/components/metas/metas-predefinidas.tsx`

### 13. Detecção de duplicatas ao cadastrar transação

**Problema:** Não havia aviso ao cadastrar transação com descrição, valor e data iguais a uma existente.

**Solução:** Adicionada detecção de duplicatas no TransacaoForm. Quando há coincidência, exibe card de aviso com preview das transações existentes.

**Arquivos modificados:** `src/components/transacoes/transacao-form.tsx`

### 14. Extrato mostra mês atual por padrão

**Problema:** Filtros de transações iniciavam vazios, mostrando todas as transações.

**Solução:** Filtros agora iniciam com dataInicio = 1º dia do mês atual e dataFim = último dia do mês atual. Limpar filtros também reseta para o mês atual.

**Arquivos modificados:** `src/pages/Transacoes.tsx`, `src/components/transacoes/filtros.tsx`

### 15. Editar recorrente/parcelada pergunta "só essa ou todas"

**Problema:** Ao editar transação recorrente/parcelada, a alteração afetava apenas aquela transação.

**Solução:** Ao alterar valor ou data de transação recorrente/parcelada, exibe dialog perguntando "Só esta ou todas?" com opções de edição individual ou em grupo.

**Arquivos modificados:** `src/pages/EditarTransacao.tsx`

### 16. Categoria "Divida" adicionada

**Problema:** Não existia categoria para dívidas.

**Solução:** Adicionada categoria "Divida" (id: cat-011) com cor #DC2626 e ícone AlertCircle.

**Arquivos modificados:** `src/data/categorias-default.json`

### 17. Saldo Total mostra mês atual

**Problema:** SaldoCard exibia saldo total acumulado de todos os meses.

**Solução:** SaldoCard agora exibe saldo do mês atual (receitas - despesas do mês).

**Arquivos modificados:** `src/components/dashboard/saldo-card.tsx`

### 18. Categorias movidas para Configurações

**Problema:** Gerenciamento de categorias ficava na sidebar.

**Solução:** Link "Categorias" removido da sidebar. Página Configuracoes implementada com gerenciamento completo de categorias.

**Arquivos modificados:** `src/components/layout/sidebar.tsx`, `src/pages/Configuracoes.tsx`

### 19. Modo escuro persiste ao recarregar

**Problema:** Tema escuro reseta ao recarregar devido a timing na inicialização.

**Solução:** Layout lê tema diretamente do localStorage na inicialização, evitando flash antes do store ser carregado.

**Arquivos modificados:** `src/components/layout/layout.tsx`

### 20. Últimas Transações mostra mês atual

**Problema:** Dashboard exibia últimas 5 transações de todos os meses.

**Solução:** UltimasTransacoes agora filtra por transações do mês atual antes de ordenar e pegar as 5 mais recentes.

**Arquivos modificados:** `src/components/dashboard/ultimas-transacoes.tsx`

### 21. Alertas de Metas aprimorados

**Problema:** Cálculo de alertas de metas era básico e não mostrava informações úteis.

**Solução:** Alertas aprimorados com status detalhado, cálculo de parcela mensal necessária para metas atrasadas, e proteção contra divisão por zero.

**Arquivos modificados:** `src/components/dashboard/alerta-metas.tsx`

### 22. Dashboard evidencia mês atual

**Problema:** Dashboard não mostrava qual mês estava sendo exibido.

**Solução:** Adicionado cabeçalho no Dashboard com indicador visual do mês atual (número + nome do mês + ano).

**Arquivos modificados:** `src/pages/Dashboard.tsx`

### DDR-004 - Dashboard Filtrado por Mês

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** Usuário precisa ver dados do mês atual no dashboard, não o acumulado anual.
**Decisão:** Dashboard mostra dados do mês atual por padrão. Componentes usam `obterReceitasMes`/`obterDespesasMes` ao invés de `obterSaldoAtual`.

### DDR-005 - Categorias em Configurações

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** Sidebar ficava poluída com link de categorias que não é acessado frequentemente.
**Decisão:** Mover gerenciamento de categorias para dentro de Configurações, mantendo a rota `/categorias` existente mas sem exibir na sidebar.
