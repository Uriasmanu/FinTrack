# Feature: Investimentos FII Simplificado — Conta Mensal

## Status
Implementado

## Data
31/08/2026

## Contexto e Objetivo

- **O que é:** Simplificação da aba de investimentos FII para funcionar como uma "conta" de acompanhamento mensal, onde o usuário registra apenas o básico (ticker, nome, preço da cota, quantidade) e acompanha mês a mês quanto pagou e quanto recebeu de dividendos.
- **Por que existe:** O formulário atual é complexo demais para o uso atual do usuário que apenas compra FIIs e quer acompanhar dividendos mensais.
- **Quem usa:** Investidor individual que compra FIIs e quer simplicidade no registro.
- **Escopo:** Simplificar formulário, adicionar campos de dividendos mensais, criar gráfico comparativo, remover formulários complexos de operação/dividendo.

## História de Usuário

```
Como investidor de FIIs,
quero registrar meus FIIs com apenas ticker, nome, preço da cota e quantidade,
para que eu possa acompanhar mensalmente quanto investi e quanto recebi de dividendos
com um gráfico comparativo.
```

Cenários alternativos:
- Usuário quer editar um FII existente
- Usuário quer excluir um FII sem vínculos
- Usuário quer ver o gráfico de evolução mensal

## Requisitos Funcionais

- [x] RF-01: Formulário de FII com apenas: Ticker, Nome, Preço da Cota, Quantidade de Cotas
- [x] RF-02: Campo "Dia do Dividendo" (dia do mês que cai o dividendo, 1-31)
- [x] RF-03: Campo "Valor do Dividendo por Cota" (quanto rende por cota por mês)
- [x] RF-04: Dashboard com cards: Total Investido, Total Recebido Dividendos, Rendimento Mensal, FIIs Ativos
- [x] RF-05: Gráfico de barras comparando mês a mês: quanto foi investido vs quanto foi recebido de dividendos
- [x] RF-06: Card de cada FII mostra: ticker, nome, preço cota, quantidade, valor total, dividendo mensal estimado
- [x] RF-07: Remover formulários separados de operação e dividendos
- [x] RF-08: Manter possibilidade de editar e excluir FIIs

## Requisitos Não-Funcionais

- **UI/UX Responsivo:** Layout adaptável para mobile, tablet e desktop
- **Performance:** Gráfico renderizado com dados memoizados
- **Validação:** Campos obrigatórios validados com Zod

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/types/index.ts` | Modificar | Simplificar AtivoFii, adicionar campos diaDividendo e valorDividendoMensal |
| `src/stores/useFinanceStore.ts` | Modificar | Adaptar métodos FII para novo modelo simplificado |
| `src/components/investimentos/fii-form.tsx` | Modificar | Formulário simplificado |
| `src/components/investimentos/fii-card.tsx` | Modificar | Card simplificado com info essencial |
| `src/components/investimentos/fii-dashboard.tsx` | Modificar | Dashboard com novos cards |
| `src/components/investimentos/fii-mensal-chart.tsx` | Criar | Gráfico comparativo mensal |
| `src/pages/Investimentos.tsx` | Modificar | Integrar novo modelo |
| `src/lib/calculos-fii.ts` | Modificar | Adaptar cálculos para novo modelo |

## Checklist de Implementação

- [x] Atualizar types (AtivoFii simplificado + novos campos)
- [x] Atualizar store (remover métodos de operação/dividendo)
- [x] Simplificar formulário FII (ticker, nome, preço cota, quantidade, dia dividendo, valor dividendo)
- [x] Simplificar card FII (info essencial + indicadores)
- [x] Criar gráfico mensal comparativo (investido vs dividendos)
- [x] Atualizar dashboard (novos cards)
- [x] Atualizar página Investimentos
- [x] Remover arquivos não utilizados (fii-detalhes, fii-historico-*, fii-preco-teto-calc, fii-operacao-form, fii-dividendo-form)
- [x] Limpar types antigos (OperacaoFii, DividendoFii, IndicadoresFii, etc.)
- [x] Atualizar REQUISITOS.md

## Critérios de Aceite

- [x] CA-01: dado um novo FII, quando preencho ticker, nome, preço cota e quantidade, então o FII é cadastrado com sucesso
- [x] CA-02: dado um FII cadastrado, quando visualizo o card, então vejo ticker, nome, preço, quantidade, valor total e dividendo mensal
- [x] CA-03: dado um FII com dividendos registrados, quando visualizo o gráfico, então vejo comparativo mensal investido vs dividendos
- [x] CA-04: dado um FII, quando clico em excluir, então o FII é removido
- [x] CA-05: quando a tela carrega em mobile, então layout não quebra e elementos são acessíveis

## DDR — Design Decision Record

### DDR-001 - Simplificação do Modelo FII

**Status:** Aceito

**Data:** 31/08/2026

**Contexto:** O formulário atual de FII possui muitos campos (tipo, segmento, perfil risco, indexador, taxa admin, VP, taxa retorno) que não são utilizados pelo usuário no momento. Existem formulários separados para operações e dividendos.

**Decisão:** Simplificar o modelo para: Ticker, Nome, Preço da Cota, Quantidade, Dia do Dividendo, Valor do Dividendo Mensal. Remover formulários complexos.

**Alternativas consideradas:**

### Manter modelo atual
- Prós: Mantém funcionalidade existente
- Contras: Complexidade desnecessária para o uso atual

### Simplificar completamente (escolhida)
- Prós: Usuário registra rápido, foco no que importa
- Contras: Perde indicadores avançados (P/VP, Preço Teto, etc.)

**Consequências:**

### Positivas
- Formulário mais rápido de preencher
- Experiência mais simples e direta
- Gráfico mensal dá visão clara do retorno

### Negativas
- Perde indicadores avançados de análise
- Pode precisar re-adicionar funcionalidades no futuro
