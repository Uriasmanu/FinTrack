# Metas - Label do Tipo da Conta no Seletor

**Status:** Implementado
**Data:** 18/08/2026

---

## 1. Contexto e Objetivo

- **O que é:** Melhoria no dropdown "Conta bancária para monitorar" do formulário de metas personalizadas para exibir o tipo da conta entre parênteses
- **Por que existe:** Quando o usuário possui múltiplas contas com nomes de bancos similares, fica difícil distinguir qual conta selecionar sem ver o tipo (corrente, poupança, etc.)
- **Quem usa:** Usuários do FinTrack que criam ou editam metas personalizadas
- **Escopo:** Apenas o componente `meta-form.tsx`

---

## 2. Historia de Usuario

```
Como usuário do FinTrack,
quero ver o tipo da conta entre parênteses no seletor de contas,
para que eu consiga identificar facilmente qual conta selecionar.
```

---

## 3. Requisitos Funcionais

- [x] RF-01: O dropdown de contas exibe o nome do banco seguido do tipo da conta entre parênteses (ex: "Itaú (Corrente)")
- [x] RF-02: O tipo da conta é exibido em português com a primeira letra maiúscula

---

## 4. Arquivos Envolvidos

| Arquivo | Acao | Razao |
|---|---|---|
| `src/components/metas/meta-form.tsx` | Modificar | Adicionar label do tipo da conta no SelectItem |

---

## 5. Criterios de Aceite

- [x] CA-01: dado que existem contas de tipos diferentes, quando o usuário abre o dropdown de contas, então cada item exibe "NomeBanco (Tipo)" com tipo em português
- [x] CA-02: dado que a conta é do tipo "corrente", quando exibida no dropdown, então o label mostra "(Corrente)"
- [x] CA-03: dado que a conta é do tipo "poupanca", quando exibida no dropdown, então o label mostra "(Poupança)"
