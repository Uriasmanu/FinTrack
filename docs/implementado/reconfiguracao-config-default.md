# Implementado - Reconfiguração de Config Default

## Data: 03/08/2026

---

## 1. Contexto e Objetivo

- **O que é:** Correção da lógica de inicialização que sobrescreve todas as configurações do usuário quando `salario === 0`, substituindo por um mecanismo de detecção de novo usuário via timestamp.
- **Por que existe:** O sistema usa `salario === 0` como proxy para "novo usuário", mas isso é frágil — um usuário que ainda não configurou salário mas já alterou tema, moeda ou multiplicadores tem todas as suas configurações destruídas a cada F5.
- **Quem usa:** Todos os usuários do aplicativo.
- **Escopo:** Corrigir inicialização do store, adicionar timestamp de criação, implementar fusão seletiva de config.

---

## 2. Análise dos Documentos de Referência

- **Guia de spec:** Seguido integralmente.
- **Documento de requisitos:** `docs/requisitos.md` — não encontrado (será criado).
- **Documentação técnica existente:** `docs/implementado/correcoes-bugs.md` — contém 47 correções anteriores e 11 DDRs.
- **Código-fonte relevante:**
  - `src/stores/useFinanceStore.ts:80-98` — função `inicializar()` com bug
  - `src/types/index.ts:77-82` — interface `Config` sem timestamp
  - `src/lib/storage.ts:10-31` — `criarDadosAnoNovo()` sem timestamp
  - `src/data/config-default.json` — config padrão
  - `src/data/defaults.ts:10-12` — `obterConfigDefault()`

---

## 3. História de Usuário

```
Como usuário do FinTrack,
quero que minhas configurações (tema, moeda, multiplicadores) sejam preservadas ao recarregar a página,
para que eu não precise reconfigurar o app a cada visita.
```

**Cenários alternativos:**
- Usuário novo (primeira vez): sistema carrega defaults corretamente.
- Usuário existente com salario=0: sistema preserva config existente.
- Usuário existente com salario>0: sistema preserva config existente (sem mudança).

---

## 4. Requisitos Funcionais

- [ ] RF-01: O sistema deve armazenar um timestamp `criadoEm` no objeto `config` quando o ano é criado pela primeira vez.
- [ ] RF-02: Na inicialização, o sistema deve verificar a existência de `config.criadoEm` para determinar se é um novo usuário.
- [ ] RF-03: Se `config.criadoEm` existir, o sistema NÃO deve sobrescrever nenhum campo do config.
- [ ] RF-04: Se `config.criadoEm` não existir (dados legados), o sistema deve preservar campos existentes e preencher apenas os ausentes com defaults.
- [ ] RF-05: O campo `salario === 0` não deve mais ser usado como critério de detecção de novo usuário.

---

## 5. Requisitos Não-Funcionais

- **Performance:** Sem impacto — operação síncrona em localStorage.
- **Segurança:** Sem impacto — dado local sem sensibilidade.
- **Compatibilidade:** Dados legados (sem `criadoEm`) devem funcionar sem migração explícita.

---

## 6. Análise da Aplicação

- **Arquitetura:** Frontend React + Zustand + localStorage.
- **Padrões:** Store centraliza estado, `storage.ts` gerencia persistência, `types/index.ts` define interfaces.
- **Fluxo de dados:** `localStorage` → `storage.verificarOuCriarAnoAtual()` → `useFinanceStore.inicializar()` → UI.

---

## 7. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/types/index.ts` | Modificar | Adicionar `criadoEm?: string` à interface `Config` |
| `src/lib/storage.ts` | Modificar | Adicionar `criadoEm` ao criar dados novos |
| `src/stores/useFinanceStore.ts` | Modificar | Corrigir lógica de `inicializar()` |
| `src/data/config-default.json` | Modificar | Adicionar `criadoEm` ao default |

---

## 8. Problemas e Impedimentos

### 8.1 Problemas Técnicos
- Dados legados no localStorage não terão `criadoEm` — tratado com fallback.

### 8.2 Ambiguidades
- Nenhuma identificada.

### 8.3 Riscos
- Baixo risco — mudança isolada na inicialização.

---

## 9. Critérios de Aceite

- [ ] CA-01: Dado um usuário novo (primeira vez), quando o app é carregado, então `config` deve conter defaults e `criadoEm` preenchido.
- [ ] CA-02: Dado um usuário existente com tema="escuro" e salario=0, quando F5 é pressionado, então tema permanece "escuro".
- [ ] CA-03: Dado um usuário legado (sem `criadoEm`), quando o app é carregado, então campos existentes são preservados e `criadoEm` é preenchido.
- [ ] CA-04: Dado um usuário com salario=0 e moeda="USD", quando F5 é pressionado, então moeda permanece "USD".

---

## 10. Plano de Implementação

```
Passo 1: Adicionar campo `criadoEm` à interface Config
  - O que fazer: Adicionar `criadoEm?: string` à interface Config em types/index.ts
  - Arquivo(s): src/types/index.ts
  - Como validar: Verificar que TypeScript compila sem erros

Passo 2: Atualizar criarDadosAnoNovo para incluir criadoEm
  - O que fazer: Adicionar `criadoEm: new Date().toISOString()` ao config em storage.ts
  - Arquivo(s): src/lib/storage.ts
  - Como validar: Verificar que novo ano criado tem criadoEm

Passo 3: Corrigir lógica de inicializar em useFinanceStore
  - O que fazer: Substituir verificação de salario===0 por verificação de criadoEm. Usar fusão seletiva.
  - Arquivo(s): src/stores/useFinanceStore.ts
  - Como validar: Testar com F5 — tema e moeda devem persistir

Passo 4: Tratar dados legados
  - O que fazer: Se dados não têm criadoEm, preservar campos existentes e adicionar criadoEm
  - Arquivo(s): src/stores/useFinanceStore.ts
  - Como validar: Testar com localStorage antigo (sem criadoEm)
```

---

## 11. Rollout e Observabilidade

- **Estratégia:** Deploy direto — correção de bug sem impacto externo.
- **Monitoramento:** Console.log na inicialização para verificar se criadoEm está presente.
- **Rollback:** Reverter commit se houver regressão.

---

## 12. Definição de Pronto

- [ ] Todos os critérios de aceite verificados
- [ ] Código revisado
- [ ] Sem warnings ou erros
- [ ] Histórico de Correções atualizado

---

## 13. DDR

### DDR-012 - Timestamp de Criação para Detecção de Novo Usuário

**Status:** Aceito
**Data:** 03/08/2026

**Contexto:** O sistema usava `config.salario === 0` como proxy para "novo usuário", mas isso destruía configurações existentes (tema, moeda, multiplicadores) de usuários que simplemente não configuraram salário.

**Decisão:** Adicionar campo `criadoEm` ao objeto `Config`. Na inicialização, verificar `criadoEm` para determinar se é novo usuário. Se existir, preservar config. Se não existir (dados legados), fazer fusão seletiva.

**Alternativas consideradas:**

### Alternativa 1: Manter salario===0 com fusão seletiva
- Prós: Sem mudança de interface
- Contras: `salario===0` continua sendo um proxy frágil; não resolve o caso de dados legados

### Alternativa 2: Timestamp em chave separada no localStorage
- Prós: Não modifica interface Config
- Contras: Dado fica desassociado dos dados do ano; mais complexo de manter

**Consequências:**

### Positivas
- Detecção de novo usuário é confiável e explícita
- Configurações do usuário nunca são destruídas acidentalmente
- Dados legados funcionam sem migração

### Negativas
- Campo adicional na interface Config
- Uma linha de código extra na inicialização
