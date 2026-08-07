# FASE 03 — Operações de Compra/Venda com Preço Médio

> **Entrega 3:** Usuário pode registrar compras e vendas de cotas de FIIs, com recálculo automático do preço médio de compra e controle de posição.

## Objetivo

Permitir que o usuário registre suas operações de compra e venda de cotas, mantendo um preço médio ponderado automaticamente. É o momento em que a feature ganha utilidade prática para controle de carteira real.

---

## Funcionalidades

- Formulário de operação `fii-operacao-form.tsx` (compra/venda)
- Validação de venda: quantidade não pode exceder `cotasAtuais`
- Recálculo automático do preço médio ponderado a cada compra
- Diluição da taxa B3 no preço médio (se informada)
- Atualização automática de `cotasAtuais` a cada operação
- Marca automática `ativo: false` quando posição zera
- Tabela de histórico de operações `fii-historico-operacoes.tsx`
- Card do FII atualizado com preço médio e cotas atuais
- Indicadores calculados no card: P/VP, lucro/prejuízo não realizado

---

## Alterações no Backend

Nenhuma. Store já implementado na Fase 1 com regras de preço médio e validação de venda.

---

## Alterações no Frontend

### Formulário de Operação (`src/components/investimentos/fii-operacao-form.tsx`)

**Campos:**
- Tipo (select: Compra / Venda)
- Data (input date, padrão: data atual)
- Quantidade de Cotas (input numérico, mínimo 1)
- Preço Unitário (input numérico, mínimo 0.01)
- Taxa B3 (input numérico, opcional — diluída no preço médio)
- Corretora (input, opcional)
- Observações (textarea)

**Schema Zod:**

```typescript
const operacaoSchema = z.object({
  tipo: z.enum(["compra", "venda"]),
  data: z.string().min(1, "Data é obrigatória"),
  quantidade: z.number().min(1, "Mínimo 1 cota"),
  precoUnitario: z.number().min(0.01, "Preço deve ser maior que 0"),
  taxaB3: z.number().min(0).optional().nullable(),
  corretora: z.string().optional(),
  observacoes: z.string().optional(),
});
```

**Validação dinâmica:**
- Se tipo = "venda": `quantidade ≤ cotasAtuais` do ativo

**Ao submeter:**
- Se tipo = "compra": chamar `adicionarOperacaoFii` que recalcula preço médio
- Se tipo = "venda": chamar `adicionarOperacaoFii` que decrementa cotas

### Tabela de Histórico (`src/components/investimentos/fii-historico-operacoes.tsx`)

- Tabela com colunas: Data, Tipo (badge verde/vermelho), Quantidade, Preço Unitário, Taxa B3, Corretora
- Ordenada da mais recente para a mais antiga
- Badge de tipo: "Compra" (verde) / "Venda" (vermelho)
- Exibida dentro do dialog de detalhes do FII (Fase 6) ou como seção na página

### Card Atualizado (`src/components/investimentos/fii-card.tsx`)

Adicionar ao card simplificado da Fase 2:
- Preço médio de compra
- Preço atual de mercado (campo editável ou exibido)
- Cotas atuais
- Valor total da posição (cotas × preço atual)
- Lucro/prejuízo não realizado (valor e %)
- P/VP (se VP > 0)

### Botão de Operação

Adicionar ao menu de ações do card: "Registrar Operação" → abre `fii-operacao-form.tsx`

---

## Critérios de Aceite

- [ ] CA-01: ao clicar "Registrar Operação" no card, abre dialog com formulário
- [ ] CA-02: ao selecionar tipo "Compra", todos os campos são habilitados
- [ ] CA-03: ao selecionar tipo "Venda", o campo quantidade é limitado a `cotasAtuais`
- [ ] CA-04: tentar vender quantidade maior que `cotasAtuais` exibe erro de validação
- [ ] CA-05: ao registrar primeira compra, `cotasAtuais` = quantidade e `precoMedioCompra` = preço unitário
- [ ] CA-06: ao registrar segunda compra, preço médio é recalculado ponderadamente
- [ ] CA-07: ao informar taxa B3, ela é somada ao custo total antes do cálculo de preço médio
- [ ] CA-08: ao registrar venda, `cotasAtuais` é decrementado e `precoMedioCompra` NÃO é alterado
- [ ] CA-09: ao vender todas as cotas (`cotasAtuais` = 0), ativo fica `ativo: false`
- [ ] CA-10: ao recarregar a página, operações persistem
- [ ] CA-11: tabela de histórico mostra todas as operações do FII, ordenada por data desc
- [ ] CA-12: card exibe preço médio, cotas, valor total e lucro/prejuízo atualizados
- [ ] CA-13: layout responsivo — formulário e tabela funcionam em mobile

---

## Dependências

```
Depende da Fase 2 (Cadastro de FII).
```

---

## Valor Entregue

O usuário já pode:
- Registrar compras de cotas de FIIs
- Registrar vendas de cotas com controle de posição
- Ver preço médio ponderado recalculado automaticamente
- Acompanhar lucro/prejuízo não realizado por FII
- Ver histórico de operações de cada FII

---

## Pode ir para produção?

```
Sim
```

Compr e venda são funcionalidades essenciais para qualquer investidor. Esta entrega já permite controle completo de posição.

---

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/investimentos/fii-operacao-form.tsx` | Criar | Formulário de compra/venda |
| `src/components/investimentos/fii-historico-operacoes.tsx` | Criar | Tabela de histórico de operações |
| `src/components/investimentos/fii-card.tsx` | Modificar | Adicionar preço médio, cotas, lucro/prejuízo |
| `src/components/investimentos/fii-form.tsx` | Modificar | Adicionar botão "Registrar Operação" no menu |
