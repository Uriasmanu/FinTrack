# FEATURE_INVESTIMENTOS_FII — Arquitetura da Feature

## Visão Geral

Nova aba **Investimentos** no menu lateral do FinTrack, com foco inicial no card de **FIIs (Fundos de Investimento Imobiliário)**. A estrutura nasce preparada para comportar futuramente CDB e outros ativos.

## Problema Resolvido

Usuários do FinTrack que possuem investimentos em FIIs não conseguem acompanhar sua carteira de investimentos imobiliários dentro do app. Precisam de uma ferramenta para registrar compras/vendas, acompanhar dividendos e avaliar indicadores como P/VP, Preço Teto e DY.

## Transformação

- De zero visibilidade de investimentos → para carteira consolidada de FIIs com indicadores automáticos
- De cálculos manuais em planilha → para dashboards e alertas automáticos baseados em regras de negócio

## Arquitetura Técnica

```
┌─────────────────────────────────────────────────┐
│                    UI Layer                      │
│  Investimentos.tsx (página)                     │
│  ├── fii-dashboard.tsx (resumo consolidado)     │
│  ├── fii-card.tsx (card individual do FII)      │
│  ├── fii-form.tsx (cadastro/edição do ativo)    │
│  ├── fii-operacao-form.tsx (compra/venda)       │
│  ├── fii-historico-operacoes.tsx (tabela ops)   │
│  ├── fii-dividendo-form.tsx (lançar dividendo)  │
│  ├── fii-historico-dividendos.tsx (tabela divs) │
│  ├── fii-detalhes.tsx (dialog de detalhes)      │
│  └── fii-preco-teto-calc.tsx (calculadora)      │
├─────────────────────────────────────────────────┤
│                  State Layer                    │
│  useFinanceStore.ts (Zustand)                   │
│  ├── ativosFii: AtivoFii[]                      │
│  ├── operacoesFii: OperacaoFii[]                │
│  ├── dividendosFii: DividendoFii[]              │
│  ├── CRUD de ativos                             │
│  ├── CRUD de operações (com recálculo)          │
│  ├── CRUD de dividendos                         │
│  └── Seletores e agregações                     │
├─────────────────────────────────────────────────┤
│                 Calculations Layer               │
│  calculos-fii.ts (funções puras)                │
│  ├── calcularPrecoTeto()                        │
│  ├── calcularPvp()                              │
│  ├── calcularDyMensal/Anual()                   │
│  ├── calcularYoc()                              │
│  ├── calcularCapRate()                          │
│  ├── calcularLucroPrejuizo()                    │
│  └── calcularIndicadoresFii()                   │
├─────────────────────────────────────────────────┤
│                Persistence Layer                 │
│  storage.ts (localStorage JSON por ano)         │
│  ├── fintrack_2026.json → ativosFii[]           │
│  ├── fintrack_2026.json → operacoesFii[]        │
│  └── fintrack_2026.json → dividendosFii[]       │
└─────────────────────────────────────────────────┘
```

## Padrões Seguidos

| Aspecto | Padrão Adotado | Referência no Código |
|---------|---------------|---------------------|
| State | Zustand store único | `useFinanceStore.ts` |
| Persistência | localStorage JSON por ano | `storage.ts` |
| UI | shadcn/ui + Tailwind | `components/ui/` |
| Formulários | React Hook Form + Zod | Padrão existente |
| Cálculos | Funções puras em `lib/` | `calculos.ts` |
| IDs | `crypto.randomUUID()` | `uuid.ts` |
| Nomenclatura | kebab-case arquivos, PascalCase exports | Padrão existente |
| Documentação | `implementado/{nome}.md` | `docs/implementado/` |

## Entregas Incrementais (Vertical Slices)

| Fase | Entrega | Dependência |
|------|---------|-------------|
| 1 | Tipos, Store e Persistência | Nenhuma |
| 2 | Cadastro de FII (CRUD do ativo) | Fase 1 |
| 3 | Operações de Compra/Venda | Fase 2 |
| 4 | Registro de Dividendos | Fase 2 |
| 5 | Dashboard e Cards da Carteira | Fases 2, 3, 4 |
| 6 | Detalhes do FII e Calculadora de Preço Teto | Fases 3, 4 |
| 7 | Histórico Consolidado de Dividendos | Fases 4, 5 |
| 8 | Integração com Transações e Exportação | Fase 4 |

## Fora do Escopo (Futuro)

- Card CDB (reutilizar estrutura da aba com tabs)
- Integração com dados de mercado (API externa)
- Indicador de patrimônio no Dashboard principal
- Exportação consolidada de investimentos
- Alertas automáticos de preços
- Importação de notas de corretagem
