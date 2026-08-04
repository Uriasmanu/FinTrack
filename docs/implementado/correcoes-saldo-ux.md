# Implementado - Correções de Saldo, UX e Funcionalidades

## Data: 03/08/2026

---

## Problemas Corrigidos

### 49. Editar metas não trazia valores do card selecionado

**Problema:** Ao clicar em "Editar" em uma meta, o formulário não preenchia os valores da meta selecionada.

**Causa Raiz:** `useForm` do React Hook Form só lê `defaultValues` no mount. Como o componente ficava montado, `initialData` mudava mas o formulário não atualizava.

**Solução:** Adicionado `useEffect` que chama `reset()` quando `initialData` muda.

**Arquivos:** `src/components/metas/meta-form.tsx`

---

### 50. Saldo inicial não considerava data de criação da conta

**Problema:** Saldo inicial de todas as contas era somado independentemente da data de criação.

**Causa Raiz:** Interface `Conta` não tinha campo `dataCriacao`. Saldo era aplicado para todo o período.

**Solução:** Adicionado `dataCriacao?: string` à interface `Conta`. No extrato, saldo inicial só é considerado se a conta foi criada antes do período.

**Arquivos:** `src/types/index.ts`, `src/pages/Transacoes.tsx`

---

### 51. Extrato não mostrava saldo início e fim do dia

**Problema:** Extrato mostrava apenas saldo final do dia.

**Solução:** Adicionado cálculo de saldo acumulado anterior por dia. Exibição mostra "Início: X" e "Saldo do dia: Y".

**Arquivos:** `src/pages/Transacoes.tsx`

---

### 52. Saldo Total no dashboard não considerava saldoInicial

**Problema:** SaldoCard calculava apenas receitas - despesas do mês.

**Solução:** SaldoCard agora soma saldoInicial + transações anteriores + receitas - despesas.

**Arquivos:** `src/components/dashboard/saldo-card.tsx`

---

### 53. Dropdowns de contas não mostravam tipo

**Problema:** Seletores de conta mostravam apenas nome do banco.

**Solução:** Todos os dropdowns mostram "Banco (Tipo)".

**Arquivos:** `src/components/transacoes/transacao-form.tsx`, `src/pages/Transferencia.tsx`, `src/components/transacoes/filtros.tsx`

---

### 54. Categoria "Guardar" não existia

**Problema:** Não havia categoria para transferências de poupança.

**Solução:** Adicionada categoria "Guardar" (cat-014).

**Arquivos:** `src/data/categorias-default.json`

---

### 55. Saldo de contas ticket afetava saldo total

**Problema:** Contas ticket eram incluídas nos cálculos de saldo total.

**Solução:** Criada função `obterSaldoAtualSemTicket()` que exclui contas ticket.

**Arquivos:** `src/stores/useFinanceStore.ts`, `src/components/dashboard/saldo-card.tsx`

---

### 56. Exportação e importação JSON implementadas

**Problema:** Página de exportação era placeholder.

**Solução:** Implementada página completa com download e upload de JSON.

**Arquivos:** `src/pages/Exportar.tsx`

---

## DDR (Design Decision Record)

### DDR-013 - Saldo Total exclui contas ticket

**Status:** Aceito
**Data:** 03/08/2026

**Contexto:** Contas ticket (vale-alimentação) não podem ser usadas para pagar contas, mas inflavam o saldo total.

**Decisão:** Criar função `obterSaldoAtualSemTicket()` que exclui transações de contas ticket dos cálculos de saldo.

### DDR-014 - dataCriacao em Conta

**Status:** Aceito
**Data:** 03/08/2026

**Contexto:** Saldo inicial era aplicado para todo o período, mesmo que a conta tivesse sido criada no meio do mês.

**Decisão:** Adicionar campo `dataCriacao?: string` à interface `Conta`. Saldo inicial só é considerado se a conta foi criada antes do período filtrado.
