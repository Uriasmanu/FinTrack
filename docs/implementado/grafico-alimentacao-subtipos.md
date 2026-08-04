# Implementado - Gráfico de Despesas por Subtipos (Alimentação)

## Data: 04/08/2026

## 1. Contexto e Objetivo

- **O que é:** Gráfico de despesas por categoria exibe subtipos para a categoria Alimentação
- **Por que existe:** O usuário precisa ver a distribuição de gastos em subcategorias (Limpeza, Comida, Besteira, Açougue) em vez de apenas "Alimentação"
- **Quem usa:** Usuário do FinTrack que analisa seus gastos no gráfico
- **Escopo:** Página de Gráficos, tipo de dado "Despesas por Categoria"

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/pages/Graficos.tsx` - Página de gráficos
- `src/types/index.ts` - Interface Transacao com campo `subtipoId`

## 3. História do Usuário

```
Como usuário do FinTrack,
quero ver os subtipos de Alimentação no gráfico de despesas,
para que eu possa entender onde gasto mais no mercado.
```

**Cenários:**
- Cenário principal: Gráfico exibe "Comida", "Açougue", "Limpeza", "Besteira" em vez de "Alimentação"
- Cenário alternativo: Transações sem subtipo continuam exibindo o nome da categoria

## 4. Requisitos Funcionais

- [x] RF-01: O gráfico de despesas por categoria exibe subtipos para transações de Alimentação
- [x] RF-02: Transações de Alimentação sem subtipo são exibidas como "Alimentação"
- [x] RF-03: Transações de outras categorias continuam exibindo o nome da categoria

## 5. Requisitos Não-Funcionais

- **Performance:** Sem impacto
- **UI/UX:** Cores dos subtipos herdam da categoria pai

## 6. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/Graficos.tsx` | Modificar | Lógica de agrupamento por subtipo |

## 7. Critérios de Aceite

- [x] CA-01: Dado que há transações de Alimentação com subtipo "Comida", quando o gráfico é renderizado, então "Comida" aparece como item separado
- [x] CA-02: Dado que há transações de Alimentação sem subtipo, quando o gráfico é renderizado, então "Alimentação" aparece como item
- [x] CA-03: Dado que há transações de outras categorias, quando o gráfico é renderizado, então o nome da categoria aparece normalmente

## 8. Plano de Implementação

```
Passo 1: Modificar lógica de agrupamento
  - O que fazer: Quando categoriaId é "cat-001" e subtipoId existe, usar nome do subtipo
  - Arquivo(s): src/pages/Graficos.tsx
  - Como validar: Verificar que subtipos aparecem no gráfico
```

## 9. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Como monitorar:** Verificar que gráfico exibe subtipos corretamente
- **Rollback:** Reverter alteração no arquivo

## 10. Definição de Pronto (DoD)

- [x] Todos os critérios de aceite foram verificados
- [x] Código revisado
- [x] Sem warnings ou erros não tratados
- [x] Seção "Histórico de Correções" em spec.md atualizada
