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

**Solução:** Todos os componentes já utilizam `confirm()` antes de excluir (transação, categoria, conta, cartão, meta).

**Status:** Já implementado

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
