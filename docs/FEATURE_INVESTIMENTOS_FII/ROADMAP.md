# FEATURE_INVESTIMENTOS_FII — Roadmap de Entregas

## Resumo Visual

```
FASE 1 ──────► FASE 2 ──────┬──► FASE 3 ──────┐
(Tipos/Store)   (CRUD Ativo)  │   (Compra/Venda) │
                              │                   ├──► FASE 5 ──────► FASE 7
                              │                   │   (Dashboard)    (Histórico)
                              │                   │
                              └──► FASE 4 ────────┘
                                   (Dividendos) ─────► FASE 6
                                                       (Detalhes/Calculadora)
                                                               │
                                                               ▼
                                                        FASE 8
                                                        (Integrações)
```

## Detalhamento por Fase

### Fase 1 — Tipos, Store e Persistência
- **O que entrega:** Base de dados da feature (tipos TS, interfaces, store com CRUD, persistência)
- **Valor:** Sem esta fase, nada funciona. É a fundação.
- **Dependências:** Nenhuma
- **Pode ir para produção?** Não (sem UI)

### Fase 2 — Cadastro de FII (CRUD do Ativo)
- **O que entrega:** Usuário pode cadastrar, editar e excluir FIIs
- **Valor:** Já é possível registrar ativos e ver no menu
- **Dependências:** Fase 1
- **Pode ir para produção?** Sim (básico, mas funcional)

### Fase 3 — Operações de Compra/Venda
- **O que entrega:** Usuário pode registrar compras e vendas de cotas com preço médio automático
- **Valor:** Controle completo de posição e custo médio
- **Dependências:** Fase 2
- **Pode ir para produção?** Sim

### Fase 4 — Registro de Dividendos
- **O que entrega:** Usuário pode lançar dividendos mensais e ver histórico
- **Valor:** Acompanhamento de rendimentos por FII
- **Dependências:** Fase 2
- **Pode ir para produção?** Sim

### Fase 5 — Dashboard e Cards da Carteira
- **O que entrega:** Visão consolidada: valor total, DY médio, total de dividendos, cards com indicadores
- **Valor:** Panorama completo da carteira em uma tela
- **Dependências:** Fases 2, 3, 4
- **Pode ir para produção?** Sim

### Fase 6 — Detalhes do FII e Calculadora de Preço Teto
- **O que entrega:** Dialog com todos os dados, histórico de operações/dividendos e calculadora de preço teto
- **Valor:** Análise detalhada de cada ativo com ferramenta de decisão
- **Dependências:** Fases 3, 4
- **Pode ir para produção?** Sim

### Fase 7 — Histórico Consolidado de Dividendos
- **O que entrega:** Aba de dividendos com tabela e gráfico de evolução mensal
- **Valor:** Visão temporal dos rendimentos recebidos
- **Dependências:** Fases 4, 5
- **Pode ir para produção?** Sim

### Fase 8 — Integração com Transações e Exportação
- **O que entrega:** Opção de gerar transação de receita ao lançar dividendo + exportação JSON
- **Valor:** Integração com fluxo financeiro existente
- **Dependências:** Fase 4
- **Pode ir para produção?** Sim

## Ordem de Desenvolvimento Recomendada

1. **Fase 1** — Fundação (sem isso nada funciona)
2. **Fase 2** — CRUD básico (já gera valor)
3. **Fase 3** — Operações (essencial para carteira real)
4. **Fase 4** — Dividendos (paralelo à Fase 3, mesma dependência)
5. **Fase 5** — Dashboard (usa tudo que foi criado)
6. **Fase 6** — Detalhes (aprofundamento do ativo)
7. **Fase 7** — Histórico (consolidação temporal)
8. **Fase 8** — Integrações (polimento e conexão com existente)

## Riscos Técnicos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Migração de JSONs antigos sem campos FII | Alto | Fallback `?? []` em storage.ts |
| Performance com muitos FIIs | Baixo | Memoização com seletores Zustand |
| Cálculos incorretos de preço médio | Alto | Testes manuais com exemplos reais |
| Complexidade do form condicional (tipo→segmento) | Médio | Formulário com campos dinâmicos |
| Consistência entre operações e cotações | Médio | Snapshot de quantidade no dividend |

## Sugestões de Melhorias Futuras (fora do MVP)

- Integração com API de dados de mercado (cotações em tempo real)
- Importação de notas de corretagem (CSV/PDF)
- Card CDB com tabs na página Investimentos
- Indicador de patrimônio no Dashboard principal
- Exportação consolidada de investimentos
- Alertas automáticos de preço teto e P/VP
- Gráfico de alocação por segmento de FII
- Comparativo de FIIs lado a lado
