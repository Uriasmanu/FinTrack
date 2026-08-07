# FASE 04 — Registro de Dividendos

> **Entrega 4:** Usuário pode lançar dividendos mensais recebidos de FIIs, com snapshot de quantidade de cotas e cálculo automático do total recebido.

## Objetivo

Permitir que o usuário registre os dividendos (proventos) mensais recebidos de cada FII, mantendo um histórico completo com competência, valor por cota e total recebido. É essencial para calcular indicadores como DY e Yield on Cost.

---

## Funcionalidades

- Formulário de dividendo `fii-dividendo-form.tsx`
- Snapshot automático de `quantidadeCotas` no momento do lançamento
- Cálculo automático de `totalRecebido` = `valorPorCota × quantidadeCotas`
- Checkbox "Dividendo não recorrente" com aviso
- Campo opcional "Tipo de Provento" (Rendimento, Amortização, etc.)
- Tabela de histórico de dividendos `fii-historico-dividendos.tsx` (por FII)
- Card do FII atualizado com DY mensal e DY anual

---

## Alterações no Backend

Nenhuma. Store já implementado na Fase 1.

---

## Alterações no Frontend

### Formulário de Dividendo (`src/components/investimentos/fii-dividendo-form.tsx`)

**Campos:**
- Competência (input month/year, ex: "07/2026")
- Data de Pagamento (input date)
- Valor por Cota (input numérico)
- Tipo de Provento (select opcional: Rendimento, Amortização, Outro)
- Checkbox: "Dividendo não recorrente"
- Observações (textarea)

**Schema Zod:**

```typescript
const dividendoSchema = z.object({
  competencia: z.string().min(1, "Competência é obrigatória"),
  dataPagamento: z.string().min(1, "Data de pagamento é obrigatória"),
  valorPorCota: z.number().min(0.01, "Valor deve ser maior que 0"),
  tipo: z.string().optional(),
  recorrente: z.boolean().default(true),
  observacoes: z.string().optional(),
});
```

**Ao submeter:**
- `quantidadeCotas` = `cotasAtuais` do ativo no momento do lançamento (snapshot)
- `totalRecebido` = `valorPorCota × quantidadeCotas`
- `competencia` armazenada no formato "YYYY-MM"

**Checkbox "não recorrente":**
- Ao marcar, exibir aviso: "Este dividendo pode não ser recorrente. O valor pode distorcer o DY anual se usado isoladamente."

### Tabela de Histórico (`src/components/investimentos/fii-historico-dividendos.tsx`)

- Tabela com colunas: Competência, Data Pagamento, Valor/Cota, Qtd Cotas, Total, Recorrente
- Badge: "Recorrente" (verde) / "Não Recorrente" (amarelo)
- Ordenada por competência desc
- Exibida dentro do dialog de detalhes do FII (Fase 6)

### Card Atualizado (`src/components/investimentos/fii-card.tsx`)

Adicionar ao card:
- DY mensal (%)
- DY anual (% — soma últimos 12 meses / preço atual)
- Total de dividendos recebidos no ano

### Botão de Dividendo

Adicionar ao menu de ações do card: "Registrar Dividendo" → abre `fii-dividendo-form.tsx`

---

## Critérios de Aceite

- [ ] CA-01: ao clicar "Registrar Dividendo" no card, abre dialog com formulário
- [ ] CA-02: ao submeter, `quantidadeCotas` é preenchida automaticamente com `cotasAtuais` do ativo
- [ ] CA-03: ao submeter, `totalRecebido` é calculado = `valorPorCota × quantidadeCotas`
- [ ] CA-04: `competencia` é armazenada no formato "YYYY-MM"
- [ ] CA-05: ao marcar "não recorrente", aviso é exibido
- [ ] CA-06: ao recarregar a página, dividendos persistem
- [ ] CA-07: tabela de histórico mostra todos os dividendos do FII
- [ ] CA-08: card exibe DY mensal e DY anual atualizados
- [ ] CA-09: ao registrar dividendo em FII sem cotas (cotasAtuais = 0), operação é bloqueada ou aviso exibido
- [ ] CA-10: layout responsivo — formulário e tabela funcionam em mobile

---

## Dependências

```
Depende da Fase 2 (Cadastro de FII).
```

---

## Valor Entregue

O usuário já pode:
- Lançar dividendos mensais recebidos de cada FII
- Acompanhar o histórico de proventos por ativo
- Ver DY mensal e anual calculados automaticamente
- Distinguir dividendos recorrentes de não recorrentes

---

## Pode ir para produção?

```
Sim
```

Dividendos são a essência de FIIs. Esta entrega permite acompanhamento completo de rendimentos.

---

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/investimentos/fii-dividendo-form.tsx` | Criar | Formulário de lançamento de dividendo |
| `src/components/investimentos/fii-historico-dividendos.tsx` | Criar | Tabela de histórico de dividendos |
| `src/components/investimentos/fii-card.tsx` | Modificar | Adicionar DY mensal, DY anual |
| `src/components/investimentos/fii-form.tsx` | Modificar | Adicionar botão "Registrar Dividendo" no menu |
