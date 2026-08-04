# Correções - Ciclo 03/08/2026

## Problemas Resolvidos

### 1. Saldo do dia no extrato posicionamento incorreto

**Problema:** O saldo final do dia era exibido no cabeçalho, antes das transações, causando confusão ao usuário.

**Solução:** Movido "Saldo do dia" para abaixo da lista de transações do dia, após a última transação.

**Arquivos modificados:** `src/pages/Transacoes.tsx`

---

### 2. Categoria "Guardar" não aparecia em Transferências

**Problema:** O select de categorias na página de transferência mostrava todas as categorias, incluindo irrelevantes.

**Solução:** Filtrado o select para mostrar apenas categorias com tipo "ambos" ou específicas de transferência (Transferencia e Guardar).

**Arquivos modificados:** `src/pages/Transferencia.tsx`

---

### 3. Tom de vermelho no tema escuro

**Problema:** Cores vermelhas no tema escuro estavam apagadas com pouca saturação e luminosidade.

**Solução:** Ajustado `--color-destructive` no tema escuro de `hsl(0 62.8% 30.6%)` para `hsl(0 72% 51%)`, aumentando contraste.

**Arquivos modificados:** `src/index.css`

---

### 4. Filtro por conta na página de gráficos

**Problema:** Gráficos não permitiam filtrar por conta bancária específica.

**Solução:** Adicionado Select de contas com opção "Todas contas" e lógica de filtragem por `contaId`.

**Arquivos modificados:** `src/pages/Graficos.tsx`

---

### 5. Aviso de saldo negativo no formulário

**Problema:** Sistema não avisava quando transação deixaria saldo da conta negativo.

**Solução:** Adicionado cálculo de saldo atual e projeção após transação. Exibido alerta visual quando saldo ficar negativo.

**Arquivos modificados:** `src/components/transacoes/transacao-form.tsx`

---

### 6. Transações recorrentes não apareciam em meses futuros

**Problema:** Transações com `tipoRecorrencia: "recorrente"` só geravam uma transação no mês de criação.

**Solução:** Modificada função `criarTransacoesRecorrentes` para gerar transações para 12 meses futuros automaticamente.

**Arquivos modificados:** `src/lib/transacoes.ts`

---

### 7. Categorias de Combustível e Compras para Casa

**Problema:** Usuário queria ver gastos com combustível e subcategorias de compras para casa.

**Solução:** Adicionadas 5 novas categorias padrão:
- `cat-015`: Combustivel (despesa)
- `cat-016`: Limpeza (despesa)
- `cat-017`: Comida (despesa)
- `cat-018`: Besteira (despesa)
- `cat-019`: Acougue (despesa)

Atualizado componente `DespesasPorFinalidade` para incluir essas categorias.

**Arquivos modificados:** `src/data/categorias-default.json`, `src/components/dashboard/despesas-por-finalidade.tsx`

---

### 8. Receitas vs Despesas - comparação com mês anterior

**Problema:** Card comparava mês atual com mês anterior sem considerar ano. Em janeiro, comparava com dezembro do mesmo ano (inexistente).

**Solução:** Adicionada verificação `mostrarComparacao = mes > 0`. Comparação só é exibida quando não estamos em janeiro.

**Arquivos modificados:** `src/components/dashboard/receitas-despesas-card.tsx`

---

### 9. Categoria VA/VR não aparecia em transações

**Problema:** Usuários com dados existentes não tinham as categorias padrão mais recentes (VA/VR, Guardar, etc.) porque a migração só carregava defaults quando a lista estava vazia.

**Solução:** Alterada lógica de inicialização para adicionar categorias faltantes (merge por ID) em vez de substituir toda a lista.

**Arquivos modificados:** `src/stores/useFinanceStore.ts`

---

## Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `src/pages/Transacoes.tsx` | Mover saldo do dia para abaixo das transações |
| `src/pages/Transferencia.tsx` | Filtrar categorias relevantes |
| `src/pages/Graficos.tsx` | Adicionar filtro por conta |
| `src/index.css` | Ajustar vermelho no tema escuro |
| `src/components/transacoes/transacao-form.tsx` | Adicionar aviso de saldo negativo |
| `src/lib/transacoes.ts` | Gerar recorrentes para 12 meses |
| `src/data/categorias-default.json` | Adicionar 5 categorias novas |
| `src/components/dashboard/despesas-por-finalidade.tsx` | Incluir novas categorias |
| `src/components/dashboard/receitas-despesas-card.tsx` | Corrigir comparação mês anterior |
| `src/stores/useFinanceStore.ts` | Adicionar categorias faltantes na migração |

---

## Histórico de Correções

| Data | Problema | Solução |
|------|----------|---------|
| 03/08/2026 | Saldo do dia no extrato | Movido para abaixo das transações |
| 03/08/2026 | Categoria Guardar em transferências | Filtrar categorias relevantes |
| 03/08/2026 | Vermelho no tema escuro | Aumentar luminosidade e saturação |
| 03/08/2026 | Gráficos sem filtro por conta | Adicionar Select de contas |
| 03/08/2026 | Sem aviso de saldo negativo | Adicionar projeção e alerta |
| 03/08/2026 | Recorrentes não aparecem futuros | Gerar para 12 meses |
| 03/08/2026 | Faltavam categorias específicas | Adicionar 5 categorias novas |
| 03/08/2026 | Receitas vs Despesas comparação | Verificar mês > 0 antes de comparar |
| 03/08/2026 | VA/VR não aparecia | Adicionar categorias faltantes na migração |
