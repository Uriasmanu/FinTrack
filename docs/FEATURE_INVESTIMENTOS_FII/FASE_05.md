# FASE 05 — Dashboard e Cards da Carteira

> **Entrega 5:** Visão consolidada da carteira de FIIs com 4 cards de resumo e cards individuais com todos os indicadores calculados.

## Objetivo

Entregar ao usuário um painel completo e visual da sua carteira de investimentos em FIIs, com indicadores consolidados e alertas automáticos baseados em regras de negócio (P/VP, ágio, dividendos não recorrentes).

---

## Funcionalidades

- Dashboard consolidado `fii-dashboard.tsx` com 4 cards de resumo
- Cards individuais `fii-card.tsx` com todos os indicadores
- Indicadores calculados: P/VP, DY mensal, DY anual, Yield on Cost, Preço Teto
- Status de preço: desconto, justo, ágio moderado, ágio excessivo
- Alerta de venda (P/VP > 1,20)
- Alerta de ganho não recorrente
- Badge de tipo com cores
- Badge de status de preço com cores
- Menu de ações completo no card
- Tabs na página: Carteira | Dividendos

---

## Alterações no Backend

### Funções de Cálculo (`src/lib/calculos-fii.ts`)

Criar arquivo com todas as funções puras:

```typescript
// Preço Teto (Método Barsi Adaptado)
export function calcularPrecoTeto(
  dividendoAnualPorCota: number,
  taxaRetornoDesejada: number
): number {
  return dividendoAnualPorCota / taxaRetornoDesejada;
}

// P/VP
export function calcularPvp(
  precoMercado: number,
  valorPatrimonial: number
): number {
  return precoMercado / valorPatrimonial;
}

// DY Mensal
export function calcularDyMensal(
  dividendoMensal: number,
  precoMercado: number
): number {
  return (dividendoMensal / precoMercado) * 100;
}

// DY Anual (últimos 12 meses)
export function calcularDyAnual(
  dividendos12Meses: number,
  precoMercado: number
): number {
  return (dividendos12Meses / precoMercado) * 100;
}

// Yield on Cost
export function calcularYoc(
  dividendoAnualPorCota: number,
  precoMedioCompra: number
): number {
  return (dividendoAnualPorCota / precoMedioCompra) * 100;
}

// Cap Rate
export function calcularCapRate(
  receitaOperacionalAnual: number,
  valorAvaliacaoImoveis: number
): number {
  return (receitaOperacionalAnual / valorAvaliacaoImoveis) * 100;
}

// Valor total da posição
export function calcularValorTotalPosicao(
  cotasAtuais: number,
  precoAtualMercado: number
): number {
  return cotasAtuais * precoAtualMercado;
}

// Lucro/prejuízo não realizado
export function calcularLucroPrejuizo(
  cotasAtuais: number,
  precoAtual: number,
  precoMedio: number
): { valor: number; percentual: number } {
  const valor = (precoAtual - precoMedio) * cotasAtuais;
  const percentual = ((precoAtual - precoMedio) / precoMedio) * 100;
  return { valor, percentual };
}

// Total de dividendos recebidos em um ano
export function calcularTotalDividendosAno(
  dividendos: DividendoFii[],
  ano: number
): number {
  return dividendos
    .filter((d) => d.competencia.startsWith(String(ano)))
    .reduce((soma, d) => soma + d.totalRecebido, 0);
}

// Valor total da carteira
export function calcularValorCarteiraFii(ativos: AtivoFii[]): number {
  return ativos.reduce(
    (soma, a) => soma + a.cotasAtuais * a.precoAtualMercado,
    0
  );
}

// DY médio ponderado da carteira
export function calcularDyMedioCarteira(
  ativos: AtivoFii[],
  indicadoresPorAtivo: Record<string, IndicadoresFii>
): number {
  const valorTotal = calcularValorCarteiraFii(ativos);
  if (valorTotal === 0) return 0;
  const somaPonderada = ativos.reduce((soma, a) => {
    const valorAtivo = a.cotasAtuais * a.precoAtualMercado;
    return soma + indicadoresPorAtivo[a.id].dyAnual * valorAtivo;
  }, 0);
  return somaPonderada / valorTotal;
}
```

### Função de Agregação

```typescript
export function calcularIndicadoresFii(
  ativo: AtivoFii,
  dividendos: DividendoFii[]
): IndicadoresFii {
  // Cálculo de P/VP
  const pVp = calcularPvp(ativo.precoAtualMercado, ativo.valorPatrimonialCota);

  // Dividendos dos últimos 12 meses
  const dividendos12Meses = calcularDividendosUltimos12Meses(dividendos);
  const dividendoAnualPorCota = dividendos12Meses.reduce(
    (soma, d) => soma + d.valorPorCota,
    0
  );
  const dividendoMensalMaisRecente = dividendos
    .filter((d) => d.recorrente)
    .sort((a, b) => b.competencia.localeCompare(a.competencia))[0]
    ?.valorPorCota ?? 0;

  // Preço Teto
  const precoTeto =
    ativo.taxaRetornoDesejada > 0
      ? calcularPrecoTeto(dividendoAnualPorCota, ativo.taxaRetornoDesejada)
      : 0;

  // DY
  const dyMensal = calcularDyMensal(
    dividendoMensalMaisRecente,
    ativo.precoAtualMercado
  );
  const dyAnual = calcularDyAnual(
    dividendos12Meses.reduce((soma, d) => soma + d.totalRecebido, 0),
    ativo.precoAtualMercado
  );

  // Yield on Cost
  const yieldOnCost = calcularYoc(dividendoAnualPorCota, ativo.precoMedioCompra);

  // Status do preço (regras por tipo)
  const statusPreco = calcularStatusPreco(ativo.tipo, pVp);

  // Alertas
  const alertaVenda = pVp > 1.20;
  const alertaGanhoNaoRecorrente = verificarGanhoNaoRecorrente(
    dividendos,
    dividendoMensalMaisRecente
  );

  // Lucro/prejuízo
  const { valor: lucroPrejuizoValor, percentual: lucroPrejuizoPercentual } =
    calcularLucroPrejuizo(
      ativo.cotasAtuais,
      ativo.precoAtualMercado,
      ativo.precoMedioCompra
    );

  return {
    pVp,
    precoTeto,
    dyMensal,
    dyAnual,
    yieldOnCost,
    statusPreco,
    alertaVenda,
    alertaGanhoNaoRecorrente,
    lucroPrejuizoValor,
    lucroPrejuizoPercentual,
  };
}
```

### Classificação de `statusPreco`

| Condição | statusPreco |
|---|---|
| Papel e P/VP ≤ 1,00 | `desconto` |
| Tijolo e P/VP entre 0,90 e 1,00 | `desconto` |
| Tijolo e P/VP entre 1,00 e 1,05 | `justo` |
| Papel e P/VP entre 1,00 e 1,15 | `justo` |
| P/VP entre 1,15 e 1,20 (qualquer tipo) | `agio_moderado` |
| P/VP > 1,20 | `agio_excessivo` → `alertaVenda: true` |

---

## Alterações no Frontend

### Dashboard (`src/components/investimentos/fii-dashboard.tsx`)

4 cards de resumo no padrão visual do Dashboard principal:

1. **Valor Total da Carteira** — Σ cotasAtuais × precoAtualMercado
2. **DY Médio Ponderado** — média ponderada do DY anual de todos os ativos
3. **Total de Dividendos no Ano** — soma dos dividendos recebidos no ano corrente
4. **FIIs Ativos** — quantidade de ativos com `ativo: true`

### Card Completo (`src/components/investimentos/fii-card.tsx`)

Atualizar o card simplificado com todos os indicadores:

- **Header:** Ticker + nome + badge de tipo
- **Linha 1:** Preço médio | Preço atual | P/VP
- **Linha 2:** Badge de status (verde=desconto, amarelo=justo, laranja=ágio moderado, vermelho=ágio excessivo)
- **Linha 3:** DY mensal | DY anual (12m) | Yield on Cost
- **Linha 4:** Preço Teto vs preço de mercado (indicador visual)
- **Linha 5:** Cotas atuais | Valor total da posição
- **Linha 6:** Lucro/prejuízo não realizado (valor e %)
- **Alertas:** aviso de ágio excessivo, aviso de ganho não recorrente
- **Menu:** Editar, Registrar Operação, Registrar Dividendo, Ver Detalhes, Excluir

### Página (`src/pages/Investimentos.tsx`)

Atualizar com:
- `fii-dashboard.tsx` no topo
- Tabs: **Carteira** (grid de `fii-card.tsx`) | **Dividendos** (histórico consolidado — Fase 7)

---

## Critérios de Aceite

- [ ] CA-01: dashboard exibe valor total da carteira correto
- [ ] CA-02: dashboard exibe DY médio ponderado correto
- [ ] CA-03: dashboard exibe total de dividendos recebidos no ano corrente
- [ ] CA-04: dashboard exibe quantidade de FIIs ativos
- [ ] CA-05: card exibe P/VP calculado = precoAtualMercado / valorPatrimonialCota
- [ ] CA-06: card exibe DY mensal = (dividendoMensal / precoAtual) × 100
- [ ] CA-07: card exibe DY anual = (Σ dividendos 12m / precoAtual) × 100
- [ ] CA-08: card exibe Yield on Cost = (dividendoAnual / precoMedio) × 100
- [ ] CA-09: card exibe Preço Teto = dividendoAnual / taxaRetornoDesejada
- [ ] CA-10: badge de status mostra "desconto" quando P/VP < 1,00 (tijolo: 0,90-1,00)
- [ ] CA-11: badge de status mostra "justo" quando P/VP = 1,00-1,05 (tijolo) ou 1,00-1,15 (papel)
- [ ] CA-12: badge de status mostra "ágio moderado" quando P/VP = 1,15-1,20
- [ ] CA-13: badge de status mostra "ágio excessivo" quando P/VP > 1,20
- [ ] CA-14: alerta de venda aparece quando P/VP > 1,20
- [ ] CA-15: alerta de ganho não recorrente aparece quando dividendo recente é ≥ 50% acima da média
- [ ] CA-16: lucro/prejuízo calculado = (precoAtual - precoMedio) × cotas
- [ ] CA-17: dados do dashboard atualizam ao adicionar operação ou dividendo
- [ ] CA-18: layout responsivo — dashboard e cards se adaptam a mobile/tablet/desktop

---

## Dependências

```
Depende das Fases 2, 3 e 4 (CRUD, Operações e Dividendos).
```

---

## Valor Entregue

O usuário já pode:
- Ver panorama consolidado da carteira de FIIs
- Acompanhar todos os indicadores de cada ativo em um card
- Receber alertas automáticos de ágio excessivo e dividendos não recorrentes
- Comparar Preço Teto com preço de mercado visualmente
- Navegar entre visão de carteira e visão de dividendos

---

## Pode ir para produção?

```
Sim
```

Esta é a entrega de maior valor visual. O usuário tem uma visão completa e acionável da sua carteira.

---

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/lib/calculos-fii.ts` | Criar | Funções puras de cálculo |
| `src/components/investimentos/fii-dashboard.tsx` | Criar | Dashboard consolidado |
| `src/components/investimentos/fii-card.tsx` | Modificar | Adicionar todos os indicadores |
| `src/pages/Investimentos.tsx` | Modificar | Adicionar dashboard e tabs |
