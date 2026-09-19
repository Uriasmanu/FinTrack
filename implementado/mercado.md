# Feature: Mercado — Registro de Compras e Comparativo de Preços

## Status
Especificado (aguardando implementação)

## Data
19/09/2026

## Contexto e Objetivo

- **O que é:** Módulo para registrar compras de mercado (data + lista de itens com nome, preço unitário e quantidade) e acompanhar a variação de preço de cada item mês a mês, além do total gasto.
- **Por que existe:** O usuário quer saber quanto gastou no mercado e se o preço dos produtos que compra está subindo ou descendo, comparando com o mês anterior.
- **Quem usa:** Usuário do FinTrack que faz compras de mercado recorrentes e quer acompanhar preços e gastos.
- **Escopo:** Cadastro de compras com itens, dashboard de totais (mês atual vs anterior), lista comparativa de preço unitário por item (mês atual vs anterior). Fora de escopo: gerar transação/despesa no extrato, catálogo de produtos, código de barras, integração com preços de mercado externos.

## Análise dos Documentos de Referência

- `docs/REQUISITOS.md`: documento geral do FinTrack, sem seção prévia sobre "Mercado".
- `implementado/investimentos-fii-simplificado.md`: padrão de referência mais próximo — módulo paralelo (não afeta saldo), com formulário simplificado, cards de resumo e gráfico mensal. A feature Mercado segue a mesma filosofia de simplicidade e separação do extrato principal.
- Código-fonte lido: `src/types/index.ts`, `src/stores/useFinanceStore.ts`, `src/components/investimentos/fii-mensal-chart.tsx`, `src/components/investimentos/fii-card.tsx` (padrões de nomenclatura, imutabilidade de estado, persistência via `salvar()`).

## História de Usuário

```
Como usuário do FinTrack,
quero registrar minhas compras de mercado com os itens comprados (nome, preço e quantidade),
para que eu possa acompanhar quanto gastei e se o preço dos produtos está subindo em relação ao mês anterior.
```

Cenários alternativos:
- Usuário registra uma compra sem nenhum item preenchido (deve bloquear salvar — compra precisa de ao menos 1 item válido)
- Usuário registra um item com nome que já foi comprado em meses anteriores, mas com grafia diferente (ex.: "arroz" vs "Arroz ") — nome é normalizado (trim + lowercase) para fins de comparação, mas exibido como digitado
- Usuário ainda não tem nenhuma compra registrada no mês atual (dashboard e comparação exibem estado vazio)
- Usuário tem item comprado neste mês que não existia no mês anterior (exibe badge "novo", sem percentual de variação)
- Usuário edita ou exclui uma compra existente (recalcula totais e comparação automaticamente)
- Usuário compra em app tipo iFood com preço escalonado por quantidade (ex.: de 5 unidades de arroz, 3 saem a um preço e 2 a outro, por promoção) — registra o mesmo item em duas linhas na mesma compra, cada uma com sua quantidade e preço unitário

## Requisitos Funcionais

- [ ] RF-01: O sistema permite cadastrar uma compra de mercado com campo de data (obrigatório) e uma lista de itens
- [ ] RF-02: Cada item da compra possui nome (obrigatório), preço unitário (obrigatório, > 0) e quantidade (obrigatório, > 0)
- [ ] RF-03: O formulário permite adicionar e remover linhas de item dinamicamente, exibindo o subtotal (preço × quantidade) de cada linha em tempo real
- [ ] RF-04: O formulário exibe o total da compra (soma dos subtotais dos itens) em tempo real
- [ ] RF-05: O sistema bloqueia o salvamento de uma compra sem nenhum item válido
- [ ] RF-06: O sistema permite editar uma compra existente (data, itens, observações)
- [ ] RF-07: O sistema permite excluir uma compra existente, com diálogo de confirmação
- [ ] RF-08: O sistema exibe a listagem de compras (mais recente primeiro), cada uma com data, quantidade de itens e total
- [ ] RF-09: O dashboard exibe o total gasto no mês atual, o total gasto no mês anterior, a variação percentual entre eles e o número de compras no mês atual
- [ ] RF-10: O sistema exibe uma lista comparativa por item: para cada item comprado no mês atual, mostra o preço médio unitário do mês atual e do mês anterior
- [ ] RF-11: O preço médio unitário de um item no mês é calculado como média ponderada por quantidade (valor total gasto no item no mês ÷ quantidade total comprada no mês), considerando todas as ocorrências daquele item em todas as compras do mês
- [ ] RF-12: A comparação de item agrupa por nome normalizado (trim + lowercase), exibindo o nome como digitado na ocorrência mais recente
- [ ] RF-13: Itens sem correspondência no mês anterior exibem indicador "novo" em vez de percentual de variação
- [ ] RF-14: A variação de preço é exibida com indicador visual de alta, baixa ou estabilidade (seta/cor) e percentual
- [ ] RF-15: O registro de compras de mercado não gera transação no extrato nem altera saldo de contas
- [ ] RF-16: Ao não haver compras no mês atual, o dashboard e a lista comparativa exibem estado vazio com mensagem orientativa
- [ ] RF-17: O formulário permite adicionar o mesmo nome de item em mais de uma linha dentro da mesma compra, cada linha com sua própria quantidade e preço unitário (suporte a preço escalonado/promocional por faixa de quantidade, comum em compras via apps como iFood)

## Requisitos Não-Funcionais

- **Performance:** cálculos de agregação (totais e comparação por item) memoizados (`useMemo`) para evitar recomputação a cada render
- **Persistência:** compras armazenadas em `data/fintrack.json` via `comprasMercado: CompraMercado[]`, seguindo o mesmo fluxo de `salvar()` do `useFinanceStore`
- **Validação:** campos obrigatórios e valores numéricos positivos validados com Zod (`compra-form.tsx`), consistente com os demais formulários do app
- **Acessibilidade:** inputs de item com labels associados; botões de adicionar/remover item com área mínima de toque em mobile

### UI/UX Responsivo — Obrigatório

- [ ] Formulário de compra com lista de itens não quebra em mobile (375px): campos empilham verticalmente, botão remover item permanece acessível
- [ ] Dashboard de cards (Total Mês Atual, Total Mês Anterior, Variação, Nº Compras) usa grid responsivo (2 colunas mobile, 4 colunas desktop), mesmo padrão do dashboard de Investimentos
- [ ] Lista comparativa por item vira lista/cards empilhados em mobile e tabela em telas maiores (≥768px)
- [ ] Elementos de toque (adicionar item, remover item, editar, excluir) com área mínima de 44x44px em mobile

## Análise da Aplicação

- **Arquitetura:** SPA React + Zustand (estado global) + Express (persistência em `data/fintrack.json`). Sem mudanças de arquitetura — Mercado segue o mesmo modelo dos demais domínios (transações, metas, FII).
- **Padrões em uso:** cada domínio tem: type em `types/index.ts`, slice de estado + ações CRUD em `useFinanceStore.ts` (imutável, com rollback em caso de falha ao salvar), pasta de componentes em `components/{dominio}/`, página em `pages/{Dominio}.tsx`, rota registrada em `App.tsx` e item em `sidebar.tsx`.
- **Fluxo de dados:** formulário (React Hook Form + Zod) → ação do store → merge imutável no `DadosApp` → `salvar()` (PUT para o backend Express) → re-render via seletores do Zustand.
- **Contratos de API:** não há endpoint novo — persistência via `PUT /api/data` já existente (arquivo JSON único), sem alteração no `server.js`.

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/types/index.ts` | Modificar | Adicionar `ItemMercado`, `CompraMercado` e `comprasMercado` em `DadosApp` |
| `src/stores/useFinanceStore.ts` | Modificar | Adicionar estado `comprasMercado` e ações `adicionarCompraMercado`, `editarCompraMercado`, `excluirCompraMercado` |
| `src/lib/calculos-mercado.ts` | Criar | Funções puras: total da compra, total por mês, comparação de preço médio por item entre meses |
| `src/components/mercado/compra-form.tsx` | Criar | Formulário de compra com itens dinâmicos |
| `src/components/mercado/compra-card.tsx` | Criar | Card de uma compra com ações editar/excluir |
| `src/components/mercado/mercado-dashboard.tsx` | Criar | Cards de resumo (total mês atual/anterior, variação, nº compras) |
| `src/components/mercado/itens-comparacao.tsx` | Criar | Lista/tabela comparativa de preço unitário por item |
| `src/pages/Mercado.tsx` | Criar | Página principal, orquestra dashboard + form + lista de compras + comparação |
| `src/App.tsx` | Modificar | Registrar rota `/mercado` |
| `src/components/layout/sidebar.tsx` | Modificar | Adicionar item de menu "Mercado" (ícone `ShoppingCart`) |
| `docs/REQUISITOS.md` | Modificar | Documentar nova seção "Mercado" após implementação |

## Problemas e Impedimentos

### Problemas Técnicos
- Nenhum acoplamento com módulos existentes além do consumo do padrão de store/persistência já estabelecido.

### Ambiguidades nos Requisitos
- Nenhuma pendente — todas as decisões relevantes (estrutura compra+itens, preço unitário, não afeta saldo, comparação por preço unitário médio por item) foram validadas com o usuário durante o brainstorming.

### Riscos
- Nenhum risco de regressão em outros módulos: `comprasMercado` é um array novo e independente em `DadosApp`, sem relação com `transacoes`.

## Critérios de Aceite

- [ ] CA-01: dado o formulário de compra, quando preencho data e ao menos um item (nome, preço, quantidade) e salvo, então a compra é criada e aparece na listagem
- [ ] CA-02: dado o formulário de compra, quando adiciono múltiplos itens, então vejo o subtotal de cada item e o total geral atualizados em tempo real
- [ ] CA-03: dado o formulário de compra sem nenhum item preenchido, quando tento salvar, então o sistema bloqueia e exibe mensagem de validação
- [ ] CA-04: dado que existem compras no mês atual e no mês anterior, quando acesso a página Mercado, então o dashboard mostra total do mês atual, total do mês anterior e a variação percentual corretamente calculados
- [ ] CA-05: dado um item comprado em ambos os meses com preços diferentes, quando visualizo a lista comparativa, então vejo o preço médio de cada mês e a variação percentual com indicador de alta/baixa
- [ ] CA-06: dado um item comprado apenas no mês atual, quando visualizo a lista comparativa, então vejo o indicador "novo" em vez de percentual
- [ ] CA-07: dado um item comprado duas vezes no mesmo mês com preços e quantidades diferentes (ex.: 3 un a R$5 e 2 un a R$4), quando visualizo a comparação, então o preço do mês é a média ponderada por quantidade (no exemplo, R$23 ÷ 5 = R$4,60), não a média simples dos preços unitários
- [ ] CA-08: dado uma compra existente, quando clico em excluir e confirmo, então a compra é removida e os totais/comparação são recalculados
- [ ] CA-09: dado uma compra existente, quando edito data ou itens, então a alteração é persistida e refletida na listagem, dashboard e comparação
- [ ] CA-10: dado que uma compra de mercado foi criada, quando verifico o extrato de transações e o saldo das contas, então nenhum deles é afetado
- [ ] CA-11: quando não há compras no mês atual, então dashboard e comparação exibem estado vazio com mensagem orientativa, sem erro
- [ ] CA-12: quando a tela carrega em mobile (375px), então formulário, dashboard e lista comparativa permanecem utilizáveis sem quebra de layout

## Plano de Implementação (Passo a Passo)

```
Passo 1: Modelagem de dados
  - O que fazer: adicionar types ItemMercado e CompraMercado, incluir comprasMercado em DadosApp
  - Arquivo(s): src/types/index.ts
  - Como validar: build TypeScript sem erros

Passo 2: Store e persistência
  - O que fazer: adicionar estado comprasMercado e ações adicionarCompraMercado, editarCompraMercado, excluirCompraMercado (seguindo padrão imutável + rollback do useFinanceStore)
  - Arquivo(s): src/stores/useFinanceStore.ts
  - Como validar: ações refletem no arquivo data/fintrack.json após chamadas

Passo 3: Funções de cálculo
  - O que fazer: implementar cálculo de total de compra, total por mês, agrupamento de itens por nome normalizado com preço médio ponderado por quantidade (valor total ÷ quantidade total) por mês, cálculo de variação percentual
  - Arquivo(s): src/lib/calculos-mercado.ts
  - Como validar: cobrir com casos manuais (item repetido no mês com preços/quantidades diferentes, item novo, mês vazio)

Passo 4: Formulário de compra
  - O que fazer: criar compra-form.tsx com data + lista dinâmica de itens (adicionar/remover linha), validação Zod, subtotal e total em tempo real
  - Arquivo(s): src/components/mercado/compra-form.tsx
  - Como validar: criar compra com múltiplos itens manualmente na UI

Passo 5: Card de compra e listagem
  - O que fazer: criar compra-card.tsx (exibição + editar/excluir) e integrar na página
  - Arquivo(s): src/components/mercado/compra-card.tsx
  - Como validar: editar e excluir uma compra existente

Passo 6: Dashboard de resumo
  - O que fazer: criar mercado-dashboard.tsx com cards de total mês atual, mês anterior, variação e nº de compras
  - Arquivo(s): src/components/mercado/mercado-dashboard.tsx
  - Como validar: comparar valores exibidos com soma manual das compras

Passo 7: Comparação por item
  - O que fazer: criar itens-comparacao.tsx consumindo calculos-mercado.ts para listar itens do mês atual com preço médio atual vs anterior e indicador de variação/novo
  - Arquivo(s): src/components/mercado/itens-comparacao.tsx
  - Como validar: cadastrar mesmo item em dois meses com preços diferentes e conferir variação exibida

Passo 8: Página e integração de rota/menu
  - O que fazer: criar Mercado.tsx orquestrando os componentes, registrar rota /mercado e item na sidebar
  - Arquivo(s): src/pages/Mercado.tsx, src/App.tsx, src/components/layout/sidebar.tsx
  - Como validar: navegar até /mercado pela sidebar e ver a página completa

Passo 9: Responsividade
  - O que fazer: revisar todos os componentes novos nos breakpoints 375px, 768px, 1024px, 1440px
  - Arquivo(s): todos os componentes de mercado/
  - Como validar: inspecionar via DevTools em cada breakpoint

Passo 10: Documentação
  - O que fazer: atualizar docs/REQUISITOS.md com a nova seção "Mercado" e mover este arquivo para status "Implementado"
  - Arquivo(s): docs/REQUISITOS.md, implementado/mercado.md
  - Como validar: revisão de coerência do documento
```

## Rollout e Observabilidade

- **Estratégia de entrega:** implementação direta, sem feature flag (app de uso pessoal, sem usuários concorrentes)
- **Como monitorar:** verificação manual pós-deploy: cadastrar compra de teste, conferir dashboard e comparação, conferir que `data/fintrack.json` foi atualizado
- **Plano de rollback:** reverter commit da feature; `comprasMercado` é aditivo e não altera estruturas existentes, então rollback não afeta outros módulos

## Definição de Pronto (DoD)

- [ ] Todos os critérios de aceite verificados manualmente
- [ ] Código revisado (auto-revisão documentada)
- [ ] `docs/REQUISITOS.md` atualizado com a seção Mercado
- [ ] Sem warnings ou erros de TypeScript/ESLint introduzidos
- [ ] Seção **Histórico de Correções** de `docs/spec.md` atualizada ao final da implementação

## DDR — Design Decision Record

### DDR-001 - Mercado como módulo paralelo (não gera transação)

**Status:** Aceito

**Data:** 19/09/2026

**Contexto:** Compras de mercado poderiam ser modeladas como transações de despesa (reaproveitando o extrato existente) ou como um domínio próprio e independente, seguindo o precedente do módulo de Investimentos FII.

**Decisão:** Modelar como domínio independente (`comprasMercado`), sem gerar transação nem afetar saldo de contas.

**Alternativas consideradas:**

### Gerar transação de despesa por compra
- Prós: reaproveita extrato e saldo já existentes; um único total gasto para toda a vida financeira
- Contras: perde a granularidade por item (o extrato tem uma transação por compra, não por produto); exigiria vincular conta/categoria obrigatoriamente, aumentando o formulário; não é o que o usuário pediu (controle paralelo, como FII)

### Domínio independente, paralelo ao extrato (escolhida)
- Prós: granularidade total por item, formulário simples focado só no que interessa (nome, preço, quantidade), consistente com o precedente de Investimentos FII já validado no projeto
- Contras: o gasto de mercado não aparece automaticamente no saldo consolidado do Dashboard — se o usuário quiser isso no futuro, precisará lançar também uma transação manual ou pedir integração futura

**Consequências:**

### Positivas
- Simplicidade de formulário e foco na comparação de preços por item, que é o objetivo central da feature
- Nenhum risco de regressão em cálculos de saldo/extrato existentes

### Negativas
- Duplicidade potencial de lançamento caso o usuário também queira ver o gasto de mercado refletido no saldo — decisão consciente, alinhada com o padrão já aceito para FII

### DDR-002 - Comparação de preço por média ponderada por quantidade e nome normalizado

**Status:** Aceito

**Data:** 19/09/2026 (atualizado em 19/09/2026 para média ponderada após identificação de preços escalonados/promocionais)

**Contexto:** É necessário decidir como agrupar itens com o mesmo nome (possivelmente digitados com variação de maiúsculas/espaços) e qual valor representa o "preço do mês" quando um item é comprado mais de uma vez no período. O usuário relatou que compras via apps como iFood frequentemente têm preço escalonado por quantidade (ex.: de 5 unidades de arroz, 3 saem a um preço promocional e 2 a outro preço) — nesses casos, o mesmo item aparece em duas linhas na mesma compra, cada uma com sua própria quantidade e preço unitário.

**Decisão:** Agrupar itens por nome normalizado (trim + lowercase) e calcular o "preço do mês" como média ponderada por quantidade: soma do valor total gasto no item (preço × quantidade de cada linha) dividida pela soma das quantidades, considerando todas as linhas/compras daquele item no mês.

**Alternativas consideradas:**

### Usar o último preço do mês
- Prós: mais simples de calcular, reflete o preço mais recente
- Contras: ignora variações dentro do mesmo mês (ex.: comprou uma vez mais barato e outra mais caro); não representa corretamente cenários de preço escalonado

### Média simples dos preços unitários (descartada)
- Prós: cálculo mais simples (soma dos preços unitários ÷ número de ocorrências)
- Contras: distorce o resultado quando as quantidades de cada ocorrência são diferentes — no exemplo do arroz (3 un a R$5 + 2 un a R$4), a média simples daria R$4,50, mas o valor real pago por unidade foi R$4,60 (R$23 ÷ 5 unidades)

### Média ponderada por quantidade (escolhida)
- Prós: representa exatamente o custo médio real pago por unidade no período, correto mesmo com preços escalonados/promocionais dentro da mesma compra
- Contras: cálculo levemente mais complexo (acumular valor total e quantidade total antes de dividir, em vez de média simples)

**Consequências:**

### Positivas
- Comparação de preço fiel ao valor realmente pago por unidade, mesmo com descontos por faixa de quantidade
- Suporta o cenário de preço escalonado sem exigir campo extra no modelo — basta o usuário lançar o item em múltiplas linhas na mesma compra
- Nome exibido ao usuário permanece "amigável" (última grafia usada), enquanto o agrupamento interno é normalizado

### Negativas
- Erros de digitação que gerem nomes muito diferentes (ex.: "Arroz" vs "Arroz Tipo 1") não serão agrupados automaticamente — aceito como limitação conhecida, sem catálogo de produtos neste escopo
