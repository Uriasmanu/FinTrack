# Implementado - Persistência do fintrack.json e Timestamps

## Data: 07/08/2026

---

## 1. Contexto e Objetivo

- **O que é:** Garantir três comportamentos de persistência sobre o arquivo `data/fintrack.json`: (1) não recriar/atualizar o arquivo quando ele já existe; (2) persistir a troca de tema (claro/escuro) no arquivo; (3) registrar timestamp (`criadoEm`/`atualizadoEm`) nas operações de CRUD de contas.
- **Por que existe:** O `fintrack.json` é a fonte de dados persistente do sistema. O frontend reescrevia o arquivo a cada carregamento da página, as contas não possuíam timestamps de auditoria e era preciso confirmar a persistência do tema.
- **Quem usa:** Todos os usuários do FinTrack.
- **Escopo:** Persistência e geração — `src/stores/useFinanceStore.ts`, `src/types/index.ts`. Fora do escopo: mudança de regras de negócio de frontend e estrutura de dados.

---

## 2. Análise dos Documentos de Referência

- **Guia de spec:** `docs/spec.md` — três itens `[aberto]` tratados antes de qualquer implementação.
- **Documento de requisitos:** `docs/REQUISITOS.md` — seções 7 (Tema), 9 (Armazenamento).
- **Documentação técnica existente:** `docs/implementado/criar-json-padrao-inicializacao.md` e `docs/implementado/reconfiguracao-config-default.md`.
- **Código-fonte relevante (lido):**
  - `src/stores/useFinanceStore.ts` — `inicializar()`, `adicionarConta`, `editarConta`, `excluirConta`, `atualizarConfig`
  - `src/types/index.ts` — interface `Conta` e `Config`
  - `src/lib/storage.ts` — `salvarDados` (PUT /api/data)
  - `server.js` — `carregarOuCriar()` (só cria se não existe) e `PUT /api/data`
  - `src/components/layout/layout.tsx` — fluxo de tema

---

## 3. História de Usuário

```
Como usuário do FinTrack,
quero que o arquivo fintrack.json seja criado uma única vez e só seja alterado quando eu realmente mudar algo,
para que meus dados e preferências (como o tema) sejam preservados entre sessões.
```

**Cenários alternativos:**
- Arquivo já existente: ao abrir o app, o arquivo não deve ser reescrito.
- Troca de tema: a escolha (claro/escuro) deve ser gravada no arquivo e mantida após recarregar.
- Criar/editar/excluir conta: a alteração deve ser gravada no arquivo e cada conta deve registrar timestamps.

---

## 4. Requisitos Funcionais

- [ ] RF-01: Se `data/fintrack.json` já existir, a inicialização do frontend não deve reescrevê-lo; o salvamento ocorre apenas quando há mudança real (merge de defaults na primeira execução ou ação do usuário).
- [ ] RF-02: O servidor, no boot, não deve recriar nem reescrever um `fintrack.json` existente.
- [ ] RF-03: Ao alternar o tema (claro/escuro), o sistema deve gravar `config.tema` no `fintrack.json` via `PUT /api/data`.
- [ ] RF-04: Ao recarregar a página, o tema aplicado deve ser o valor persistido em `config.tema`.
- [ ] RF-05: Ao criar uma conta, o sistema deve gravar a conta no `fintrack.json` com `criadoEm` e `atualizadoEm`.
- [ ] RF-06: Ao editar uma conta, o sistema deve gravar a alteração no `fintrack.json` e atualizar `atualizadoEm`.
- [ ] RF-07: Ao excluir uma conta, o sistema deve gravar a remoção no `fintrack.json`.

---

## 5. Requisitos Não-Funcionais

- **Performance:** Sem impacto — escrita única e síncrona em operações de mudança.
- **Segurança:** Sem impacto — dados locais.
- **Compatibilidade:** Dados legados sem timestamps continuam válidos (campos opcionais).
- **Observabilidade:** Log no servidor na criação do arquivo (já existente).

---

## 6. Análise da Aplicação

- **Arquitetura:** Frontend React + Zustand + backend Express; persistência em `data/fintrack.json`.
- **Padrões:** Store centraliza estado; cada mutação chama `salvar()` que faz `PUT /api/data`.
- **Fluxo de dados:** `useFinanceStore.inicializar()` → `GET /api/data` → defaults opcionais → `set`. Mutações → novo estado → `salvar` → `PUT /api/data` → arquivo.
- **Contratos de API:** `GET/PUT/DELETE /api/data` — sem alteração de contrato.

---

## 7. Arquivos Envolvidos

| Arquivo                            | Ação      | Razão                                                       |
| ---------------------------------- | --------- | ----------------------------------------------------------- |
| `src/types/index.ts`               | Modificar | Adicionar `criadoEm`/`atualizadoEm` à interface `Conta`     |
| `src/stores/useFinanceStore.ts`    | Modificar | `inicializar` sem gravação desnecessária; timestamps em contas |
| `server.js`                        | Não alterar | Confirmado: boot não reescreve arquivo existente            |
| `src/components/layout/layout.tsx` | Não alterar | Confirmado: tema flui via `atualizarConfig`                  |

---

## 8. Problemas e Impedimentos

### 8.1 Problemas Técnicos

- `inicializar()` sempre executava `salvar(dados)`, reescrevendo o arquivo a cada load.
- `Conta` não possuía campos de timestamp.

### 8.2 Ambiguidades

- Para a exclusão de conta, o timestamp não é aplicável ao registro removido; a gravação da remoção no arquivo é o requisito atendido.

### 8.3 Riscos

- Baixo — alterações isoladas na store e no tipo.

---

## 9. Critérios de Aceite

- [ ] CA-01: Dado um `data/fintrack.json` existente, quando a página é carregada, então o arquivo não é reescrito (sem PUT desnecessário).
- [ ] CA-02: Dado um novo usuário, quando o app inicializa pela primeira vez, então os defaults (categorias/metas) são gravados no arquivo.
- [ ] CA-03: Dado o usuário escolhendo tema escuro, quando confirma, então `config.tema` em `fintrack.json` é `"escuro"` e permanece após recarregar.
- [ ] CA-04: Dado o usuário criando uma conta, quando salva, então a conta é gravada no `fintrack.json` com `criadoEm` e `atualizadoEm`.
- [ ] CA-05: Dado o usuário editando uma conta, quando salva, então `atualizadoEm` é atualizado no arquivo.
- [ ] CA-06: Dado o usuário excluindo uma conta, quando confirma, então a conta é removida do `fintrack.json`.

---

## 10. Plano de Implementação

```
Passo 1: Adicionar timestamps à interface Conta
  - O que fazer: Adicionar criadoEm?: string e atualizadoEm?: string
  - Arquivo(s): src/types/index.ts
  - Como validar: Compilação TS sem erros

Passo 2: Tornar inicializar() seletivo quanto à gravação
  - O que fazer: Só chamar salvar() se houve mudança real (categorias/metas defaults adicionadas)
  - Arquivo(s): src/stores/useFinanceStore.ts
  - Como validar: Carregar página com arquivo existente → sem PUT

Passo 3: Timestamps em adicionarConta
  - O que fazer: Setar criadoEm e atualizadoEm na criação
  - Arquivo(s): src/stores/useFinanceStore.ts
  - Como validar: Criar conta → arquivo tem timestamps

Passo 4: Timestamp em editarConta
  - O que fazer: Atualizar atualizadoEm na edição
  - Arquivo(s): src/stores/useFinanceStore.ts
  - Como validar: Editar conta → atualizadoEm muda

Passo 5: Validar tema persistido
  - O que fazer: Teste manual via API (PUT tema) e recarga
  - Arquivo(s): — (verificação)
  - Como validar: config.tema permanece no arquivo
```

---

## 11. Rollout e Observabilidade

- **Estratégia:** Deploy direto — correção de persistência sem flag.
- **Como monitorar:** Verificação do conteúdo de `data/fintrack.json` após operações; logs de criação do arquivo.
- **Rollback:** Reverter o commit; comportamento anterior continua funcional.

---

## 12. Definição de Pronto (DoD)

- [ ] Todos os critérios de aceite verificados
- [ ] Código revisado (auto-revisão documentada)
- [ ] Sem warnings ou erros não tratados introduzidos
- [ ] Seção **Histórico de Correções** atualizada em spec.md
- [ ] `docs/REQUISITOS.md` atualizado

---

## 13. DDR — Design Decision Record

### DDR-014 - Gravação Seletiva e Timestamps no fintrack.json

**Status:** Aceito
**Data:** 07/08/2026

**Contexto:** O frontend reescrevia o `fintrack.json` a cada carregamento da página (via `inicializar()`), as contas não possuíam timestamps de auditoria e era preciso garantir a persistência do tema no arquivo.

**Decisão:** Tornar a gravação em `inicializar()` condicional a mudanças reais; adicionar `criadoEm`/`atualizadoEm` à interface `Conta` e preenchê-los nas operações de criação/edição; manter o fluxo de tema via `atualizarConfig` (que já persiste via `PUT`).

**Alternativas consideradas:**

### Alternativa 1: Manter gravação incondicional em inicializar
- Prós: Simples
- Contras: Reescreve o arquivo em todo load, contrariando o requisito

### Alternativa 2: Gravar timestamp de operação em um log global separado
- Prós: Histórico completo de exclusões
- Contras: Complexidade desnecessária; timestamp do registro é o padrão do projeto

**Consequências:**

### Positivas
- Arquivo só é alterado quando necessário
- Contas com auditabilidade de criação/edição
- Tema persistido e reaplicado

### Negativas
- Campos opcionais adicionais no tipo `Conta`
