# FinTrack - Fase 1: Dashboard + Armazenamento JSON

## Objetivo

Implementar o dashboard com resumo financeiro e o sistema de armazenamento local usando um único arquivo JSON por ano.

---

## Regra de Armazenamento

- Um único JSON por ano: `fintrack_2026.json`, `fintrack_2027.json`, etc.
- O JSON do ano atual é o ativo
- Ao mudar o ano, o app cria um novo JSON automaticamente
- Estrutura interna do JSON:

```json
{
  "ano": 2026,
  "transacoes": [],
  "categorias": [],
  "contas": [],
  "cartoes": [],
  "metas": [],
  "config": {}
}
```

---

## Tasks

### 1. Configuração do Projeto ✅

- [x] 1.1 Criar projeto React com Vite + TypeScript
- [x] 1.2 Instalar dependências base
- [x] 1.3 Instalar Tailwind CSS
- [x] 1.4 Instalar dependências do shadcn/ui
- [x] 1.5 Configurar alias `@/` no tsconfig.json e vite.config.ts
- [x] 1.6 Criar arquivo `src/lib/cn.ts`
- [x] 1.7 Instalar React Router
- [x] 1.8 Instalar Zustand
- [x] 1.9 Instalar Recharts
- [x] 1.10 Instalar jsPDF e html2canvas
- [x] 1.11 Instalar papaparse
- [x] 1.12 Instalar React Hook Form + Zod
- [x] 1.13 Criar estrutura de pastas do projeto

### 2. Tipagens TypeScript ✅

- [x] 2.1 Criar arquivo `src/types/index.ts`
- [x] 2.2 Definir interface `Transacao` (id, tipo, tipoRecorrencia, descricao, valor, data, categoriaId, contaId, cartaoId, parcelaAtual, totalParcelas, grupoParcelaId, criadoEm)
- [x] 2.3 Definir interface `Categoria` (id, nome, cor, icone, tipo)
- [x] 2.4 Definir interface `Conta` (id, nome, banco, saldoInicial, tipo)
- [x] 2.5 Definir interface `Cartao` (id, nome, bandeira, limite, diaFechamento, diaVencimento)
- [x] 2.6 Definir interface `Meta` (id, nome, tipo, ativo, valorAlvo, valorAtual, meses, parcelaMensal, dataInicio, dataFim, status)
- [x] 2.7 Definir interface `Config` (salario, tema, moeda, multiplicadores)
- [x] 2.8 Definir interface `DadosAno` (ano, transacoes, categorias, contas, cartoes, metas, config)
- [x] 2.9 Definir tipo `TipoTransacao` ("receita" | "despesa")
- [x] 2.10 Definir tipo `TipoRecorrencia` ("unica" | "recorrente" | "parcelado")
- [x] 2.11 Definir tipo `TipoMeta` ("padrao" | "personalizado")
- [x] 2.12 Definir tipo `TipoConta` ("corrente" | "poupanca" | "investimento")
- [x] 2.13 Definir tipo `StatusMeta` ("em_andamento" | "concluida" | "cancelada")
- [x] 2.14 Definir tipo `Tema` ("claro" | "escuro")

### 3. Utilitários Base ✅

- [x] 3.1 Criar arquivo `src/lib/cn.ts` com função de concatenação de classes
- [x] 3.2 Criar arquivo `src/lib/uuid.ts` com geração de ID usando `crypto.randomUUID()`
- [x] 3.3 Criar arquivo `src/lib/storage.ts` com funções de leitura/escrita no localStorage
- [x] 3.4 Implementar função `obterChaveAno()` que retorna `fintrack_{anoAtual}`
- [x] 3.5 Implementar função `carregarDadosAno()` que lê o JSON do ano atual do localStorage
- [x] 3.6 Implementar função `salvarDadosAno(dados)` que salva o JSON no localStorage
- [x] 3.7 Implementar função `criarDadosAnoNovo(ano)` que cria estrutura vazia para um novo ano
- [x] 3.8 Implementar função `verificarOuCriarAnoAtual()` que verifica se o JSON do ano existe, senão cria
- [x] 3.9 Implementar função `migrarDadosSeNecessario()` que detecta mudança de ano e cria novo JSON
- [x] 3.10 Criar arquivo `src/lib/transacoes.ts` com funções de parcelas e recorrência
- [x] 3.11 Implementar função `criarTransacoesRecorrentes()` — gera parcelas ou transação recorrente
- [x] 3.12 Implementar função `excluirParcelasFuturas()` — exclui parcelas a partir de uma data
- [x] 3.13 Implementar função `recalcularParcelas()` — recalcula total de parcelas de um grupo

### 4. Dados Iniciais (Defaults) ✅

- [x] 4.1 Criar arquivo `src/data/categorias-default.json`
- [x] 4.2 Adicionar categorias padrão: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Salário, Investimentos, Outros
- [x] 4.3 Criar arquivo `src/data/config-default.json` com valores padrão da config
- [x] 4.4 Criar função `obterCategoriasDefault()` que retorna as categorias iniciais

### 5. Store Global (Zustand) ✅

- [x] 5.1 Instalar Zustand
- [x] 5.2 Criar arquivo `src/stores/useFinanceStore.ts`
- [x] 5.3 Implementar state: `dadosAno` (DadosAno | null)
- [x] 5.4 Implementar action: `inicializar()` — carrega dados do ano atual ao iniciar o app
- [x] 5.5 Implementar action: `adicionarTransacao(transacao)` — adiciona e salva
- [x] 5.5.1 Implementar action: `adicionarTransacoesRecorrentes(dados)` — cria parcelas ou recorrência
- [x] 5.6 Implementar action: `editarTransacao(id, dados)` — edita e salva
- [x] 5.7 Implementar action: `excluirTransacao(id)` — exclui e salva
- [x] 5.7.1 Implementar action: `excluirParcelasFuturas(grupoParcelaId, dataLimite)` — exclui parcelas futuras
- [x] 5.7.2 Implementar action: `recalcularParcelas(grupoParcelaId, novoTotal)` — recalcula total de parcelas
- [x] 5.8 Implementar action: `adicionarCategoria(categoria)` — adiciona e salva
- [x] 5.9 Implementar action: `editarCategoria(id, dados)` — edita e salva
- [x] 5.10 Implementar action: `excluirCategoria(id)` — exclui e salva
- [x] 5.11 Implementar action: `adicionarConta(conta)` — adiciona e salva
- [x] 5.12 Implementar action: `editarConta(id, dados)` — edita e salva
- [x] 5.13 Implementar action: `excluirConta(id)` — exclui e salva
- [x] 5.14 Implementar action: `adicionarCartao(cartao)` — adiciona e salva
- [x] 5.15 Implementar action: `editarCartao(id, dados)` — edita e salva
- [x] 5.16 Implementar action: `excluirCartao(id)` — exclui e salva
- [x] 5.17 Implementar action: `adicionarMeta(meta)` — adiciona e salva
- [x] 5.18 Implementar action: `editarMeta(id, dados)` — edita e salva
- [x] 5.19 Implementar action: `excluirMeta(id)` — exclui e salva
- [x] 5.20 Implementar action: `atualizarConfig(config)` — atualiza e salva
- [x] 5.21 Implementar selector: `obterSaldoAtual()` — soma receitas - despesas
- [x] 5.22 Implementar selector: `obterReceitasMes(mes)` — total de receitas no mês
- [x] 5.23 Implementar selector: `obterDespesasMes(mes)` — total de despesas no mês
- [x] 5.24 Implementar selector: `obterTransacoesMes(mes)` — lista de transações do mês
- [x] 5.25 Implementar selector: `obterUltimasTransacoes(quantidade)` — últimas N transações

### 6. Componentes shadcn/ui ✅

- [x] 6.1 Criar componente `Button`
- [x] 6.2 Criar componente `Card` (CardHeader, CardContent, CardTitle, CardDescription)
- [x] 6.3 Criar componente `Input`
- [x] 6.4 Criar componente `Badge`
- [x] 6.5 Criar componente `Separator`
- [x] 6.6 Criar componente `Select` (para filtros e formulários)
- [x] 6.7 Criar componente `Dialog` (para modais de confirmação)
- [x] 6.8 Criar componente `Tabs` (para navegação interna)
- [x] 6.9 Criar componente `Tooltip`
- [x] 6.10 Criar componente `DropdownMenu`
- [x] 6.11 Criar componente `Slider` (para ajuste de meses em objetivos)
- [x] 6.12 Criar componente `Switch` (para habilitar/desabilitar objetivos)

### 7. Layout da Aplicação ✅

- [x] 7.1 Criar componente `src/components/layout/sidebar.tsx`
- [x] 7.2 Adicionar logo/título "FinTrack" no topo da sidebar
- [x] 7.3 Adicionar links de navegação: Dashboard, Transações, Categorias, Contas, Cartões, Gráficos, Metas, Exportar, Configurações
- [x] 7.4 Criar componente `src/components/layout/header.tsx`
- [x] 7.5 Adicionar título da página atual no header
- [x] 7.6 Adicionar ícones do lucide-react nos itens do menu
- [x] 7.7 Criar componente `src/components/layout/layout.tsx` que combina sidebar + header + conteúdo
- [x] 7.8 Implementar responsividade: sidebar colapsável em mobile (hamburger menu)
- [x] 7.9 Configurar rotas no App.tsx com React Router

### 8. Página Dashboard

- [ ] 8.1 Criar página `src/pages/Dashboard.tsx`
- [ ] 8.2 Criar componente `src/components/dashboard/saldo-card.tsx`
  - Exibir saldo total consolidado (receitas - despesas)
  - Mostrar ícone de seta para cima (verde) ou para baixo (vermelho)
  - Mostrar variação em relação ao mês anterior
- [ ] 8.3 Criar componente `src/components/dashboard/receitas-despesas-card.tsx`
  - Card dividido: lado esquerdo receitas (verde), lado direito despesas (vermelho)
  - Exibir valor total de cada um no mês atual
  - Mostrar ícones de seta para indicar tendência
- [ ] 8.4 Criar componente `src/components/dashboard/resumo-mensal.tsx`
  - Quantidade de transações no mês
  - Média de gasto por dia
  - Maior transação do mês
  - Percentual de economia (receitas - despesas / receitas)
- [ ] 8.5 Criar componente `src/components/dashboard/ultimas-transacoes.tsx`
  - Lista das últimas 5 transações
  - Mostrar: ícone da categoria, descrição, valor, data
  - Indicador de cor (verde para receita, vermelho para despesa)
  - Para transações parceladas: exibir progresso "5/36" no título
  - Para transações recorrentes: exibir ícone de recorrência
  - Link "Ver todas" para a página de transações
- [ ] 8.6 Criar componente `src/components/dashboard/resumo-categorias.tsx`
  - Top 3 categorias com mais gastos no mês
  - Barra de progresso com porcentagem de cada uma
- [ ] 8.7 Criar componente `src/components/dashboard/alerta-metas.tsx`
  - Mostrar metas que estão atrasadas ou próximas do prazo
  - Indicador visual de progresso
- [ ] 8.7.1 Criar componente `src/components/dashboard/objetivos-personalizados.tsx`
  - Listar objetivos personalizados do usuário (apenas ativos)
  - Exibir: nome, valor alvo, parcela mensal, prazo (em meses ou anos), progresso
  - Barra de progresso com porcentagem
  - Formatação do prazo: meses (< 12) ou anos e meses (ex: "3 anos e 6 meses")
  - Botão para criar novo objetivo
  - Botão para habilitar/desabilitar objetivo
- [ ] 8.8 Montar layout do dashboard com Grid responsivo
- [ ] 8.9 Conectar todos os componentes ao store Zustand
- [ ] 8.10 Tratar estado vazio (primeira vez usando o app)

### 9. Funções de Cálculo

- [ ] 9.1 Criar arquivo `src/lib/calculos.ts`
- [ ] 9.2 Implementar `calcularSaldo(transacoes)` — soma receitas - despesas
- [ ] 9.3 Implementar `calcularReceitasMes(transacoes, mes, ano)` — total receitas no período
- [ ] 9.4 Implementar `calcularDespesasMes(transacoes, mes, ano)` — total despesas no período
- [ ] 9.5 Implementar `calcularVariacaoMes(atual, anterior)` — percentual de variação
- [ ] 9.6 Implementar `calcularMediaGastoDiario(despesas, diasNoMes)` — média diária
- [ ] 9.7 Implementar `calcularMaiorTransacao(transacoes)` — retorna a maior
- [ ] 9.8 Implementar `calcularPercentualEconomia(receitas, despesas)` — (receitas - despesas) / receitas
- [ ] 9.9 Implementar `calcularTopCategorias(transacoes, categorias, limite)` — ranking
- [ ] 9.10 Implementar `formatarMoeda(valor)` — formata para R$ X.XXX,XX
- [ ] 9.11 Implementar `formatarData(data)` — formata para DD/MM/AAAA
- [ ] 9.12 Implementar `formatarParcela(atual, total)` — formata para "5/36"
- [ ] 9.13 Implementar `formatarPrazo(meses)` — formata para "3 anos e 6 meses" ou "8 meses"
- [ ] 9.14 Implementar `calcularParcelaMensal(valorAlvo, meses)` — valorAlvo / meses

### 10. Tema (Claro/Escuro)

- [ ] 10.1 Criar arquivo `src/index.css` com variáveis CSS do tema claro
- [ ] 10.2 Adicionar variáveis CSS do tema escuro com classe `.dark`
- [ ] 10.3 Implementar toggle de tema no header
- [ ] 10.4 Salvar preferência de tema no localStorage
- [ ] 10.5 Aplicar tema ao carregar o app

### 11. Tratamento de Erros

- [ ] 11.1 Criar componente `src/components/ui/error-boundary.tsx`
- [ ] 11.2 Implementar fallback amigável quando ocorrer erro
- [ ] 11.3 Adicionar tratamento de erro nas funções de storage
- [ ] 11.4 Adicionar tratamento de JSON inválido no localStorage

### 12. Testes

- [ ] 12.1 Instalar Vitest + React Testing Library
- [ ] 12.2 Testar funções de storage (criar, ler, salvar, migrar ano)
- [ ] 12.3 Testar funções de cálculo (saldo, médias, variação, parcelas)
- [ ] 12.4 Testar store Zustand (ações e selectors)
- [ ] 12.5 Testar componente Dashboard (renderização com dados mockados)
- [ ] 12.6 Testar componente Dashboard (estado vazio)

---

## Ordem de Execução Sugerida

1. **Tasks 1.1 a 1.13** — Setup do projeto e dependências
2. **Tasks 2.1 a 2.14** — Tipagens
3. **Tasks 3.1 a 3.13** — Utilitários de storage e transações
4. **Tasks 4.1 a 4.4** — Dados iniciais
5. **Tasks 5.1 a 5.28** — Store global
6. **Tasks 6.1 a 6.12** — Componentes UI base
7. **Tasks 7.1 a 7.9** — Layout e navegação ✅
8. **Tasks 9.1 a 9.14** — Funções de cálculo (antes do dashboard)
9. **Tasks 8.1 a 8.10** — Dashboard
10. **Tasks 10.1 a 10.5** — Tema
11. **Tasks 11.1 a 11.4** — Tratamento de erros
12. **Tasks 12.1 a 12.6** — Testes

---

## Entregáveis da Fase 1

- [ ] App rodando com `npm run dev`
- [ ] Dashboard exibindo resumo financeiro
- [ ] Dados persistidos no localStorage (um JSON por ano)
- [ ] Navegação funcional entre telas
- [ ] Tema claro/escuro funcionando
- [ ] Tratamento de estados vazios
- [ ] Testes passando
