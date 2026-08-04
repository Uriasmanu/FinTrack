# Implementado - Meta Lazer como Limite de Gasto

## Data: 04/08/2026

## 1. Contexto e Objetivo

- **O que é:** Meta padrão "Lazer" usa despesas reais como limite
- **Por que existe:** "Lazer" e "Conta Fixa" são metas de limite de gasto, não de economia
- **Quem usa:** Usuário do FinTrack que acompanha metas no dashboard
- **Escopo:** Componente `metas-predefinidas.tsx`

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/components/metas/metas-predefinidas.tsx` - Componente de metas padrão

## 3. História do Usuário

```
Como usuário do FinTrack,
quero que a meta "Lazer" use minhas despesas reais como limite,
para que eu possa controlar gastos com lazer.
```

## 4. Requisitos Funcionais

- [x] RF-01: A meta "Lazer" usa despesas recorrentes/parceladas da categoria Lazer como valor alvo
- [x] RF-02: Se não houver despesas de lazer, usa o multiplicador do salário como fallback
- [x] RF-03: A meta "Conta Fixa" continua usando todas as despesas recorrentes/parceladas

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/metas/metas-predefinidas.tsx` | Modificar | Calcular despesas de lazer |

## 6. Critérios de Aceite

- [x] CA-01: Dado que há despesas recorrentes de lazer, quando o dashboard é renderizado, então a meta "Lazer" mostra o total dessas despesas
- [x] CA-02: Dado que não há despesas de lazer, quando o dashboard é renderizado, então a meta "Lazer" usa o multiplicador do salário

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alteração no arquivo
