# Implementado - Correções de Bugs

## Data: 03/08/2026

## Problemas Corrigidos

### 1. Tela em branco ao clicar em "Nova Transação"

**Problema:** As rotas `/transacoes/nova` e `/transacoes/:id` não estavam definidas no App.tsx, causando tela em branco ao tentar acessar.

**Solução:** Adicionadas rotas e imports das páginas NovaTransacao e EditarTransacao.

**Arquivos modificados:**
- `src/App.tsx` — Adicionadas rotas e imports

### 2. Tema escuro não persiste ao recarregar

**Problema:** A preferência de tema não era salva no localStorage, sendo perdida ao recarregar a página.

**Solução:** 
- Adicionado `localStorage.setItem("fintrack-tema", tema)` ao salvar tema
- Adicionado `useEffect` para ler tema salvo na inicialização

**Arquivos modificados:**
- `src/components/layout/layout.tsx` — Persistência e aplicação do tema

## DDR (Design Decision Record)

### DDR-001 - Persistência de Tema

**Status:** Aceito

**Data:** 03/08/2026

**Contexto:** O usuário deve ter sua preferência de tema (claro/escuro) persistida entre sessões.

**Decisão:** Utilizar localStorage com chave `fintrack-tema` para persistir a preferência.

**Alternativas consideradas:**
- Usar o store Zustand (já persiste dados)
  - Prós: Dados centralizados
  - Contras: Tema seria perdido se o store for resetado

**Consequências:**
- **Positivas:** Tema persiste independentemente do store
- **Negativas:** Duplicação de dados (store + localStorage)
