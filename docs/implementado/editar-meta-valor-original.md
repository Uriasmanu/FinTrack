# Implementado - Editar Meta com Valor Original do Card

## Data: 04/08/2026

## 1. Contexto e Objetivo

- **O que é:** Formulário de edição de meta traz valores calculados exibidos no card
- **Por que existe:** Metas padrão tinham `valorAlvo: 0` no storage, pois os valores são calculados dinamicamente
- **Quem usa:** Usuário do FinTrack que edita metas padrão ou personalizadas
- **Escopo:** MetasPredefinidas, MetaCard, Metas, MetaForm

## 2. Documentos de Referência

- `docs/spec.md` - Template de feature (item [aberto] resolvido)
- `src/components/metas/metas-predefinidas.tsx`
- `src/components/metas/meta-card.tsx`
- `src/pages/Metas.tsx`

## 3. História do Usuário

```
Como usuário do FinTrack,
quero editar uma meta e ver os valores originais do card,
para que eu possa alterar a partir do que já está calculado.
```

## 4. Requisitos Funcionais

- [x] RF-01: Ao editar meta padrão, o formulário traz o valorAlvo e meses calculados
- [x] RF-02: Ao editar meta personalizada, o formulário traz os valores salvos
- [x] RF-03: Os overrides são passados de MetasPredefinidas → Metas → MetaForm

## 5. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/metas/metas-predefinidas.tsx` | Modificar | Passar valores calculados no onEditar |
| `src/components/metas/meta-card.tsx` | Modificar | Atualizar interface onEditar |
| `src/pages/Metas.tsx` | Modificar | Armazenar overrides e passar ao form |

## 6. Critérios de Aceite

- [x] CA-01: Dado que o usuário edita "Viver de Renda", quando o formulário abre, então valorAlvo mostra o calculado (salário × 200)
- [x] CA-02: Dado que o usuário edita meta personalizada, quando o formulário abre, então valorAlvo e meses mostram os salvos

## 7. Rollout e Observabilidade

- **Estratégia:** Deploy direto
- **Rollback:** Reverter alterações nos arquivos
