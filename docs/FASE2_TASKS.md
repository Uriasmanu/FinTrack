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

### Prioridade ALTA (MVP - Uso Imediato)

Estas são as funcionalidades mínimas para o app ser útil:

#### 1. Cadastro de Transações ✅ Obrigatório

- [ ] 1.1 Criar página `src/pages/NovaTransacao.tsx`
- [ ] 1.2 Criar componente `src/components/transacoes/transacao-form.tsx`
  - Campos obrigatórios: descrição, valor, data, tipo (receita/despesa)
  - Select de categoria (filtrado por tipo)
  - Select de conta
  - Select de cartão (opcional)
  - Radio de recorrência (única, recorrente, parcelado)
  - Campos condicionais: parcelaAtual/totalParcelas (quando parcelado)
  - Validação com Zod
  - Integração com React Hook Form
- [ ] 1.3 Criar página `src/pages/EditarTransacao.tsx`
  - Reutilizar componente transacao-form
  - Carregar dados da transação pelo ID
  - Tratar parcelas futuras ao editar total

#### 2. Extrato Bancário ✅ Obrigatório

- [ ] 2.1 Criar componente `src/components/transacoes/transacao-item.tsx`
  - Exibir: data, descrição, valor (entrada/saída), saldo acumulado
  - Cor: verde para receita, vermelho para despesa
  - Badge de parcela (ex: "5/36") para parcelados
  - Ícone de recorrência para recorrentes
  - Menu de 3 pontinhos: Editar, Excluir
- [ ] 2.2 Implementar cálculo de saldo acumulado
  - Ordenar transações por data
  - Calcular saldo após cada transação
  - Exibir saldo final no rodapé
- [ ] 2.3 Criar componente `src/components/transacoes/filtros.tsx`
  - Filtro por período (data inicial e final)
  - Filtro por tipo (receita, despesa, todos)
  - Filtro por categoria (select)
  - Filtro por conta (select)
  - Campo de busca por descrição
  - Botão limpar filtros
- [ ] 2.4 Atualizar página `src/pages/Transacoes.tsx`
  - Listar todas as transações com extrato
  - Integrar filtros
  - Botão "Nova Transação"

#### 3. Categorias Básicas ✅ Obrigatório

- [ ] 3.1 Criar página `src/pages/Categorias.tsx`
  - Listar categorias existentes
  - Botão "Nova Categoria"
- [ ] 3.2 Criar componente `src/components/categorias/categoria-card.tsx`
  - Exibir: nome, cor, ícone, tipo
  - Menu de 3 pontinhos: Editar, Excluir
- [ ] 3.3 Criar componente `src/components/categorias/categoria-form.tsx`
  - Campos: nome, cor (input color), ícone (select lucide), tipo
  - Modal de cadastro/edição (Dialog)
  - Validação com Zod

#### 4. Contas Básicas ✅ Obrigatório

- [ ] 4.1 Criar página `src/pages/Contas.tsx`
  - Listar contas existentes
  - Botão "Nova Conta"
- [ ] 4.2 Criar componente `src/components/contas/conta-card.tsx`
  - Exibir: nome, banco, tipo, saldo atual
  - Menu de 3 pontinhos: Editar, Excluir
- [ ] 4.3 Criar componente `src/components/contas/conta-form.tsx`
  - Campos: nome, banco, saldo inicial, tipo
  - Modal de cadastro/edição (Dialog)
  - Validação com Zod

#### 5. Cartões Básicos ✅ Obrigatório

- [ ] 5.1 Criar página `src/pages/Cartoes.tsx`
  - Listar cartões existentes
  - Botão "Novo Cartão"
- [ ] 5.2 Criar componente `src/components/cartoes/cartao-card.tsx`
  - Exibir: nome, bandeira, limite, fatura atual
  - Menu de 3 pontinhos: Editar, Excluir
- [ ] 5.3 Criar componente `src/components/cartoes/cartao-form.tsx`
  - Campos: nome, bandeira, limite, diaFechamento, diaVencimento
  - Modal de cadastro/edição (Dialog)
  - Validação com Zod

#### 6. Metas Predefinidas ✅ Obrigatório

- [ ] 6.1 Atualizar store para criar metas predefinidas na inicialização
  - Criar metas padrão quando `dadosAno.metas.length === 0`
  - Metas: Viver de Renda, Reserva de Emergência, Guardar por Mês, Conta Fixa, Lazer
  - Todas com `ativo: true` por padrão
- [ ] 6.2 Criar componente `src/components/metas/metas-predefinidas.tsx`
  - Cards das metas baseadas nos multiplicadores
  - Menu de 3 pontinhos: Editar multiplicador, Desabilitar
  - Cálculo automático baseado no salário
  - Toggle de habilitar/desabilitar
- [ ] 6.3 Criar página `src/pages/Metas.tsx`
  - Listar metas predefinidas e personalizadas
  - Botão "Nova Meta"
- [ ] 6.4 Criar componente `src/components/metas/meta-card.tsx`
  - Exibir: nome, valor alvo, valor atual, progresso
  - Barra de progresso
  - Badge de status
  - Menu de 3 pontinhos: Editar, Habilitar/Desabilitar, Excluir

### Prioridade MÉDIA (Funcionalidades Complementares)

Estas melhoriam a experiência mas não são bloqueantes:

#### 7. Configurações Básicas

- [ ] 7.1 Criar página `src/pages/Configuracoes.tsx`
- [ ] 7.2 Criar componente `src/components/configuracoes/perfil.tsx`
  - Campo: salário mensal
  - Salvar automaticamente ao alterar
- [ ] 7.3 Criar componente `src/components/configuracoes/tema.tsx`
  - Toggle claro/escuro
- [ ] 7.4 Criar componente `src/components/configuracoes/objetivos.tsx`
  - Lista dos multiplicadores editáveis

#### 8. Funções Auxiliares no Store

- [ ] 8.1 Criar função `calcularSaldoConta(contaId)` no store
- [ ] 8.2 Criar função `calcularFaturaCartao(cartaoId)` no store
- [ ] 8.3 Criar função `calcularSaldoAcumulado(transacoes)` para extrato

### Prioridade BAixa (Features Avançadas)

Estas podem vir em fases futuras:

#### 9. Gráficos

- [ ] 9.1 Criar página `src/pages/Graficos.tsx`
- [ ] 9.2 Criar componente `src/components/graficos/barras-mensais.tsx`
- [ ] 9.3 Criar componente `src/components/graficos/pizza-categorias.tsx`
- [ ] 9.4 Criar componente `src/components/graficos/linha-saldo.tsx`

#### 10. Exportação

- [ ] 10.1 Criar página `src/pages/Exportar.tsx`
- [ ] 10.2 Criar componente `src/components/exportar/exportar-pdf.tsx`
- [ ] 10.3 Criar componente `src/components/exportar/exportar-csv.tsx`

#### 11. Backup/Restore

- [ ] 11.1 Criar componente `src/components/configuracoes/backup.tsx`
  - Botão Exportar JSON
  - Botão Importar JSON

---

## Ordem de Execução (MVP)

1. **Tasks 1.1 a 1.3** — Formulário de transação (cadastro/edição)
2. **Tasks 2.1 a 2.4** — Extrato bancário com filtros
3. **Tasks 6.1 a 6.4** — Metas predefinidas
4. **Tasks 3.1 a 3.3** — Categorias
5. **Tasks 4.1 a 4.3** — Contas
6. **Tasks 5.1 a 5.3** — Cartões
7. **Tasks 8.1 a 8.3** — Funções auxiliares no store
8. **Tasks 7.1 a 7.4** — Configurações básicas

---

## Entregáveis da Fase 2 (MVP)

- [ ] Usuário pode cadastrar receitas e despesas
- [ ] Usuário pode editar e excluir transações
- [ ] Extrato bancário com saldo acumulado
- [ ] Filtros por período, tipo, categoria e conta
- [ ] Metas predefinidas visíveis no dashboard
- [ ] Categorias, contas e cartões gerenciáveis
- [ ] Configurações de salário e tema
- [ ] Build sem erros (`npm run build`)

---

## Critérios de Aceite

1. **Cadastro**: Usuário consegue criar uma transação completa em < 30 segundos
2. **Extrato**: Saldo acumulado é calculado corretamente após cada transação
3. **Metas**: Metas predefinidas aparecem no dashboard com cálculos corretos
4. **Persistência**: Dados são salvos no localStorage e persistem ao recarregar
5. **Responsividade**: Layout funciona em desktop e mobile
6. **Temas**: Tema claro/escuro funciona em todas as páginas
