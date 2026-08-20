# Calculadora no Formulário de Transações

## 1. Contexto e Objetivo

- **O que é:** Componente de calculadora integrado ao campo de valor dos formulários de transação, permitindo realizar operações matemáticas básicas antes de preencher o campo.
- **Por que existe:** Os usuários frequentemente precisam somar valores (ex: "150 + 200 + 50") ou fazer cálculos simples ao registrar transações, e precisam sair do app para usar uma calculadora externa.
- **Quem usa:** Usuários do FinTrack ao criar ou editar transações e transferências.
- **Escopo:** Campo de valor nos formulários de: Nova Transação, Editar Transação e Transferência entre Contas.

---

## 2. Analise dos Documentos de Referência

- **Guia de spec** (este documento): todas as seções serão preenchidas
- **Documento de requisitos** `docs/REQUISITOS.md`: funcionalidade 2 (Receitas e Despesas) e 4.3 (Transferência)
- **Documentação técnica existente**: padrão de componentes UI em `src/components/ui/`
- **Código-fonte relevante**: 
  - `src/components/transacoes/transacao-form.tsx` - formulário de transações
  - `src/pages/Transferencia.tsx` - formulário de transferência
  - `src/components/ui/dialog.tsx` - componente Dialog já disponível

---

## 3. Historia de Usuario

```
Como usuário do FinTrack,
quero usar uma calculadora ao inserir o valor de uma transação,
para que eu possa fazer contas rápidas sem sair do aplicativo.
```

**Cenários alternativos:**
- Usuário insere expressão inválida: sistema exibe erro e impede aplicação
- Usuário tenta aplicar valor zero ou negativo: botão "Aplicar" fica desabilitado
- Usuário fecha o dialog sem aplicar: valor original permanece inalterado

---

## 4. Requisitos Funcionais

- [x] RF-01: O sistema exibe um ícone de calculadora ao lado do campo de valor
- [x] RF-02: Ao clicar no ícone, abre-se um dialog com calculadora
- [x] RF-03: A calculadora permite inserir números e operadores (+, -, *, /)
- [x] RF-04: A calculadora exibe o resultado em tempo real conforme a expressão é digitada
- [x] RF-05: O botão "Aplicar" preenche o campo de valor com o resultado calculado
- [x] RF-06: A calculadora funciona nos formulários de criar, editar e transferir transação
- [x] RF-07: A calculadora suporta parênteses para expressões complexas
- [x] RF-08: Botão "C" limpa a expressão e "⌫" apaga o último caractere
- [x] RF-09: Ao abrir a calculadora em modo de edição, o campo é preenchido com o valor atual do input

---

## 5. Requisitos Nao-Funcionais

- **Performance:** cálculo em tempo real sem delays perceptíveis
- **Segurança:** expressão sanitizada antes de avaliar (apenas números e operadores)
- **Acessibilidade:** botão de calculadora com `title` para leitores de tela
- **Compatibilidade:** funciona em todos os navegadores modernos

### 5.1 UI/UX Responsivo

- Dialog da calculadora responsivo (max-w-sm em mobile, max-w-md em desktop)
- Botões da calculadora com área mínima de toque (h-10 = 40px)
- Layout 4 colunas que se adapta ao tamanho da tela

---

## 6. Analise da Aplicação

- **Arquitetura geral:** React + TypeScript com componentes UI baseados em Radix UI
- **Padrões em uso:** shadcn/ui, React Hook Form, Zod para validação
- **Fluxo de dados:** Componente Calculator recebe callback `onApply` que atualiza o campo via `setValue` do React Hook Form
- **Contratos de API:** N/A (componente puramente frontend)

---

## 7. Arquivos Envolvidos

| Arquivo | Ação | Razão |
|---------|------|-------|
| `src/components/ui/calculator.tsx` | Criar | Novo componente de calculadora |
| `src/components/transacoes/transacao-form.tsx` | Modificar | Adicionar calculadora ao campo valor |
| `src/pages/Transferencia.tsx` | Modificar | Adicionar calculadora ao campo valor |

---

## 8. Problemas e Impedimentos

### 8.1 Problemas Tecnicos

- Nenhum impedimento identificado

### 8.2 Ambiguidades nos Requisitos

- Nenhuma ambiguidade

### 8.3 Riscos

- Risco baixo: componente isolado, sem impacto em outros módulos

---

## 9. Criterios de Aceite

- [x] CA-01: dado que estou criando uma transação, quando clico no ícone de calculadora, então um dialog com calculadora é aberto
- [x] CA-02: dado que a calculadora está aberta, quando insiro "100+50" e clico em "=", então o resultado "150.00" é exibido
- [x] CA-03: dado que um resultado válido é exibido, quando clico em "Aplicar", então o campo de valor é preenchido com o resultado
- [x] CA-04: dado que estou editando uma transação, quando abro a calculadora e aplico um valor, então o campo de valor é atualizado
- [x] CA-05: dado que estou fazendo uma transferência, quando uso a calculadora, então o campo de valor é preenchido corretamente
- [x] CA-06: dado que insiro uma expressão inválida, quando tento aplicar, então o botão fica desabilitado
- [x] CA-07: responsividade — o dialog da calculadora funciona em mobile (375px) e desktop (1440px)

---

## 10. Plano de Implementacao (Passo a Passo)

```
Passo 1: Criar componente Calculator
  - O que fazer: Criar src/components/ui/calculator.tsx com Dialog, display de expressão e botões
  - Arquivo(s): src/components/ui/calculator.tsx
  - Como validar: Componente renderiza sem erros, botões funcionam

Passo 2: Integrar no formulário de transação
  - O que fazer: Importar Calculator e adicionar ao lado do campo valor em transacao-form.tsx
  - Arquivo(s): src/components/transacoes/transacao-form.tsx
  - Como validar: Abrir formulário de nova transação, clicar no ícone, calculadora abre

Passo 3: Integrar na transferência
  - O que fazer: Importar Calculator e adicionar ao lado do campo valor em Transferencia.tsx
  - Arquivo(s): src/pages/Transferencia.tsx
  - Como validar: Abrir tela de transferência, usar calculadora

Passo 4: Testar cenários
  - O que fazer: Testar criação, edição e transferência com calculadora
  - Arquivo(s): Todos os arquivos modificados
  - Como validar: Expressões matemáticas são calculadas corretamente e valor aplicado
```

---

## 11. Rollout e Observabilidade

- **Estratégia de entrega:** Deploy direto (feature puramente visual)
- **Como monitorar:** N/A (sem impacto em backend)
- **Plano de rollback:** Remover import e uso do componente Calculator

---

## 12. Definição de Pronto (DoD)

- [x] Todos os critérios de aceite foram verificados
- [x] Código revisado (auto-revisão documentada)
- [x] Documentação atualizada (este arquivo)
- [x] Sem warnings ou erros não tratados introduzidos
- [x] N/A Migração de banco aplicada
- [x] Seção Histórico de Correções atualizada em spec.md
