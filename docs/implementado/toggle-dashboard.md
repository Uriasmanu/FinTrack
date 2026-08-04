# Implementado - Toggle de Visibilidade no Dashboard

## Data: 04/08/2026

## 1. Contexto e Objetivo

- **O que é:** Toggles para mostrar/ocultar seções de Gráficos e Metas no Dashboard
- **Por que existe:** O usuário quer personalizar o que aparece no Dashboard
- **Quem usa:** Usuário do FinTrack que personaliza seu dashboard
- **Escopo:** Página Dashboard.tsx

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/pages/Dashboard.tsx` - Página do dashboard

## 3. História do Usuário

```
Como usuário do FinTrack,
quero escolher quais seções aparecem no dashboard,
para que eu veja apenas o que é importante para mim.
```

## 4. Requisitos Funcionais

- [x] RF-01: O Dashboard exibe toggles para "Gráficos" e "Metas"
- [x] RF-02: Ao desativar um toggle, a seção correspondente some do Dashboard
- [x] RF-03: A preferência é salva no localStorage e persiste entre sessões

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/pages/Dashboard.tsx` | Modificar | Adicionar toggles e lógica de visibilidade |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário desativa o toggle "Gráficos", quando o Dashboard é renderizado, então a seção de gráficos não aparece
- [x] CA-02: Dado que o usuário desativa o toggle "Metas", quando o Dashboard é renderizado, então a seção de metas não aparece
- [x] CA-03: Dado que o usuário recarrega a página, quando o Dashboard é renderizado, então as preferências de visibilidade são mantidas

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alteração no arquivo
