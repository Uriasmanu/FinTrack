# Implementado - Subtipo Alimentação no Form de Transação

## Data: 04/08/2026

## 1. Contexto e Objetivo

- **O que é:** Campo de subtipo no formulário de transação quando a categoria é "Alimentação"
- **Por que existe:** O usuário precisa classificar gastos de alimentação em subcategorias específicas (Comida, Açougue, Besteira, Limpeza)
- **Quem usa:** Usuário do FinTrack que cadastra despesas de alimentação
- **Escopo:** Formulário de transação (criação e edição) e listagem de transações

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `docs/REQUISITOS.md` - Requisitos do sistema
- `src/types/index.ts` - Interface Transacao atualizada
- `src/components/transacoes/transacao-form.tsx` - Formulário atualizado
- `src/components/transacoes/transacao-item.tsx` - Listagem atualizada

## 3. História do Usuário

```
Como usuário do FinTrack,
quero selecionar um subtipo quando a categoria é Alimentação,
para que eu possa classificar melhor meus gastos no mercado.
```

**Cenários:**
- Cenário principal: Usuário seleciona "Alimentação" e aparece o campo de subtipo
- Cenário alternativo: Usuário seleciona outra categoria e o campo de subtipo não aparece

## 4. Requisitos Funcionais

- [x] RF-01: Quando a categoria "Alimentação" é selecionada, um campo de subtipo aparece
- [x] RF-02: O campo de subtipo exibe as categorias: Limpeza, Comida, Besteira, Açougue
- [x] RF-03: O subtipo é opcional (o usuário pode deixar vazio)
- [x] RF-04: O subtipo é exibido na listagem de transações ao lado da categoria

## 5. Requisitos Não-Funcionais

- **Performance:** Sem impacto - apenas campo adicional no formulário
- **UI/UX:** Campo de subtipo aparece apenas quando relevante (categoria Alimentação)

## 6. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/types/index.ts` | Modificar | Adicionar campo `subtipoId` à interface Transacao |
| `src/lib/transacoes.ts` | Modificar | Incluir `subtipoId` na criação de transações |
| `src/stores/useFinanceStore.ts` | Modificar | Passar `subtipoId` na ação `adicionarTransacoesRecorrentes` |
| `src/components/transacoes/transacao-form.tsx` | Modificar | Adicionar schema, default e select de subtipo |
| `src/components/transacoes/transacao-item.tsx` | Modificar | Exibir subtipo na listagem |
| `src/pages/NovaTransacao.tsx` | Modificar | Incluir `subtipoId` no tipo do handleSubmit |
| `src/pages/EditarTransacao.tsx` | Modificar | Incluir `subtipoId` no tipo do handleSubmit |

## 7. Critérios de Aceite

- [x] CA-01: Dado que o usuário seleciona "Alimentação", quando o formulário é renderizado, então o campo de subtipo aparece
- [x] CA-02: Dado que o usuário seleciona outra categoria, quando o formulário é renderizado, então o campo de subtipo não aparece
- [x] CA-03: Dado que uma transação tem subtipo, quando a listagem é exibida, então o subtipo aparece ao lado da categoria

## 8. Plano de Implementação

```
Passo 1: Adicionar campo subtipo ao tipo Transacao
  - O que fazer: Adicionar `subtipoId: string | null` à interface Transacao
  - Arquivo(s): src/types/index.ts
  - Como validar: Verificar que o tipo compila corretamente

Passo 2: Atualizar criação de transações
  - O que fazer: Incluir `subtipoId` em criarTransacoesRecorrentes e adicionarTransacoesRecorrentes
  - Arquivo(s): src/lib/transacoes.ts, src/stores/useFinanceStore.ts
  - Como validar: Verificar que transações são criadas com subtipoId

Passo 3: Atualizar formulário
  - O que fazer: Adicionar schema, default e select de subtipo condicional
  - Arquivo(s): src/components/transacoes/transacao-form.tsx
  - Como validar: Selecionar Alimentação e verificar que subtipo aparece

Passo 4: Atualizar listagem
  - O que fazer: Exibir subtipo na listagem de transações
  - Arquivo(s): src/components/transacoes/transacao-item.tsx
  - Como validar: Verificar que subtipo aparece na listagem
```

## 9. Rollout e Observabilidade

- **Estratégia:** Deploy direto (feature de formulário)
- **Como monitorar:** Verificar que transações com subtipo são salvas corretamente
- **Rollback:** Reverter alterações nos arquivos modificados

## 10. Definição de Pronto (DoD)

- [x] Todos os critérios de aceite foram verificados
- [x] Código revisado
- [x] Sem warnings ou erros não tratados
- [x] Seção "Histórico de Correções" em spec.md atualizada
