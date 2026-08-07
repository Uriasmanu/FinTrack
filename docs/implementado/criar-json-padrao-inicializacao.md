# Implementado - Criar JSON Padrão na Inicialização da Aplicação

## Data: 07/08/2026

---

## 1. Contexto e Objetivo

- **O que é:** Garantir que, ao iniciar a aplicação, o servidor crie imediatamente o arquivo JSON com as informações padrão do sistema, nomeado com o nome da aplicação, armazenado fisicamente na pasta `data`.
- **Por que existe:** O comportamento atual cria o JSON de forma preguiçosa (apenas no primeiro acesso a `GET /api/data`), deixando a pasta `data` vazia até o frontend consumir a API. O requisito pede que a criação do arquivo padrão seja a primeira ação da aplicação.
- **Quem usa:** Todos os usuários do FinTrack; o arquivo é a fonte de dados persistente do sistema.
- **Escopo:** Inicialização do servidor Express (`server.js`). Fora do escopo: alterações de estrutura de dados, migrações de versões antigas e regras de negócio do frontend.

---

## 2. Análise dos Documentos de Referência

- **Guia de spec:** `docs/spec.md` — seguido integralmente (item `[aberto]` tratado antes de qualquer implementação).
- **Documento de requisitos:** `docs/REQUISITOS.md` — seção "Armazenamento Local" descreve o JSON como armazenamento.
- **Documentação técnica existente:** `docs/implementado/reconfiguracao-config-default.md` — padroniza o uso de defaults de configuração.
- **Código-fonte relevante (lido):**
  - `server.js` — lógica de criação/migração do arquivo JSON
  - `package.json` — campo `name: "fintrack"` (fonte do nome do arquivo)
  - `src/stores/useFinanceStore.ts` — fluxo de inicialização do frontend
  - `src/lib/storage.ts` — consumo da API pelo frontend

> Nota: a documentação de requisitos referencia `doc/requisitos.md`, mas o arquivo real é `docs/REQUISITOS.md`.

---

## 3. História de Usuário

```
Como usuário do FinTrack,
quero que o sistema crie o arquivo JSON padrão automaticamente quando a aplicação inicia,
para que os dados sempre estejam disponíveis fisicamente na pasta data sem depender do primeiro acesso à API.
```

**Cenários alternativos:**
- Aplicação iniciada sem a pasta `data` existente: o servidor deve criar a pasta e o arquivo.
- Aplicação iniciada com o arquivo JSON já existente: nada deve ser sobrescrito.
- Arquivos legados `fintrack_YYYY.json` presentes: a migração existente deve continuar funcionando.

---

## 4. Requisitos Funcionais

- [ ] RF-01: Ao iniciar a aplicação, o servidor deve criar o arquivo JSON com as informações padrão do sistema como primeira ação, antes de aceitar requisições.
- [ ] RF-02: O nome do arquivo JSON deve ser derivado do nome da aplicação informado no `package.json` (ex.: `fintrack.json`).
- [ ] RF-03: O arquivo deve ser armazenado fisicamente na pasta `data` na raiz da aplicação.
- [ ] RF-04: Se a pasta `data` não existir, o servidor deve criá-la.
- [ ] RF-05: Se o arquivo JSON já existir, a inicialização não deve sobrescrevê-lo.
- [ ] RF-06: Se existirem arquivos legados `{nome-app}_{ano}.json`, a migração deve ser executada antes da criação do arquivo novo.

---

## 5. Requisitos Não-Funcionais

- **Performance:** Sem impacto mensurável — operação de escrita única e síncrona no boot.
- **Segurança:** Sem impacto — dado local, sem autenticação envolvida.
- **Compatibilidade:** Node ESM; mesma estrutura de dados já utilizada pelos endpoints existentes.
- **Observabilidade:** Log no console informando a criação do arquivo padrão.

---

## 6. Análise da Aplicação

- **Arquitetura geral:** Frontend React (Vite) + backend Express em Node (ESM). Dados persistidos em arquivo JSON na pasta `data`, consumidos via `/api`.
- **Padrões em uso:** Express com rotas REST; helpers de leitura/escrita do filesystem com `fs` (readFileSync/writeFileSync); nomes de constantes em `UPPER_SNAKE_CASE`.
- **Fluxo de dados:** `server.js` → `carregarOuCriar()` → arquivo `data/{nome}.json` → `GET/PUT /api/data`.
- **Contratos de API:** `GET /api/data`, `PUT /api/data`, `DELETE /api/data`, `GET /api/years` — sem alteração.

---

## 7. Arquivos Envolvidos

| Arquivo       | Ação     | Razão                                                       |
| ------------- | -------- | ----------------------------------------------------------- |
| `server.js`   | Modificar| Criar o JSON padrão na inicialização e derivar nome do app   |
| `package.json`| Não alterar | Fonte do nome da aplicação (leitura apenas)              |

---

## 8. Problemas e Impedimentos

### 8.1 Problemas Técnicos

- O nome do arquivo está hardcoded (`fintrack.json`) e o padrão de migração também; deve-se derivar ambos do nome da aplicação para manter consistência.

### 8.2 Ambiguidades

- Nenhuma identificada após leitura do código.

### 8.3 Riscos

- Baixo risco — a mudança é isolada na inicialização do servidor e preserva a migração existente.

---

## 9. Critérios de Aceite

- [ ] CA-01: Dado um ambiente sem a pasta `data`, quando o servidor inicia, então a pasta `data` é criada e o arquivo `fintrack.json` (nome da aplicação) é gerado fisicamente.
- [ ] CA-02: Dado um ambiente com `data/fintrack.json` já existente, quando o servidor inicia, então o conteúdo do arquivo permanece intacto.
- [ ] CA-03: Dado o servidor iniciado, quando `GET /api/data` é acessado, então os dados retornados refletem o arquivo criado no boot.
- [ ] CA-04: Dado um ambiente com arquivos legados `fintrack_2025.json` etc., quando o servidor inicia, então a migração é executada e o arquivo único é criado.

---

## 10. Plano de Implementação

```
Passo 1: Extrair nome da aplicação do package.json
  - O que fazer: Ler package.json e obter o campo "name"
  - Arquivo(s): server.js
  - Como validar: Arquivo gerado com nome fintrack.json

Passo 2: Tornar nome do arquivo único e padrão de migração dinâmicos
  - O que fazer: Substituir "fintrack" hardcoded por NOME_APLICACAO no ARQUIVO_UNICO e no regex de migração
  - Arquivo(s): server.js
  - Como validar: Migração continua detectando fintrack_YYYY.json

Passo 3: Chamar carregarOuCriar() (ou equivalente) no boot do servidor
  - O que fazer: Executar a garantia de existência do arquivo antes de app.listen
  - Arquivo(s): server.js
  - Como validar: Ao rodar `npm run server`, data/fintrack.json é criado sem chamar a API

Passo 4: Registrar log de criação do arquivo
  - O que fazer: Console.log informativo quando o arquivo for criado
  - Arquivo(s): server.js
  - Como validar: Log exibido no terminal no primeiro boot
```

---

## 11. Rollout e Observabilidade

- **Estratégia:** Deploy direto — alteração de inicialização sem flag.
- **Como monitorar:** Log de boot indicando criação do arquivo; verificação manual da pasta `data`.
- **Plano de rollback:** Reverter o commit; comportamento lazy anterior continua funcional.

---

## 12. Definição de Pronto (DoD)

- [ ] Todos os critérios de aceite verificados
- [ ] Código revisado (auto-revisão documentada)
- [ ] Sem warnings ou erros não tratados introduzidos
- [ ] Seção **Histórico de Correções** atualizada em spec.md
- [ ] `docs/REQUISITOS.md` atualizado

---

## 13. DDR — Design Decision Record

### DDR-013 - Criação Eager do JSON Padrão no Boot

**Status:** Aceito
**Data:** 07/08/2026

**Contexto:** O servidor criava o JSON padrão apenas sob demanda (primeiro `GET /api/data`), deixando a pasta `data` vazia após o boot. O requisito pede que o arquivo com as informações padrão do sistema seja a primeira coisa a ser criada ao iniciar a aplicação, nomeado com o nome da aplicação.

**Decisão:** Executar a função que garante a existência do arquivo (`carregarOuCriar()`) durante a inicialização do servidor, antes de `app.listen()`. Derivar o nome do arquivo e o padrão de migração do campo `name` do `package.json`.

**Alternativas consideradas:**

### Alternativa 1: Manter criação lazy (status quo)
- Prós: Nenhuma mudança de código
- Contras: Não atende ao requisito; pasta `data` vazia até primeiro acesso

### Alternativa 2: Criar o arquivo no `npm start`/script de build
- Prós: Isolado do runtime
- Contras: Exige passo manual; não cobre o `npm run dev` sem etapa extra

**Consequências:**

### Positivas
- Arquivo padrão sempre presente após o boot
- Nome do arquivo segue o nome real da aplicação
- Migração legada preservada

### Negativas
- Escrita síncrona adicional no boot (desprezível em volume)
