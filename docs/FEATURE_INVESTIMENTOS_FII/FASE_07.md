# FASE 07 — Histórico Consolidado de Dividendos e Gráficos

> **Entrega 7:** Aba "Dividendos" na página Investimentos com tabela consolidada de todos os FIIs e gráfico de evolução mensal de dividendos por cota.

## Objetivo

Fornecer ao usuário uma visão temporal dos dividendos recebidos de todos os FIIs da carteira, permitindo identificar tendências, comparar rendimentos e acompanhar a evolução da renda passiva.

---

## Funcionalidades

- Aba "Dividendos" na página Investimentos
- Tabela consolidada de dividendos de todos os FIIs
- Filtro por FII específico ou "Todos"
- Filtro por período (mês/ano)
- Gráfico de barras de evolução mensal do dividendo por cota
- Gráfico de linha de rendimento acumulado
- Resumo: total de dividendos no período, média mensal, DY médio

---

## Alterações no Backend

Nenhuma. Seletores e funções de cálculo já implementados.

---

## Alterações no Frontend

### Aba de Dividendos (`src/pages/Investimentos.tsx`)

Atualizar a aba "Dividendos" na página:

**Filtros no topo:**
- Select: Todos / FII específico (lista os tickers)
- Select: Período (Mês atual, Últimos 3 meses, Últimos 6 meses, Último ano, Todos)

**Tabela consolidada:**
- Colunas: Competência, FII (ticker), Data Pagamento, Valor/Cota, Qtd Cotas, Total, Recorrente
- Ordenada por competência desc
- Totalizers na última linha: Soma do total recebido

**Gráficos (abaixo da tabela):**

1. **Gráfico de Barras — Evolução Mensal de Dividendos por Cota:**
   - Eixo X: meses
   - Eixo Y: valor por cota (R$)
   - Uma barra por mês, colorida por FII (se selecionado) ou empilhada (todos)

2. **Gráfico de Linha — Rendimento Acumulado:**
   - Eixo X: meses
   - Eixo Y: total acumulado (R$)
   - Linha mostrando crescimento do rendimento ao longo do tempo

**Resumo acima dos gráficos:**
- Total de dividendos no período selecionado
- Média mensal de dividendos
- DY médio ponderado no período
- Mês com maior dividendo

---

## Critérios de Aceite

- [ ] CA-01: aba "Dividendos" exibe tabela com todos os dividendos de todos os FIIs
- [ ] CA-02: filtro por FII mostra apenas dividendos do ativo selecionado
- [ ] CA-03: filtro por período filtra dividendos corretamente
- [ ] CA-04: tabela exibe totalizers na última linha
- [ ] CA-05: gráfico de barras mostra evolução mensal de dividendo por cota
- [ ] CA-06: gráfico de linha mostra rendimento acumulado ao longo do tempo
- [ ] CA-07: resumo mostra total, média mensal e DY médio do período
- [ ] CA-08: gráficos são responsivos e funcionam em mobile
- [ ] CA-09: ao não haver dividendos no período, exibe estado vazio adequado
- [ ] CA-10: dados atualizam ao lançar novo dividendo (volta para Fase 4)

---

## Dependências

```
Depende das Fases 4 e 5 (Dividendos e Dashboard).
```

---

## Valor Entregue

O usuário já pode:
- Ver evolução temporal dos dividendos recebidos
- Comparar rendimentos entre FIIs
- Identificar meses com maiores pagamentos
- Acompanhar crescimento da renda passiva
- Filtrar por período para análises específicas

---

## Pode ir para produção?

```
Sim
```

A visão temporal de dividendos é essencial para investidores que buscam renda passiva consistente.

---

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/Investimentos.tsx` | Modificar | Implementar aba de dividendos |
| `src/components/investimentos/fii-historico-dividendos.tsx` | Modificar | Adicionar filtros e consolidação |
| `src/components/investimentos/fii-dashboard.tsx` | Modificar | Referenciar dados de dividendos |

> **Nota:** Reutilizar padrão de gráficos do `src/pages/Graficos.tsx` (Recharts) para manter consistência visual.
