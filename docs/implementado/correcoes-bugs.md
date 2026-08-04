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

---

## Data: 03/08/2026 - Ciclo 3: UX, Gráficos e Correções

### 23. Transações mostra mês atual no cabeçalho

**Problema:** Página de transações não indicava qual mês estava sendo exibido.

**Solução:** Adicionado cabeçalho com número do mês e nome do mês (ex: "3 - Março").

**Arquivos modificados:** `src/pages/Transacoes.tsx`

### 24. Contas mostra mês atual no cabeçalho

**Problema:** Página de contas não indicava qual mês estava sendo exibido.

**Solução:** Adicionado cabeçalho com número do mês e nome do mês.

**Arquivos modificados:** `src/pages/Contas.tsx`

### 25. Categoria VA/VR adicionada

**Problema:** Não existia categoria para vale alimentação/refeição.

**Solução:** Adicionada categoria "VA/VR" (id: cat-012) com cor #059669 e ícone Utensils para receitas.

**Arquivos modificados:** `src/data/categorias-default.json`

### 26. Saldo de hoje em contas considera efetivadas

**Problema:** Saldo da conta mostrava todas as transações sem considerar se foram confirmadas.

**Solução:** Saldo "Hoje" considera apenas transações confirmadas até a data atual. Adicionado "Saldo do Mês" separado.

**Arquivos modificados:** `src/components/contas/conta-card.tsx`

### 27. Feature de gráficos implementada

**Problema:** Página de gráficos era um placeholder.

**Solução:** Implementada página de gráficos com Recharts. Tipos: Despesas por Categoria, Receitas por Categoria, Evolução Mensal. Formatos: Pizza, Barra e Linhas.

**Arquivos modificados:** `src/pages/Graficos.tsx`

### 28. Tema escuro com dialog de confirmação

**Problema:** Mudança de tema era aplicada imediatamente sem confirmação.

**Solução:** Adicionado AlertDialog confirmando mudança de tema. Tema é salvo no JSON apenas após confirmação.

**Arquivos modificados:** `src/components/layout/layout.tsx`

### 29. Dialog "Todas as seguintes"

**Problema:** Botão "Todas" no dialog de edição dava a entender que transações anteriores seriam afetadas.

**Solução:** Texto alterado para "Todas as seguintes" para indicar que apenas transações futuras são afetadas.

**Arquivos modificados:** `src/pages/EditarTransacao.tsx`

### 30. Limpar filtros melhor posicionado

**Problema:** Botão "Limpar filtros" ficava desalinhado.

**Solução:** Botão agora usa variante `outline`, alinhado à base com os inputs.

**Arquivos modificados:** `src/components/transacoes/filtros.tsx`

### 31. Editar Transação proporcional

**Problema:** Página de edição de transação ficava estreita demais.

**Solução:** Container alterado de `max-w-2xl` para `max-w-4xl`.

**Arquivos modificados:** `src/pages/EditarTransacao.tsx`

### 32. Editar Conta traz informações

**Problema:** Ao clicar em Editar Conta, o formulário não trazia os dados da conta.

**Solução:** Corrigido `handleSubmit` para fechar dialog e limpar `editingId` após submissão.

**Arquivos modificados:** `src/pages/Contas.tsx`

### 33. Últimas Transações reflete alterações

**Problema:** Dashboard não refletia alterações feitas em transações.

**Solução:** Mudei de `obterTransacoesMes` para filtrar diretamente do store, ordenando por `data` ao invés de `criadoEm`.

**Arquivos modificados:** `src/components/dashboard/ultimas-transacoes.tsx`

### 34. Saldo extrato considera efetivadas

**Problema:** Saldo do dia no extrato não ajudava a prever se dá para concluir todas as transações.

**Solução:** Extrato agora mostra dois saldos: "Efetivado" (apenas confirmadas) e "Saldo do dia" (todas).

**Arquivos modificados:** `src/pages/Transacoes.tsx`

### DDR-006 - Gráficos com Recharts

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** Usuário precisa visualizar dados financeiros em gráficos.
**Decisão:** Usar Recharts (já instalado) com 3 tipos de formato (pizza, barra, linhas) e 3 tipos de dados (despesas/receitas por categoria, evolução mensal).

### DDR-007 - Saldo de Hoje vs Saldo do Mês

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** Usuário precisa ver saldo atual (confirmado) e saldo do mês (projetado).
**Decisão:** Contas mostram dois saldos: "Saldo Hoje" (transações confirmadas até hoje) e "Saldo do Mês" (todas transações do mês).

---

## Data: 03/08/2026 - Ciclo 3: Correções de Data, Dashboard e Metas

### 35. Data nova transação usa timezone local

**Problema:** Ao criar nova transação, a data era definida com `new Date().toISOString().split("T")[0]` que pode gerar data no dia seguinte devido a diferença de timezone.

**Solução:** Substituído por construção de data local: `new Date()`, `getFullYear()`, `getMonth()`, `getDate()`.

**Arquivos modificados:** `src/components/transacoes/transacao-form.tsx`

### 36. Dashboard mostra Próximas Transações

**Problema:** Dashboard exibia "Últimas Transações" em vez de transações próximas/futuras.

**Solução:** Criado componente `ProximasTransacoes` que lista transações confirmadas e próximas do mês. Removido `UltimasTransacoes` do Dashboard.

**Arquivos modificados:** `src/pages/Dashboard.tsx`, `src/components/dashboard/proximas-transacoes.tsx`

### 37. Alertas de Metas removidos do Dashboard

**Problema:** Dashboard exibia AlertaMetas que não era necessário.

**Solução:** Removido import e uso do componente `AlertaMetas` do Dashboard.

**Arquivos modificados:** `src/pages/Dashboard.tsx`

### 38. Dashboard com navegação entre meses

**Problema:** Dashboard não permitia transitar entre meses diferentes.

**Solução:** Adicionado estado `mesSelecionado`/`anoSelecionado` com botões anterior/atual/seguinte. Todos os componentes filhos agora recebem props `mes`/`ano`.

**Arquivos modificados:** `src/pages/Dashboard.tsx`, `src/components/dashboard/saldo-card.tsx`, `src/components/dashboard/receitas-despesas-card.tsx`, `src/components/dashboard/resumo-mensal.tsx`, `src/components/dashboard/resumo-categorias.tsx`, `src/components/dashboard/proximas-transacoes.tsx`

### 39. Alimentação auto-puxa ticket com permissão de troca

**Problema:** Categoria Alimentação forçava conta ticket mesmo quando usuário queria usar outra conta.

**Solução:** Alimentação auto-puxa ticket apenas quando não está editando, permitindo trocar para outra conta.

**Arquivos modificados:** `src/components/transacoes/transacao-form.tsx`

### 40. Metas com seletor de receitas base

**Problema:** Metas padrão usavam hardcoded `cat-007` (Salário) como base de cálculo.

**Solução:** Adicionado campo `receitasBase` ao tipo Meta, componente Checkbox, seletor de categorias de receita no MetaForm, e MetasPredefinidas usa categorias selecionadas.

**Arquivos modificados:** `src/types/index.ts`, `src/components/metas/meta-form.tsx`, `src/components/metas/metas-predefinidas.tsx`, `src/data/defaults.ts`, `src/components/ui/checkbox.tsx`

### DDR-008 - Dashboard com Navegação de Meses

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** Usuário precisa visualizar dados de meses diferentes no dashboard.
**Decisão:** Dashboard com estado de mês selecionado e botões de navegação. Componentes filhos recebem `mes`/`ano` como props.

### DDR-009 - Metas com Receitas Base Configuráveis

**Status:** Aceito
**Data:** 03/08/2026
**Contexto:** Usuário pode ter múltiplas fontes de receita e quer escolher quais usar como base para cálculo de metas.
**Decisão:** Campo `receitasBase: string[]` no tipo Meta. Se vazio, usa todas categorias de receita. Formulário inclui seletor de categorias.
