# FASE 08 — Integração com Transações e Exportação

> **Entrega 8:** Opção de gerar transação de receita vinculada ao lançamento de dividendo + exportação dos dados de investimentos em JSON.

## Objetivo

Conectar a feature de investimentos com o fluxo financeiro já existente no FinTrack, permitindo que dividendos lançados gerem automaticamente transações de receita na categoria "Investimentos". Também incluir exportação dos dados de investimentos.

---

## Funcionalidades

- Checkbox "Criar transação de receita vinculada" no formulário de dividendo
- Ao marcar, gera transação na categoria "Investimentos" (cat-008) automaticamente
- Descrição da transação: "Dividendo {ticker} - {competência}"
- Valor da transação: `totalRecebido` do dividendo
- Exportação JSON dos dados de investimentos (junto com exportação geral)
- Dados incluídos na exportação: ativosFii, operacoesFii, dividendosFii

---

## Alterações no Backend

### Store (`src/stores/useFinanceStore.ts`)

Na função `adicionarDividendoFii`, adicionar lógica opcional:

```typescript
adicionarDividendoFii: (dados, criarTransacao = false) => {
  // ... lógica existente de criar dividendo ...

  if (criarTransacao) {
    const novo = {
      id: gerarId(),
      descricao: `Dividendo ${ativo.ticker} - ${dados.competencia}`,
      valor: totalRecebido,
      tipo: "receita" as TipoTransacao,
      categoriaId: "cat-008", // Investimentos
      data: dados.dataPagamento,
      contaId: undefined, // sem vinculação a conta específica
      recorrencia: "unica" as TipoRecorrencia,
      efetivada: true,
      // ... outros campos padrão ...
    };
    // Adicionar à lista de transações
  }
}
```

---

## Alterações no Frontend

### Formulário de Dividendo (`src/components/investimentos/fii-dividendo-form.tsx`)

Adicionar checkbox:

```tsx
<FormField
  control={control}
  name="criarTransacao"
  render={({ field }) => (
    <div className="flex items-center space-x-2">
      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      <Label>Criar transação de receita vinculada</Label>
    </div>
  )}
/>
```

Ao marcar, o `totalRecebido` será lançado como transação na categoria "Investimentos".

### Exportação (`src/pages/Exportar.tsx`)

Na exportação JSON, incluir os três arrays de investimentos:

```typescript
const dadosParaExportar = {
  // ... dados existentes ...
  ativosFii: state.ativosFii,
  operacoesFii: state.operacoesFii,
  dividendosFii: state.dividendosFii,
};
```

---

## Critérios de Aceite

- [ ] CA-01: ao marcar "Criar transação de receita vinculada" e salvar dividendo, transação é criada
- [ ] CA-02: transação criada tem descrição "Dividendo {ticker} - {competência}"
- [ ] CA-03: transação criada tem categoria "Investimentos" (cat-008)
- [ ] CA-04: transação criada tem valor = `totalRecebido` do dividendo
- [ ] CA-05: transação criada tem tipo "receita" e está marcada como efetivada
- [ ] CA-06: ao desmarcar checkbox, nenhuma transação é criada
- [ ] CA-07: transação criada aparece no extrato de transações
- [ ] CA-08: exportação JSON inclui ativosFii, operacoesFii e dividendosFii
- [ ] CA-09: importação de JSON com dados FII restaura corretamente
- [ ] CA-10: layout responsivo — checkbox funciona em mobile

---

## Dependências

```
Depende da Fase 4 (Registro de Dividendos).
```

---

## Valor Entregue

O usuário já pode:
- Lançar dividendos que automaticamente se tornam receitas no fluxo financeiro
- Manter consistência entre investimentos e extrato de transações
- Exportar dados de investimentos junto com o backup geral
- Importar dados de investimentos de anos anteriores

---

## Pode ir para produção?

```
Sim
```

A integração com transações fecha o ciclo de uso da feature, conectando investimentos ao fluxo financeiro completo.

---

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/stores/useFinanceStore.ts` | Modificar | Adicionar lógica de criar transação ao dividendo |
| `src/components/investimentos/fii-dividendo-form.tsx` | Modificar | Adicionar checkbox de integração |
| `src/pages/Exportar.tsx` | Modificar | Incluir dados FII na exportação |
