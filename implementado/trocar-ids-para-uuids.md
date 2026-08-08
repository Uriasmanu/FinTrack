# DDR-001 - Trocar IDs de categorias padrão para UUIDs

## Status
Aceito

## Data
08/08/2026

## Contexto

As 19 categorias padrão do FinTrack usam IDs sequenciais hardcoded (`cat-001` a `cat-019`), enquanto todas as outras entidades (contas, cartões, metas, transações, ativos FII) já usam UUIDs via `crypto.randomUUID()`. Essa inconsistência gera:

- Acoplamento frágil: ~40 referências hardcoded espalhadas em 7 arquivos fonte
- Dificuldade de manutenção: alterar uma categoria requer buscar e substituir em múltiplos arquivos
- Risco de colisão: IDs `cat-NNN` são genéricos e podem conflitar com dados importados
- Violação do princípio DRY: cada componente redefine suas próprias constantes de ID

## Decisão

Substituir os IDs sequenciais `cat-NNN` por UUIDs fixos pré-definidos, centralizados em um único arquivo de constantes (`src/lib/categorias-ids.ts`). Os UUIDs são fixos (não gerados dinamicamente) para garantir estabilidade entre execuções e para servir como referência em dados existentes.

## Alternativas consideradas

### Alternativa 1: Manter `cat-NNN` e apenas documentar
- Prós: Zero esforço de implementação
- Contras: Não resolve o acoplamento, inconsistência persiste

### Alternativa 2: Gerar UUIDs dinamicamente no startup
- Prós: UUIDs sempre novos
- Contras: Impossível referenciar em código fonte; dados existentes não seriam migrados; quebra a referência entre categorias default e código

### Alternativa 3: UUIDs fixos pré-definidos (decidido)
- Prós: IDs estáveis, referenciáveis no código, migração simples dos dados existentes, consistência total
- Contras: UUIDs fixos parecem arbitrários, mas são functionally equivalentes

## Consequências

### Positivas
- Centralização: um único arquivo `categorias-ids.ts` define todas as referências
- Consistência: todas as entidades usam o mesmo formato de ID
- Manutenção: alterar uma referência de categoria requer mudança em um único lugar
- Migração: dados existentes são atualizados automaticamente no startup

### Negativas
- Script de migração necessário para dados existentes (`data/fintrack.json`)
- UUIDs fixos são menos legíveis que `cat-001`

---

# Feature: Trocar IDs de categorias padrão para UUIDs

## 1. Contexto e Objetivo

- **O que é:** Substituir os 19 IDs sequenciais das categorias padrão (`cat-001` a `cat-019`) por UUIDs fixos, centralizando as referências em um único arquivo de constantes
- **Por que existe:** Eliminar ~40 referências hardcoded espalhadas em 7 arquivos, reduzir acoplamento e trazer consistência com o restante do sistema
- **Quem usa:** Desolvedores que mantêm o código; usuários finais não são afetados visualmente
- **Escopo:** Apenas categorias padrão. Categorias criadas pelo usuário já usam UUIDs

## 2. Documentos de Referência

- `docs/spec.md` - Guia de spec
- `src/data/categorias-default.json` - Definição das 19 categorias padrão
- `src/lib/uuid.ts` - Utilitário de geração de UUID
- `src/stores/useFinanceStore.ts` - Store que faz merge das categorias default
- `server.js` - Backend que gerencia o arquivo JSON

## 3. História de Usuario

```
Como desenvolvedor do FinTrack,
quero que as categorias padrão usem UUIDs como todas as outras entidades,
para que o código seja mais consistente, menos acoplado e mais fácil de manter.
```

**Cenários alternativos:**
- Usuário com dados existentes contendo `cat-NNN`: migração automática no startup
- Usuário novosistema: categorias já são criadas com UUIDs

## 4. Requisitos Funcionais

- [ ] RF-01: Um único arquivo `src/lib/categorias-ids.ts` define constantes UUID para cada uma das 19 categorias padrão
- [ ] RF-02: O arquivo `categorias-default.json` usa os UUIDs definidos no arquivo de constantes
- [ ] RF-03: Todas as referências hardcoded `cat-NNN` no código fonte são substituídas por imports do arquivo de constantes
- [ ] RF-04: Uma migração automática no `server.js` substitui IDs `cat-NNN` por UUIDs correspondentes no `data/fintrack.json`
- [ ] RF-05: A função `inicializar` do store continua funcionando corretamente após a migração
- [ ] RF-06: Dados de transações, categorias, metas e configurações são preservados após a migração

## 5. Requisitos Nao-Funcionais

- **Performance:** A migração roda uma única vez (primeira vez que o servidor detecta IDs antigos)
- **Segurança:** Migração é reversível (backup do JSON antes da escrita)
- **Observabilidade:** Log no console indicando sucesso da migração

## 6. Analise da Aplicacao

- **Arquitetura:** SPA React + Express backend + JSON file storage
- **Padrões:** Zustand para state, gerarId() para UUIDs, categorias-default.json para seed data
- **Fluxo de dados:** Server carrega JSON → Store mergeia categorias default → Frontend renderiza
- **Contratos:** GET/PUT /api/data para carregar/salvar o JSON completo

## 7. Arquivos Envolvidos

| Arquivo | Acao | Razao |
|---------|------|-------|
| `src/lib/categorias-ids.ts` | Criar | Constantes UUID para as 19 categorias |
| `src/data/categorias-default.json` | Modificar | Trocar `cat-NNN` por UUIDs |
| `src/components/transacoes/transacao-form.tsx` | Modificar | Usar constantes em vez de hardcoded |
| `src/components/dashboard/despesas-por-finalidade.tsx` | Modificar | Usar constantes em vez de hardcoded |
| `src/components/metas/metas-predefinidas.tsx` | Modificar | Usar constantes em vez de hardcoded |
| `src/components/dashboard/receitas-despesas-card.tsx` | Modificar | Usar constante cat-014 |
| `src/pages/Transacoes.tsx` | Modificar | Usar constante cat-014 |
| `src/pages/Transferencia.tsx` | Modificar | Usar constantes cat-013/cat-014 |
| `src/stores/useFinanceStore.ts` | Modificar | Importar constantes para merge correto |
| `server.js` | Modificar | Adicionar migração de IDs antigos |
| `data/fintrack.json` | Modificar (runtime) | IDs atualizados pela migração |

## 8. Problemas e Impedimentos

### 8.1 Problemas Tecnicos
- Usuários existentes com dados usando `cat-NNN` precisam de migração automática
- A função `inicializar` do store usa `categoriasExistentes.has(c.id)` para evitar duplicatas - após migração, os novos UUIDs não existirão nos dados antigos, resultando em categorias duplicadas se a migração não rodar antes

### 8.2 Ambiguidades nos Requisitos
- Nenhuma identificada

### 8.3 Riscos
- Migração incorreta pode perder referências de `categoriaId` em transações
- Backup antes da migração é essencial

## 9. Criterios de Aceite

- [ ] CA-01: dado que o servidor inicia com dados contendo `cat-001`, quando o arquivo é lido, então o ID é substituído pelo UUID correspondente em todas as transações e categorias
- [ ] CA-02: dado que novas categorias são criadas com UUIDs, quando o store inicializa, então as categorias default não são duplicadas
- [ ] CA-03: dado que o formulário de transação é aberto, quando o usuário seleciona "Alimentação", então o dropdown de subtipo aparece corretamente
- [ ] CA-04: dado que o dashboard é exibido, quando existem despesas, então os valores por finalidade são calculados corretamente
- [ ] CA-05: dado que uma transferência é criada, quando o formulário é enviado, então as categorias Transferência e Guardar são usadas corretamente
- [ ] CA-06: caso de erro — dado que o JSON está corrompido, quando a migração é executada, então uma mensagem de erro é exibida no console e os dados originais são preservados

## 10. Plano de Implementacao

```
Passo 1: Criar arquivo de constantes de IDs
  - O que fazer: Criar `src/lib/categorias-ids.ts` com UUIDs fixos para cada categoria
  - Arquivo(s): src/lib/categorias-ids.ts (novo)
  - Como validar: Importar o arquivo e verificar que todas as 19 constantes existem

Passo 2: Atualizar categorias-default.json
  - O que fazer: Substituir `cat-NNN` pelos UUIDs correspondentes
  - Arquivo(s): src/data/categorias-default.json
  - Como validar: Abrir o JSON e verificar que nenhum `cat-` permanece

Passo 3: Substituir referências hardcoded no código fonte
  - O que fazer: Em cada arquivo, importar as constantes e substituir os valores hardcoded
  - Arquivo(s): transacao-form.tsx, despesas-por-finalidade.tsx, metas-predefinidas.tsx, receitas-despesas-card.tsx, Transacoes.tsx, Transferencia.tsx
  - Como validar: Buscar por `cat-` no código fonte e verificar que nenhum resultado é encontrado

Passo 4: Adicionar migração no server.js
  - O que fazer: Na função carregarOuCriar(), detectar se há IDs `cat-` e substituí-los pelo UUID correspondente antes de retornar os dados
  - Arquivo(s): server.js
  - Como validar: Criar um JSON de teste com `cat-001` e verificar que é substituído pelo UUID

Passo 5: Atualizar store se necessário
  - O que fazer: Verificar se a função inicializar continua funcionando corretamente
  - Arquivo(s): src/stores/useFinanceStore.ts
  - Como validar: Testar inicialização com dados antigos e novos
```

## 11. Rollout e Observabilidade

- **Estratégia de entrega:** Deploy direto. A migração roda automaticamente no primeiro acesso
- **Como monitorar:** Logs no console do servidor indicando migração executada
- **Plano de rollback:** Restaurar backup do `fintrack.json` se a migração causar problemas

## 12. Definição de Pronto

- [ ] Todos os critérios de aceite foram verificados
- [ ] Código revisado (auto-revisão documentada)
- [ ] Sem warnings ou erros não tratados introduzidos
- [ ] Seção Histórico de Correções atualizada em spec.md
