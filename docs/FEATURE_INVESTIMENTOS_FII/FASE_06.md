# FASE 06 — Detalhes do FII e Calculadora de Preço Teto

> **Entrega 6:** Dialog de detalhes completos de um FII com indicadores, histórico de operações, histórico de dividendos e calculadora de preço teto interativa.

## Objetivo

Fornecer ao usuário uma visão aprofundada de cada ativo FII, concentrando todas as informações e ferramentas de análise em um único dialog. A calculadora de preço teto permite simular cenários de compra.

---

## Funcionalidades

- Dialog `fii-detalhes.tsx` com abas (Tabs)
- Aba "Visão Geral": todos os dados do ativo + indicadores calculados
- Aba "Operações": tabela de histórico de compras/vendas
- Aba "Dividendos": tabela de histórico de dividendos
- Aba "Calculadora": calculadora de preço teto interativa
- Indicadores detalhados: P/VP, DY, YoC, Cap Rate, lucro/prejuízo
- Comparativo visual: Preço Teto vs Preço de Mercado

---

## Alterações no Backend

Nenhuma. Funções de cálculo já implementadas na Fase 5.

---

## Alterações no Frontend

### Dialog de Detalhes (`src/components/investimentos/fii-detalhes.tsx`)

**Estrutura com Tabs:**

```
┌─────────────────────────────────────────────────┐
│  FII - HGLG11 (Galpões Logísticos)        [X]  │
├─────────────────────────────────────────────────┤
│  [Visão Geral] [Operações] [Dividendos] [Calc] │
├─────────────────────────────────────────────────┤
│                                                 │
│  (conteúdo da aba selecionada)                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Aba "Visão Geral":**
- Dados cadastrais: ticker, nome, tipo, segmento, perfil, indexador, taxa adm
- Indicadores calculados em cards:
  - P/VP com badge de status
  - Preço Teto vs Preço de Mercado (indicador visual de barra)
  - DY mensal e DY anual
  - Yield on Cost
  - Lucro/Prejuízo não realizado (valor e %)
  - Valor total da posição
- Observações

**Aba "Operações":**
- `fii-historico-operacoes.tsx` (reutilizado da Fase 3)
- Resumo: total investido, total resgatado, lucro/prejuízo realizado

**Aba "Dividendos":**
- `fii-historico-dividendos.tsx` (reutilizado da Fase 4)
- Resumo: total de dividendos recebidos, DY médio

**Aba "Calculadora":**
- `fii-preco-teto-calc.tsx`

### Calculadora de Preço Teto (`src/components/investimentos/fii-preco-teto-calc.tsx`)

**Interface interativa (padrão类似于 Metas personalizadas):**

- Input: Dividendo Anual Esperado por Cota (R$)
- Input: Taxa de Retorno Desejada (%)
- Resultado em tempo real: Preço Teto = Dividendo Anual / Taxa
- Comparação visual: Preço Teto vs Preço de Mercado atual
- Indicador: "Abaixo do teto" (verde) / "Acima do teto" (vermelho)
- Slider opcional para ajustar valores rapidamente

**Preview em tempo real:**
```
Dividendo Anual: R$ 12,00
Taxa de Retorno: 10%
─────────────────────
Preço Teto: R$ 120,00
Preço Atual: R$ 95,00
Status: ✅ Abaixo do teto (26% de desconto)
```

---

## Critérios de Aceite

- [ ] CA-01: ao clicar "Ver Detalhes" no card, abre dialog com abas
- [ ] CA-02: aba "Visão Geral" exibe todos os dados cadastrais do ativo
- [ ] CA-03: aba "Visão Geral" exibe todos os indicadores calculados
- [ ] CA-04: aba "Operações" exibe tabela com histórico completo de compras/vendas
- [ ] CA-05: aba "Dividendos" exibe tabela com histórico completo de dividendos
- [ ] CA-06: aba "Calculadora" permite ajustar dividendo anual e taxa de retorno
- [ ] CA-07: calculadora atualiza Preço Teto em tempo real a cada mudança de input
- [ ] CA-08: calculadora compara Preço Teto com Preço de Mercado visualmente
- [ ] CA-09: dialog é responsivo e funciona em mobile (abas viram scroll horizontal)
- [ ] CA-10: ao fechar dialog, dados permanecem consistentes

---

## Dependências

```
Depende das Fases 3 e 4 (Operações e Dividendos).
```

---

## Valor Entregue

O usuário já pode:
- Analisar profundamente cada FII da carteira
- Ver todos os indicadores em um lugar centralizado
- Simular cenários de compra com a calculadora de preço teto
- Acompanhar histórico completo de operações e dividendos por ativo
- Tomar decisões de compra/venda baseadas em indicadores

---

## Pode ir para produção?

```
Sim
```

A calculadora de preço teto é uma ferramenta de decisão muito valiosa para investidores em FIIs.

---

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/investimentos/fii-detalhes.tsx` | Criar | Dialog de detalhes com abas |
| `src/components/investimentos/fii-preco-teto-calc.tsx` | Criar | Calculadora de preço teto |
| `src/components/investimentos/fii-historico-operacoes.tsx` | Reutilizar | Tabela de operações na aba |
| `src/components/investimentos/fii-historico-dividendos.tsx` | Reutilizar | Tabela de dividendos na aba |
| `src/components/investimentos/fii-card.tsx` | Modificar | Adicionar "Ver Detalhes" no menu |
