# FASE 02 — Cadastro de FII (CRUD do Ativo)

> **Entrega 2:** Usuário pode cadastrar, editar e excluir ativos FII, com entrada pela aba Investimentos no menu lateral.

## Objetivo

Permitir que o usuário registre seus FIIs no sistema, definindo ticker, tipo, segmento, valores patrimoniais e taxa de retorno desejada. É o primeiro contato visual do usuário com a feature de investimentos.

---

## Funcionalidades

- Nova rota `/investimentos` registrada no `App.tsx`
- Item "Investimentos" no sidebar com ícone `Landmark`
- Página `Investimentos.tsx` com header e botão "Novo FII"
- Formulário de cadastro `fii-form.tsx` com validação Zod
- Formulário de edição reutilizando `fii-form.tsx`
- Confirmação de exclusão com dialog (bloqueado se houver vínculos)
- Lista/grid de FIIs cadastrados exibindo `fii-card.tsx` (versão simplificada — sem indicadores calculados ainda)

---

## Alterações no Backend

Nenhuma nesta fase. Store já implementado na Fase 1.

---

## Alterações no Frontend

### Rota (`src/App.tsx`)

```tsx
<Route path="/investimentos" element={<Investimentos />} />
```

### Sidebar (`src/components/layout/sidebar.tsx`)

Adicionar ao array `menuItems`:

```typescript
import { Landmark } from "lucide-react";
// ...
{ path: "/investimentos", label: "Investimentos", icon: Landmark },
```

### Página (`src/pages/Investimentos.tsx`)

- Header "Investimentos" com botão "Novo FII"
- Se não houver FIIs: estado vazio com mensagem e CTA
- Se houver: grid de `fii-card.tsx` (versão simplificada sem indicadores)
- Dialog para `fii-form.tsx` (cadastro e edição)
- Dialog de confirmação de exclusão

### Formulário (`src/components/investimentos/fii-form.tsx`)

**Campos:**
- Ticker (input, uppercase automático, validação de unicidade)
- Nome (input)
- Tipo (select: Tijolo, Papel, FOF, Misto, Fiagro, Desenvolvimento)
- Segmento (select condicional — só aparece se Tipo = Tijolo ou Fiagro)
- Perfil de Risco (select condicional — só se Tipo = Papel)
- Indexador (select condicional — só se Tipo = Papel)
- Taxa de Administração (input numérico, opcional)
- Valor Patrimonial por Cota - VP (input numérico)
- Taxa de Retorno Anual Desejada % (input numérico, usado no Preço Teto)
- Observações (textarea)

**Schema Zod:**

```typescript
const fiiSchema = z.object({
  ticker: z.string().min(1, "Ticker é obrigatório").max(10),
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["tijolo", "papel", "fof", "misto", "fiagro", "desenvolvimento"]),
  segmento: z.string().optional().nullable(),
  perfilRisco: z.string().optional().nullable(),
  indexador: z.string().optional().nullable(),
  taxaAdm: z.number().min(0).optional().nullable(),
  valorPatrimonialCota: z.number().min(0.01, "VP deve ser maior que 0"),
  taxaRetornoDesejada: z.number().min(0.01, "Taxa deve ser maior que 0"),
  observacoes: z.string().optional(),
});
```

**Validação condicional:**
- Se `tipo === "tijolo"` ou `tipo === "fiagro"`: `segmento` obrigatório
- Se `tipo === "papel"`: `perfilRisco` e `indexador` obrigatórios

### Card Simplificado (`src/components/investimentos/fii-card.tsx`)

Versão inicial sem indicadores calculados:
- Ticker + nome
- Badge de tipo (cores por tipo)
- VP e taxa de retorno desejada
- Menu de ações: Editar, Excluir (se sem vínculos)

---

## Critérios de Aceite

- [ ] CA-01: ao clicar em "Investimentos" no sidebar, o usuário acessa a rota `/investimentos`
- [ ] CA-02: se não houver FIIs, exibe estado vazio com botão "Novo FII"
- [ ] CA-03: ao clicar "Novo FII", abre dialog com formulário de cadastro
- [ ] CA-04: o campo Ticker é convertido para uppercase automaticamente
- [ ] CA-05: ao tentar cadastrar ticker duplicado, exibe erro de validação
- [ ] CA-06: ao selecionar tipo "Tijolo" ou "Fiagro", campo Segmento aparece
- [ ] CA-07: ao selecionar tipo "Papel", campos Perfil de Risco e Indexador aparecem
- [ ] CA-08: ao selecionar tipo "FOF", "Misto" ou "Desenvolvimento", nenhum campo condicional aparece
- [ ] CA-09: ao submeter formulário válido, o ativo é salvo com `cotasAtuais: 0` e `precoMedioCompra: 0`
- [ ] CA-10: ao salvar, o dialog fecha e o card aparece na listagem
- [ ] CA-11: ao clicar "Editar" no card, abre dialog com valores preenchidos
- [ ] CA-12: ao editar e salvar, os dados são atualizados
- [ ] CA-13: ao clicar "Excluir" em ativo SEM vínculos, abre confirmação e exclui
- [ ] CA-14: ao clicar "Excluir" em ativo COM vínculos (operacoes/dividendos), exibe mensagem de bloqueio
- [ ] CA-15: dados persistem após recarregar a página
- [ ] CA-16: layout responsivo — grid de cards se adapta a mobile/tablet/desktop

---

## Dependências

```
Depende da Fase 1 (Tipos, Store e Persistência).
```

---

## Valor Entregue

O usuário já pode:
- Acessar a aba Investimentos pelo menu
- Cadastrar seus FIIs com dados básicos
- Editar informações cadastrais
- Excluir FIIs que não tenham operações ou dividendos registrados
- Ver uma listagem dos FIIs cadastrados

---

## Pode ir para produção?

```
Sim
```

Embora sem indicadores calculados e sem operações/dividendos, o cadastro básico já é funcional e utilizável.

---

## Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/App.tsx` | Modificar | Adicionar rota `/investimentos` |
| `src/components/layout/sidebar.tsx` | Modificar | Adicionar item no menu |
| `src/pages/Investimentos.tsx` | Criar | Página principal da feature |
| `src/components/investimentos/fii-form.tsx` | Criar | Formulário de cadastro/edição |
| `src/components/investimentos/fii-card.tsx` | Criar | Card do FII (versão simplificada) |
