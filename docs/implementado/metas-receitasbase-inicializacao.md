# Implementado - Inicialização Correta de receitasBase nas Metas Padrão

## Data: 08/08/2026

## 1. Contexto e Objetivo

- **O que é:** Corrigir a inicialização do campo `receitasBase` nas metas padrão para que ele seja populado com todos os IDs de categorias de receita disponíveis, em vez de ficar vazio
- **Por que existe:** O campo `receitasBase: []` vazio cria ambiguidade: o código em `metas-predefinidas.tsx` usa um fallback para "todas as categorias", mas o formulário de edição mostra nenhuma categoria selecionada. Isso confunde o usuário e quebra a expectativa de que o que está selecionado no form é o que está sendo usado no cálculo
- **Quem usa:** Usuário do FinTrack que visualiza e edita metas padrão
- **Escopo:** `src/data/defaults.ts`, `src/components/metas/metas-predefinidas.tsx`, `src/components/metas/meta-form.tsx`

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (itens [aberto] resolvidos)
- `src/data/defaults.ts` - Inicialização das metas padrão
- `src/components/metas/metas-predefinidas.tsx` - Exibição e cálculo das metas padrão
- `src/components/metas/meta-form.tsx` - Formulário de edição de metas
- `src/data/categorias-default.json` - Categorias padrão do sistema

## 3. História do Usuário

```
Como usuário do FinTrack,
quando eu visualizo as metas padrão,
quero que elas já considerem todas as categorias de receita como base,
para que os valores calculados reflitam automaticamente todas as minhas receitas.

E quando eu edito uma meta padrão,
quero ver todas as categorias de receita selecionadas,
para que eu possa desmarcar as que não desejo incluir e ver o recálculo do valor alvo.
```

**Cenários alternativos:**
- Usuário com dados existentes (receitasBase vazio): manter fallback existente para não quebrar comportamento
- Usuário desmarca categorias: valor alvo deve ser recalculado com base nas categorias restantes
- Usuário não tem transações de receita: valor alvo permanece zero (comportamento existente)

## 4. Requisitos Funcionais

- [x] RF-01: As metas padrão devem ser inicializadas com `receitasBase` contendo todos os IDs de categorias com tipo "receita" ou "ambos"
- [x] RF-02: O cálculo do valor alvo das metas padrão deve usar as categorias listadas em `receitasBase` (não mais o fallback de "todas as categorias")
- [x] RF-03: Ao editar uma meta padrão, o formulário deve exibir todas as categorias de receita como selecionadas (checkboxes marcados)
- [x] RF-04: Ao desmarcar uma categoria de receita no formulário, o valor alvo deve ser recalculado automaticamente com base nas categorias restantes
- [x] RF-05: Dados existentes com `receitasBase: []` devem manter o comportamento de fallback (usar todas as categorias) para compatibilidade

## 5. Requisitos Não-Funcionais

- **Performance:** Sem impacto - mudança apenas na inicialização de dados
- **Consistência:** O que está selecionado no form deve corresponder ao que é usado no cálculo
- **Backward Compatibility:** Dados existentes com `receitasBase: []` continuam funcionando

## 6. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/data/defaults.ts` | Modificar | Inicializar `receitasBase` com IDs de categorias de receita |
| `src/components/metas/metas-predefinidas.tsx` | Modificar | Ajustar lógica de fallback para dados existentes |
| `src/components/metas/meta-form.tsx` | Verificar | Garantir que checkboxes refletem `receitasBase` corretamente |

## 7. Problemas e Impedimentos

### 7.1 Problemas Técnicos

- `defaults.ts` usa `receitasBase: []` para todas as metas, mas o fallback em `metas-predefinidas.tsx` usa `categoriasReceita.map((c) => c.id)` quando o array está vazio
- O formulário `meta-form.tsx` lê `initialData.receitasBase` que pode estar vazio para metas existentes

### 7.2 Ambiguidades nos Requisitos

- Nenhuma

### 7.3 Riscos

- Baixo risco: mudança isolada na inicialização de dados padrão

## 8. Critérios de Aceite

- [x] CA-01: Dado que o sistema inicializa com metas padrão, quando o usuário visualiza as metas, então todas as categorias de receita estão sendo consideradas no cálculo
- [x] CA-02: Dado que o usuário edita uma meta padrão, quando o formulário abre, então todos os checkboxes de categorias de receita estão marcados
- [x] CA-03: Dado que o usuário desmarca uma categoria de receita, quando o valor alvo é recalculado, então apenas as categorias selecionadas são consideradas
- [x] CA-04: Dado que existem dados antigos com `receitasBase: []`, quando o sistema carrega, então o comportamento de fallback continua funcionando (todas as categorias usadas)

## 9. Plano de Implementação

```
Passo 1: Atualizar defaults.ts
  - O que fazer: Importar categorias-default.json e popular `receitasBase` com IDs de categorias tipo "receita" ou "ambos"
  - Arquivo(s): src/data/defaults.ts
  - Como validar: Verificar que metas criadas têm receitasBase populado

Passo 2: Ajustar metas-predefinidas.tsx
  - O que fazer: Manter fallback para `receitasBase: []` (dados existentes), mas usar `meta.receitasBase` diretamente quando não vazio
  - Arquivo(s): src/components/metas/metas-predefinidas.tsx
  - Como validar: Testar com dados existentes (fallback) e novos dados (direto)

Passo 3: Verificar meta-form.tsx
  - O que fazer: Confirmar que o form exibe checkboxes corretos baseado em `receitasBase`
  - Arquivo(s): src/components/metas/meta-form.tsx
  - Como validar: Editar meta padrão e verificar checkboxes marcados
```

## 10. Rollout e Observabilidade

- **Estratégia de entrega:** Deploy direto
- **Como monitorar:** Verificar exibição das metas padrão e valores calculados
- **Plano de rollback:** Reverter alterações em `defaults.ts` e `metas-predefinidas.tsx`

## 11. DDR — Design Decision Record

### DDR-001 - Inicialização de receitasBase em Metas Padrão

**Status:** Aceito

**Data:** 08/08/2026

**Contexto:** As metas padrão tinham `receitasBase: []` vazio, criando ambiguidade entre o fallback no código e a exibição no formulário.

**Decisão:** Popular `receitasBase` com todos os IDs de categorias de receita na inicialização, e manter fallback para dados existentes.

**Alternativas consideradas:**

**Alternativa 1 - Manter fallback apenas**
- Prós: Sem mudança nos dados
- Contras: Inconsistência entre form e cálculo; usuário confuso

**Alternativa 2 - Popular na inicialização (escolhida)**
- Prós: Consistência total; usuário vê o que está sendo usado; permite customização
- Contras: Migração necessária para dados existentes (fallback)

**Consequências:**

**Positivas:**
- Usuário vê exatamente quais categorias estão sendo usadas
- Permite customização细腻a do cálculo
- Elimina ambiguidade no código

**Negativas:**
- Dados existentes precisam de fallback (já implementado)
