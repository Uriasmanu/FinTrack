# FinTrack - Fase 2: Uso Básico (MVP)

## Objetivo

Tornar o app **usável no dia a dia**. O usuário deve conseguir:
- Registrar receitas e despesas
- Visualizar extrato bancário
- Ver metas predefinidas já disponíveis
- Gerenciar categorias, contas e cartões básicos

---

## O que já existe (Fase 1 completa)

- ✅ Dashboard com resumo financeiro
- ✅ Store Zustand com CRUD completo (transações, categorias, contas, cartões, metas)
- ✅ Layout responsivo com sidebar e rotas
- ✅ Tema claro/escuro
- ✅ Funções de cálculo e formatação
- ✅ Tratamento de erros

---

## Prioridades da Fase 2

### Prioridade ALTA (MVP - Uso Imediato) ✅ CONCLUÍDO

Estas são as funcionalidades mínimas para o app ser útil:

#### 1. Cadastro de Transações ✅

- [x] 1.1 Criar página `src/pages/NovaTransacao.tsx`
- [x] 1.2 Criar componente `src/components/transacoes/transacao-form.tsx`
  - Campos obrigatórios: descrição, valor, data, tipo (receita/despesa)
  - Select de categoria (filtrado por tipo)
  - Select de conta
  - Select de cartão (opcional)
  - Radio de recorrência (única, recorrente, parcelado)
  - Campos condicionais: parcelaAtual/totalParcelas (quando parcelado)
  - Validação com Zod
  - Integração com React Hook Form
- [x] 1.3 Criar página `src/pages/EditarTransacao.tsx`
  - Reutilizar componente transacao-form
  - Carregar dados da transação pelo ID
  - Tratar parcelas futuras ao editar total

#### 2. Extrato Bancário ✅

- [x] 2.1 Criar componente `src/components/transacoes/transacao-item.tsx`
  - Exibir: data, descrição, valor (entrada/saída), saldo acumulado
  - Cor: verde para receita, vermelho para despesa
  - Badge de parcela (ex: "5/36") para parcelados
  - Ícone de recorrência para recorrentes
  - Menu de 3 pontinhos: Editar, Excluir
- [x] 2.2 Implementar cálculo de saldo acumulado
  - Ordenar transações por data
  - Calcular saldo após cada transação
  - Exibir saldo final no rodapé
- [x] 2.3 Criar componente `src/components/transacoes/filtros.tsx`
  - Filtro por período (data inicial e final)
  - Filtro por tipo (receita, despesa, todos)
  - Filtro por categoria (select)
  - Filtro por conta (select)
  - Campo de busca por descrição
  - Botão limpar filtros
- [x] 2.4 Atualizar página `src/pages/Transacoes.tsx`
  - Listar todas as transações com extrato
  - Integrar filtros
  - Botão "Nova Transação"

#### 3. Categorias Básicas ✅

- [x] 3.1 Criar página `src/pages/Categorias.tsx`
  - Listar categorias existentes
  - Botão "Nova Categoria"
- [x] 3.2 Criar componente `src/components/categorias/categoria-card.tsx`
  - Exibir: nome, cor, ícone, tipo
  - Menu de 3 pontinhos: Editar, Excluir
- [x] 3.3 Criar componente `src/components/categorias/categoria-form.tsx`
  - Campos: nome, cor (input color), ícone (select), tipo
  - Modal de cadastro/edição (Dialog)
  - Validação com Zod

#### 4. Contas Básicas ✅

- [x] 4.1 Criar página `src/pages/Contas.tsx`
  - Listar contas existentes
  - Botão "Nova Conta"
- [x] 4.2 Criar componente `src/components/contas/conta-card.tsx`
  - Exibir: nome, banco, tipo, saldo atual
  - Menu de 3 pontinhos: Editar, Excluir
- [x] 4.3 Criar componente `src/components/contas/conta-form.tsx`
  - Campos: nome, banco, saldo inicial, tipo
  - Modal de cadastro/edição (Dialog)
  - Validação com Zod

#### 5. Cartões Básicos ✅

- [x] 5.1 Criar página `src/pages/Cartoes.tsx`
  - Listar cartões existentes
  - Botão "Novo Cartão"
- [x] 5.2 Criar componente `src/components/cartoes/cartao-card.tsx`
  - Exibir: nome, bandeira, limite, fatura atual
  - Menu de 3 pontinhos: Editar, Excluir
- [x] 5.3 Criar componente `src/components/cartoes/cartao-form.tsx`
  - Campos: nome, bandeira, limite, diaFechamento, diaVencimento
  - Modal de cadastro/edição (Dialog)
  - Validação com Zod

#### 6. Metas Predefinidas ✅

- [x] 6.1 Atualizar store para criar metas predefinidas na inicialização
  - Criar metas padrão quando `dadosAno.metas.length === 0`
  - Metas: Viver de Renda, Reserva de Emergência, Guardar por Mês, Conta Fixa, Lazer
  - Todas com `ativo: true` por padrão
- [x] 6.2 Criar componente `src/components/metas/metas-predefinidas.tsx`
  - Cards das metas baseadas nos multiplicadores
  - Menu de 3 pontinhos: Editar multiplicador, Desabilitar
  - Cálculo automático baseado no salário
  - Toggle de habilitar/desabilitar
- [x] 6.3 Criar página `src/pages/Metas.tsx`
  - Listar metas predefinidas e personalizadas
  - Botão "Nova Meta"
- [x] 6.4 Criar componente `src/components/metas/meta-card.tsx`
  - Exibir: nome, valor alvo, valor atual, progresso
  - Barra de progresso
  - Badge de status
  - Menu de 3 pontinhos: Editar, Habilitar/Desabilitar, Excluir
- [x] 6.5 Criar componente `src/components/metas/meta-form.tsx`
  - Campos: nome, valor alvo, prazo (meses)
  - Slider para ajuste de meses
  - Pré-visualização da parcela mensal
  - Validação com Zod
  - Modal de cadastro/edição (Dialog)

### Prioridade MÉDIA (Funcionalidades Complementares) ✅ CONCLUÍDO

- [x] 7.1 Adicionar função `obterSaldoConta(contaId)` no store
- [x] 7.2 Adicionar função `obterFaturaCartao(cartaoId)` no store

### Prioridade BAIXA (Features Avançadas) - PENDENTE

Estas podem vir em fases futuras:

#### 8. Gráficos

- [ ] 8.1 Criar página `src/pages/Graficos.tsx`
- [ ] 8.2 Criar componente `src/components/graficos/barras-mensais.tsx`
- [ ] 8.3 Criar componente `src/components/graficos/pizza-categorias.tsx`
- [ ] 8.4 Criar componente `src/components/graficos/linha-saldo.tsx`

#### 9. Exportação

- [ ] 9.1 Criar página `src/pages/Exportar.tsx`
- [ ] 9.2 Criar componente `src/components/exportar/exportar-pdf.tsx`
- [ ] 9.3 Criar componente `src/components/exportar/exportar-csv.tsx`

#### 10. Configurações

- [ ] 10.1 Criar página `src/pages/Configuracoes.tsx`
- [ ] 10.2 Criar componente `src/components/configuracoes/perfil.tsx`
- [ ] 10.3 Criar componente `src/components/configuracoes/tema.tsx`
- [ ] 10.4 Criar componente `src/components/configuracoes/objetivos.tsx`

#### 11. Backup/Restore

- [ ] 11.1 Criar componente `src/components/configuracoes/backup.tsx`

---

## Entregáveis da Fase 2 (MVP) ✅

- [x] Usuário pode cadastrar receitas e despesas
- [x] Usuário pode editar e excluir transações
- [x] Extrato bancário com saldo acumulado
- [x] Filtros por período, tipo, categoria e conta
- [x] Metas predefinidas visíveis no dashboard
- [x] Categorias, contas e cartões gerenciáveis
- [x] Build sem erros (`npm run build`)

---

## Próximos Passos

1. Implementar Gráficos (Recharts)
2. Implementar Exportação (PDF/CSV)
3. Implementar Configurações completas
4. Implementar Backup/Restore
