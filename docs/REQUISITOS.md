# FinTrack - Documento de Requisitos

## Visão Geral

O **FinTrack** é um aplicativo web desenvolvido em **React** para controle financeiro pessoal. O app permite ao usuário gerenciar receitas, despesas, contas bancárias, cartões e metas de economia, além de visualizar gráficos e exportar dados.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React + Vite | 19.x / 8.x |
| Linguagem | TypeScript | 6.x |
| Estilização | Tailwind CSS | 4.x |
| Componentes | shadcn/ui | latest |
| Navegação | React Router | 7.x |
| Estado | Zustand | 5.x |
| Gráficos | Recharts | 3.x |
| Armazenamento | Arquivo JSON único servido por backend Express (`data/fintrack.json`) | — |
| Formulários | React Hook Form + Zod | latest |
| Ícones | lucide-react | latest |
| UUID | crypto.randomUUID() | nativo |

---

## Dependências (package.json)

```json
{
  "name": "fintrack",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-alert-dialog": "^1.1.23",
    "@radix-ui/react-checkbox": "^1.3.11",
    "@radix-ui/react-dialog": "^1.1.23",
    "@radix-ui/react-dropdown-menu": "^2.1.24",
    "@radix-ui/react-progress": "^1.1.16",
    "@radix-ui/react-select": "^2.3.7",
    "@radix-ui/react-separator": "^1.1.15",
    "@radix-ui/react-slider": "^1.4.7",
    "@radix-ui/react-slot": "^1.3.3",
    "@radix-ui/react-switch": "^1.3.7",
    "@radix-ui/react-tabs": "^1.1.21",
    "@radix-ui/react-tooltip": "^1.2.16",
    "@tailwindcss/vite": "^4.3.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.2.1",
    "lucide-react": "^1.28.0",
    "papaparse": "^5.5.4",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-hook-form": "^7.84.0",
    "react-router-dom": "^7.18.2",
    "recharts": "^3.10.1",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^4.3.3",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^24.13.3",
    "@types/papaparse": "^5.5.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "eslint": "^10.8.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.3",
    "globals": "^17.7.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.65.0",
    "vite": "^8.2.0"
  }
}
```

---

## Paleta de Cores

### Tema Claro

| Elemento | Cor | Código |
|---|---|---|
| Fundo Principal | Creme | `#F2E8C4` |
| Fundo Secundário | Creme Claro | `hsl(43 30% 94%)` |
| Fundo Card | Branco | `#FFFFFF` |
| Texto Principal | Preto | `hsl(0 0% 8%)` |
| Texto Secundário | Cinza Médio | `hsl(0 0% 45%)` |
| Texto Suave | Cinza Claro | `hsl(0 0% 60%)` |
| Primária | Verde-Água | `#3EC9A7` |
| Primária Hover | Verde-Água Escuro | `hsl(174 55% 30%)` |
| Sucesso / Receita | Verde | `hsl(142 50% 45%)` |
| Perigo / Despesa | Vermelho | `hsl(0 72% 51%)` |
| Aviso | Amarelo | `hsl(38 80% 50%)` |
| Borda | Creme Borda | `hsl(43 20% 88%)` |

### Tema Escuro

| Elemento | Cor | Código |
|---|---|---|
| Fundo Principal | Azul Escuro | `hsl(210 15% 10%)` |
| Fundo Secundário | Azul Carta | `hsl(210 12% 14%)` |
| Fundo Card | Azul Card | `hsl(210 12% 14%)` |
| Texto Principal | Branco | `hsl(0 0% 92%)` |
| Texto Secundário | Cinza Claro | `hsl(0 0% 60%)` |
| Primária | Verde-Água | `hsl(174 55% 40%)` |
| Sucesso / Receita | Verde | `hsl(142 50% 50%)` |
| Perigo / Despesa | Vermelho | `hsl(0 65% 55%)` |
| Aviso | Amarelo | `hsl(38 80% 55%)` |
| Borda | Azul Borda | `hsl(210 10% 22%)` |

### Cores de Categorias (Padrão)

| Categoria | Cor |
|---|---|
| Alimentação | `#F97316` (Laranja) |
| Transporte | `#3B82F6` (Azul) |
| Moradia | `#8B5CF6` (Roxo) |
| Lazer | `#EC4899` (Rosa) |
| Saúde | `#10B981` (Verde) |
| Educação | `#06B6D4` (Ciano) |
| Salário | `#16A34A` (Verde) |
| Investimentos | `#6366F1` (Índigo) |
| Ticket | `#F59E0B` (Amarelo) |
| Outros | `#6B7280` (Cinza) |
| Dívida | `#DC2626` (Vermelho) |
| VA/VR | `#059669` (Verde Escuro) |
| Transferência | `#8B5CF6` (Roxo) |
| Guardar | `#16A34A` (Verde) |

---

## Estrutura de Pastas

```
fintrack/
├── public/
├── data/
│   └── fintrack.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts
│   ├── stores/
│   │   └── useFinanceStore.ts
│   ├── lib/
│   │   ├── storage.ts
│   │   ├── calculos.ts
│   │   ├── transacoes.ts
│   │   ├── uuid.ts
│   │   └── cn.ts
│   ├── data/
│   │   ├── config-default.json
│   │   ├── categorias-default.json
│   │   └── defaults.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Transacoes.tsx
│   │   ├── NovaTransacao.tsx
│   │   ├── EditarTransacao.tsx
│   │   ├── Transferencia.tsx
│   │   ├── Categorias.tsx
│   │   ├── Contas.tsx
│   │   ├── Cartoes.tsx
│   │   ├── Graficos.tsx
│   │   ├── Metas.tsx
│   │   ├── Exportar.tsx
│   │   └── Configuracoes.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── delete-confirm-dialog.tsx
│   │   │   └── error-boundary.tsx
│   │   ├── layout/
│   │   │   ├── layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── dashboard/
│   │   │   ├── saldo-card.tsx
│   │   │   ├── receitas-despesas-card.tsx
│   │   │   ├── resumo-mensal.tsx
│   │   │   ├── proximas-transacoes.tsx
│   │   │   ├── resumo-categorias.tsx
│   │   │   ├── objetivos-personalizados.tsx
│   │   │   ├── despesas-por-finalidade.tsx
│   │   │   ├── alerta-metas.tsx
│   │   │   └── ultimas-transacoes.tsx
│   │   ├── transacoes/
│   │   │   ├── transacao-form.tsx
│   │   │   ├── transacao-item.tsx
│   │   │   └── filtros.tsx
│   │   ├── categorias/
│   │   │   ├── categoria-form.tsx
│   │   │   └── categoria-card.tsx
│   │   ├── contas/
│   │   │   ├── conta-form.tsx
│   │   │   └── conta-card.tsx
│   │   ├── cartoes/
│   │   │   ├── cartao-form.tsx
│   │   │   └── cartao-card.tsx
│   │   └── metas/
│   │       ├── meta-form.tsx
│   │       ├── meta-card.tsx
│   │       └── metas-predefinidas.tsx
├── eslint.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── package.json
```

---

## Funcionalidades

### 1. Dashboard com Resumo Financeiro ✅

- Exibição do saldo total consolidado (inclui saldoInicial + transações anteriores)
- Resumo de receitas e despesas do mês atual
- Comparativo com o mês anterior (variação percentual)
- Cards com indicadores rápidos (saldo, receitas, despesas, economia)
- Próximas transações (pendentes/não confirmadas) com botão de efetivar
- Top 3 categorias de despesa com barras de progresso
- Despesas por finalidade (Gastos Fixos, Lazer, Educação)
- Objetivos personalizados com toggle ativo/desativado
- Navegação entre meses (anterior/próximo + botão "Hoje")
- Botão de efetivar transação diretamente no card "Próximas Transações"
- ✅ **Implementado**: `Dashboard.tsx` + 8 componentes em `components/dashboard/`

### 2. Receitas e Despesas ✅

- Cadastro de transações (receita ou despesa)
- Campos: descrição, valor, data, categoria, conta associada, cartão (opcional)
- Edição e exclusão de transações
- Listagem com filtros por período, categoria, tipo e conta
- Busca por descrição

#### 2.1 Extrato com Saldo ✅

A listagem de transações funciona como um **extrato bancário**, exibindo o saldo após cada transação:

- Cada linha mostra: data, descrição, valor (entrada/saída) e **saldo acumulado**
- O saldo é calculado em tempo real conforme as transações são listadas
- Transações futuras (parceladas ou recorrentes) também são consideradas no saldo
- Exibe saldo do dia (início e fim) e saldo acumulado
- Saldo efetivado (apenas confirmadas) vs saldo projetado (todas)
- Considera saldoInicial das contas e transações anteriores ao período

**Exemplo de exibição:**

| Data | Descrição | Valor | Saldo |
|---|---|---|---|
| 01/01 | Salário | +R$ 5.000,00 | R$ 5.000,00 |
| 03/01 | Aluguel | -R$ 1.500,00 | R$ 3.500,00 |
| 05/01 | Supermercado | -R$ 800,00 | R$ 2.700,00 |
| 10/01 | Parcela Celular 3/12 | -R$ 250,00 | R$ 2.450,00 |
| 15/01 | Freela | +R$ 1.200,00 | R$ 3.650,00 |

#### 2.2 Campo Confirmada (Efetivada/Pago) ✅

Cada transação possui um campo `confirmada` que indica se já foi paga/confirmada:

- Checkbox "Transação efetivada" no formulário de cadastro/edição
- Badge visual "Efetivada" no item do extrato
- Extrato exibe saldo "Efetivado" vs "Projetado" separadamente
- ✅ **Implementado**: `transacao-form.tsx`, `transacao-item.tsx`, `Transacoes.tsx`

#### 2.3 Tipo de Recorrência ✅

Ao cadastrar uma transação, o usuário deve escolher o tipo de recorrência:

| Tipo | Descrição | Exemplo |
|---|---|---|
| **Única** | Transação única, sem repetição | Compra de um produto à vista |
| **Recorrente** | Repete indefinidamente, sem prazo final | Aluguel, assinatura de streaming |
| **Parcelado** | Repete por número definido de parcelas | Compra parcelada em 12x |

**Transação Única:**
- Sem campos adicionais
- Gera apenas uma transação

**Transação Recorrente (sem prazo final):**
- Repete todo mês na mesma data
- Sem número definido de parcelas
- Pode ser cancelada a qualquer momento
- Campo `tipoRecorrencia`: `"unica" | "recorrente" | "parcelado"`

**Transação Parcelada:**
- Campo adicional: `parcelaAtual` e `totalParcelas`
- Título exibe progresso: "Netflix 5/36"
- Parcela inicial pode começar de qualquer quantidade (ex: 1/36, 5/36, 12/36)
- Cada parcela gera uma transação individual na data correspondente
- Ao editar o total de parcelas, as parcelas futuras são recalculadas automaticamente
- Exclusão de uma parcela exclui todas as parcelas futuras

#### 2.4 Edição Individual vs em Grupo ✅

- Dialog oferece "Só esta" e "Todas as seguintes"
- Edição individual: edita apenas a transação selecionada
- Edição em grupo: exclui parcelas futuras e recalcula o grupo
- ✅ **Implementado**: `EditarTransacao.tsx`, `transacoes.ts`

#### 2.5 Detecção de Duplicatas ✅

- Ao cadastrar nova transação, verifica se já existe transação com mesma descrição, valor e data
- Exibe alerta visual com detalhes das transações potencialmente duplicadas
- Não bloqueia a criação, apenas avisa
- ✅ **Implementado**: `transacao-form.tsx`

#### 2.6 Auto-vinculação a Conta Ticket ✅

- Quando a categoria é "Alimentação" (cat-001), "Ticket" (cat-009) ou "VA/VR" (cat-012)
- O formulário automaticamente seleciona a conta do tipo "ticket"
- ✅ **Implementado**: `transacao-form.tsx`

### 3. Categorias Personalizadas ✅

- Criação de categorias customizadas pelo usuário
- Edição e exclusão de categorias
- Cores para identificação visual (paleta de 10 cores)
- Tipos: receita, despesa, ambos
- Proteção contra exclusão de categorias com transações vinculadas
- Categorias padrão pré-definidas (19 categorias):

| ID | Nome | Tipo | Cor |
|----|------|------|-----|
| cat-001 | Alimentação | despesa | #F97316 |
| cat-002 | Transporte | despesa | #3B82F6 |
| cat-003 | Moradia | despesa | #8B5CF6 |
| cat-004 | Lazer | despesa | #EC4899 |
| cat-005 | Saúde | despesa | #10B981 |
| cat-006 | Educação | despesa | #06B6D4 |
| cat-007 | Salário | receita | #16A34A |
| cat-008 | Investimentos | receita | #6366F1 |
| cat-009 | Ticket | receita | #F59E0B |
| cat-010 | Outros | ambos | #6B7280 |
| cat-011 | Dívida | despesa | #DC2626 |
| cat-012 | VA/VR | receita | #059669 |
| cat-013 | Transferência | ambos | #8B5CF6 |
| cat-014 | Guardar | ambos | #16A34A |
| cat-015 | Combustível | despesa | #F59E0B |
| cat-016 | Limpeza | despesa | #06B6D4 |
| cat-017 | Comida | despesa | #10B981 |
| cat-018 | Besteira | despesa | #EC4899 |
| cat-019 | Açougue | despesa | #DC2626 |

- ✅ **Implementado**: `Categorias.tsx`, `categoria-form.tsx`, `categoria-card.tsx`

### 4. Contas Bancárias e Cartões ✅

#### 4.1 Contas Bancárias

- Cadastro de contas bancárias (nome/banco, saldo inicial, tipo)
- Tipos: corrente, poupança, investimento, ticket
- Campo `dataCriacao` opcional para controle de saldo inicial
- Exibe saldo hoje (confirmado) e saldo do mês (projetado)
- Proteção contra exclusão de contas com transações vinculadas
- ✅ **Implementado**: `Contas.tsx`, `conta-form.tsx`, `conta-card.tsx`

#### 4.2 Cartões de Crédito

- Cadastro de cartões de crédito (nome, bandeira, limite, data de fechamento, vencimento)
- Bandeiras: Visa, Mastercard, Elo, Amex, Outro
- Exibe fatura atual, limite, percentual utilizado (barra de progresso)
- Exibe dias de fechamento e vencimento
- Proteção contra exclusão de cartões com transações vinculadas
- ✅ **Implementado**: `Cartoes.tsx`, `cartao-form.tsx`, `cartao-card.tsx`

#### 4.3 Transferência entre Contas ✅

- Rota `/transferencia`, item no menu lateral
- Formulário: valor, data, conta origem, conta destino, categoria (opcional), descrição (opcional)
- Cria par de transações: despesa na origem + receita no destino
- Ambas vinculadas ao mesmo `grupoParcelaId`
- Validação: origem != destino
- Categoria padrão: "Transferência" (cat-013)
- ✅ **Implementado**: `Transferencia.tsx`

### 5. Gráficos Mensais ✅

- Gráfico de barras: receitas vs despesas por mês
- Gráfico de pizza: distribuição de despesas por categoria
- 3 tipos de dados: Despesas por Categoria, Receitas por Categoria, Evolução Mensal
- 3 tipos de gráfico: Pizza, Barra, Linhas (via Recharts)
- Navegação entre meses
- Cards de resumo para evolução mensal (top 3 meses)
- ✅ **Implementado**: `Graficos.tsx`

> **Nota**: O gráfico de linhas atual mostra receitas e despesas como linhas separadas, não a evolução do saldo como uma única linha.

### 6. Metas de Economia ✅

#### 6.1 Metas Predefinidas (5 metas)

| Nome | Fórmula | Descrição |
|------|---------|-----------|
| Viver de Renda | `salário × 200` | Valor necessário para viver apenas de rendimentos passivos (120 meses) |
| Reserva de Emergência | `salário × 6` | Cobertura de 6 meses de despesas |
| Guardar por Mês | `salário × 0,1` | Meta mensal de economia (10% do salário) |
| Conta Fixa | `despesasRecorrentesMes` ou `salário × 0,6` | Limite máximo para despesas fixas |
| Lazer | `salário × 0,3` | Orçamento para lazer e entretenimento |

- Cálculo automático baseado no maior salário entre categorias de receita
- Multiplicadores configuráveis no `config-default.json`
- ✅ **Implementado**: `defaults.ts`, `metas-predefinidas.tsx`

#### 6.2 Objetivos Personalizados ✅

- Criação com nome, valor alvo, prazo em meses (slider 1-120)
- Cálculo automático da parcela mensal
- Pré-visualização em tempo real ao ajustar o slider
- Barra de progresso com porcentagem acumulada
- Status: em andamento, concluída, cancelada
- Habilitar/Desabilitar objetivos (toggle)
- Seleção de categorias de receita como base para cálculo
- ✅ **Implementado**: `Metas.tsx`, `meta-form.tsx`, `meta-card.tsx`, `objetivos-personalizados.tsx`

### 7. Tema Claro/Escuro ✅

- Toggle de tema no header com dialog de confirmação
- Persistência no arquivo `fintrack.json` (campo `config.tema`) via `PUT /api/data`
- Tema reaplicado ao recarregar a página (leitura do arquivo JSON)
- CSS com variáveis para ambos os temas
- Tema aplicado sem flash na inicialização
- ✅ **Implementado**: `layout.tsx`, `header.tsx`, `index.css`, `useFinanceStore.ts` (`atualizarConfig`)

### 8. Exportação de Dados ✅ (parcial)

- **Exportar para JSON**: download do arquivo JSON com dados do ano atual
- **Importar JSON**: upload com validação de estrutura e dialog de confirmação
- ✅ **Implementado**: `Exportar.tsx`, `storage.ts`
- ❌ **Não implementado**: Exportação para PDF (dependências instaladas mas não utilizadas)
- ❌ **Não implementado**: Exportação para CSV (dependência instalada mas não utilizada)

### 9. Armazenamento em Arquivo JSON ✅

- Persistência física em arquivo JSON único: `data/fintrack.json` (nome derivado do `package.json`)
- Criado automaticamente na inicialização do servidor como primeira ação, com as informações padrão do sistema
- Se o arquivo já existir, não é recriado nem reescrito na inicialização; gravação ocorre apenas em mudanças reais (merge de defaults na primeira execução ou ações do usuário)
- CRUD de contas grava no arquivo e registra timestamp (`criadoEm` na criação, `atualizadoEm` na edição)
- Backup e restauração de dados (importação/exportação do JSON)
- ✅ **Implementado**: `server.js`, `storage.ts`, `useFinanceStore.ts`

---

## Estrutura de Dados (JSON por Ano)

```json
{
  "ano": 2026,
  "transacoes": [
    {
      "id": "uuid",
      "tipo": "receita | despesa",
      "tipoRecorrencia": "unica | recorrente | parcelado",
      "descricao": "string",
      "valor": 0.00,
      "data": "YYYY-MM-DD",
      "categoriaId": "uuid",
      "contaId": "uuid",
      "cartaoId": "uuid | null",
      "parcelaAtual": 1,
      "totalParcelas": 1,
      "grupoParcelaId": "uuid | null",
      "criadoEm": "ISO timestamp",
      "confirmada": false
    }
  ],
  "categorias": [
    {
      "id": "uuid",
      "nome": "string",
      "cor": "#FFFFFF",
      "icone": "string",
      "tipo": "receita | despesa | ambos"
    }
  ],
  "contas": [
    {
      "id": "uuid",
      "banco": "string",
      "saldoInicial": 0.00,
      "tipo": "corrente | poupanca | investimento | ticket",
      "dataCriacao": "YYYY-MM-DD (opcional)",
      "criadoEm": "ISO timestamp",
      "atualizadoEm": "ISO timestamp"
    }
  ],
  "cartoes": [
    {
      "id": "uuid",
      "nome": "string",
      "bandeira": "Visa | Mastercard | Elo | Amex | Outro",
      "limite": 0.00,
      "diaFechamento": 1,
      "diaVencimento": 10
    }
  ],
  "metas": [
    {
      "id": "uuid",
      "nome": "string",
      "tipo": "padrao | personalizado",
      "ativo": true,
      "valorAlvo": 0.00,
      "valorAtual": 0.00,
      "meses": 12,
      "parcelaMensal": 0.00,
      "dataInicio": "YYYY-MM-DD",
      "dataFim": "YYYY-MM-DD",
      "status": "em_andamento | concluida | cancelada",
      "receitasBase": ["categoriaId1", "categoriaId2"]
    }
  ],
  "config": {
    "salario": 0.00,
    "tema": "claro | escuro",
    "moeda": "BRL",
    "multiplicadores": {
      "viverDeRenda": 200,
      "reservaEmergencia": 6,
      "guardarPorMes": 0.1,
      "contaFixa": 0.6,
      "lazer": 0.3
    },
    "criadoEm": "ISO timestamp (opcional)"
  }
}
```

---

## Rotas

| Rota | Página | Descrição |
|---|---|---|
| `/` | Dashboard | Resumo financeiro e indicadores |
| `/transacoes` | Transacoes | Extrato com filtros e busca |
| `/transacoes/nova` | NovaTransacao | Formulário de cadastro |
| `/transacoes/:id` | EditarTransacao | Formulário de edição |
| `/transferencia` | Transferencia | Transferência entre contas |
| `/categorias` | Categorias | Gestão de categorias |
| `/contas` | Contas | Gestão de contas bancárias |
| `/cartoes` | Cartoes | Gestão de cartões de crédito |
| `/graficos` | Graficos | Visualização gráfica dos dados |
| `/metas` | Metas | Acompanhamento de metas de economia |
| `/exportar` | Exportar | Exportação e importação JSON |
| `/configuracoes` | Configuracoes | Gerenciamento de categorias |

---

## Requisitos Não Funcionais

### Performance
- Carregamento inicial deve ocorrer em menos de 2 segundos
- Operações de CRUD devem ser instantâneas (< 100ms)

### Compatibilidade
- Suporte a navegadores modernos (Chrome, Firefox, Safari, Edge)
- Layout responsivo: sidebar colapsável em mobile, conteúdo adaptativo

### Persistência
- Dados persistidos em arquivo JSON físico na pasta `data`, nomeado com o nome da aplicação (`fintrack.json`)
- O arquivo JSON padrão é criado na inicialização do servidor como primeira ação, antes de aceitar requisições
- Se o arquivo já existir, a inicialização não deve recriá-lo nem reescrevê-lo; gravação apenas em mudanças reais
- Estrutura de dados deve ser versionável
- Arquivos legados (`{nome-app}_{ano}.json`) são migrados automaticamente para o arquivo único

### Segurança
- Sistema não deve permitir excluir entidade (conta, cartão, categoria) com transações vinculadas
- Sistema deve exibir aviso de confirmação antes de excluir entidades
- Dados armazenados localmente (sem servidor externo)

### Acessibilidade
- Suporte a leitores de tela e fontes escaláveis
- Elementos interativos devem ter área mínima de toque em mobile

### Manutenibilidade
- Código TypeScript com strict mode
- Componentes reutilizáveis e organizados por domínio

### Offline
- Funcionamento completo sem conexão com a internet

---

## Pendências e Não Implementados

### Funcionalidades com pendências

| # | Funcionalidade | Status | Detalhe |
|---|----------------|--------|---------|
| 1 | Dashboard - Últimas 5 transações | ⚠️ Parcial | Componente `ultimas-transacoes.tsx` existe mas não é renderizado no Dashboard |
| 2 | Gráfico de linha - Evolução do saldo | ⚠️ Parcial | Mostra receitas/despesas separadas, não saldo acumulado |
| 3 | Metas - Multiplicadores editáveis | ⚠️ Parcial | UI de edição não existe — multiplicadores hardcoded nos defaults |
| 4 | Categorias - Ícones visuais | ⚠️ Parcial | Campo `icone` salvo mas não renderizado como ícone lucide |
| 5 | Exportação PDF | ❌ Não implementado | `jspdf` e `html2canvas` instalados mas não utilizados |
| 6 | Exportação CSV | ❌ Não implementado | `papaparse` instalado mas não utilizado |
| 7 | Rota `/metas/nova` | ❌ Não existe | Links em `objetivos-personalizados.tsx` apontam para rota inexistente |

### Funcionalidades corrigidas neste ciclo

| # | Funcionalidade | Correção |
|---|----------------|----------|
| 1 | Saldo do dia no extrato | Movido para abaixo das transações |
| 2 | Categoria Guardar em transferências | Filtrar categorias relevantes |
| 3 | Vermelho no tema escuro | Aumentar luminosidade e saturação |
| 4 | Gráficos sem filtro por conta | Adicionar Select de contas |
| 5 | Sem aviso de saldo negativo | Adicionar projeção e alerta |
| 6 | Recorrentes não aparecem futuros | Gerar para 12 meses |
| 7 | Faltavam categorias específicas | Adicionar 5 categorias novas |
| 8 | Efetivar transação no Dashboard | Adicionar botão Check no card "Próximas Transações" |
| 9 | `fintrack.json` reescrito no load | Gravação seletiva no `inicializar()` — só grava em mudanças reais |
| 10 | Tema não persistido | Tema gravado em `config.tema` no `fintrack.json` via `atualizarConfig` |
| 11 | Contas sem timestamp | Adicionados `criadoEm`/`atualizadoEm` no CRUD de contas |
| 12 | "Editar todas as seguintes" não aplicava alteração | `editarTodas` lê estado via `getState()`, passa todos os campos, handlers com `await` |
| 13 | Saldo dashboard incluía não efetivadas | Seletores `obterSaldoAtual`, `obterReceitasMes`, `obterDespesasMes` etc. filtram por `confirmada: true` |

### Componentes não utilizados

| Componente | Descrição |
|------------|-----------|
| `alerta-metas.tsx` | Analisa progresso das metas vs tempo esperado e gera alertas |
| `ultimas-transacoes.tsx` | Lista as últimas 5 transações do mês |

### Configurações pendentes

| Campo | Status |
|-------|--------|
| Salário mensal | Campo existe na interface mas não é editável na UI |
| Multiplicadores de metas | Hardcoded nos defaults, não editáveis pelo usuário |
| Perfil do usuário | Não implementado |
| Configuração de moeda | Campo existe mas não é editável |

### Dependências não utilizadas

| Dependência | Motivo |
|-------------|--------|
| `jspdf` | Exportação PDF não implementada |
| `html2canvas` | Exportação PDF não implementada |
| `papaparse` | Exportação CSV não implementada |

---

## Histórico de Alterações

| Data | Alteração |
|------|-----------|
| 03/08/2026 | Documento de requisitos atualizado com análise completa da aplicação |
| 03/08/2026 | Stack tecnológica atualizada (React 19, TS 6, Vite 8, Tailwind 4, Router 7, Zustand 5, Recharts 3) |
| 03/08/2026 | Estrutura de pastas reescrita conforme estrutura real do projeto |
| 03/08/2026 | Funcionalidades: 25 completas, 4 parciais, 4 não implementadas, 13 extras documentadas |
| 03/08/2026 | Categorias padrão expandidas de 14 para 19 |
| 03/08/2026 | Estrutura de dados atualizada com campos `confirmada`, `dataCriacao`, `receitasBase`, `criadoEm` |
| 03/08/2026 | Rotas atualizadas: adicionada `/transferencia` |
| 03/08/2026 | Seção de pendências e não implementados adicionada |
| 03/08/2026 | Correções de ciclo: saldo do dia, categorias, tema, gráficos, saldo negativo, recorrentes, categorias novas |
| 03/08/2026 | Correções extras: comparação receitas/despesas, migração de categorias VA/VR |
| 04/08/2026 | Feature: Efetivar transação no Dashboard (botão Check no card Próximas Transações) |
| 04/08/2026 | UI/UX: Paleta de cores atualizada (verde-água, creme, azul escuro) |
| 04/08/2026 | UI/UX: Transições suaves em todos os componentes (hover, active, focus) |
| 04/08/2026 | UI/UX: Responsividade melhorada em todas as telas (grid sm:grid-cols) |
| 04/08/2026 | UI/UX: Cards com sombras e hover effects |
| 04/08/2026 | UI/UX: Sidebar com animação suave e backdrop blur |
| 04/08/2026 | UI/UX: Botões com escala active (scale 0.98) |
| 04/08/2026 | UI/UX: Inputs com focus ring e border transition |
| 04/08/2026 | UI/UX: Header com backdrop blur |
| 04/08/2026 | UI/UX: Empty states com ícones e CTAs |
| 07/08/2026 | Persistência: JSON padrão criado na inicialização do servidor na pasta `data`, nome derivado do package.json |
| 07/08/2026 | Persistência: arquivo `fintrack.json` existente não é reescrito na inicialização (gravação seletiva) |
| 07/08/2026 | Persistência: tema claro/escuro persistido no `fintrack.json` (campo `config.tema`) |
| 07/08/2026 | Estrutura de dados: campo `Conta` ganhou `criadoEm`/`atualizadoEm` (timestamps de criação/edição) |
| 07/08/2026 | Correção: "Editar todas as seguintes" em transação recorrente/parcelada agora aplica alteração corretamente |
| 08/08/2026 | Metas: correção de cálculo de salário (soma por média de 12 meses), nomes sem acento, meta "Guardar por Mês" exibe "% da receita" |
| 08/08/2026 | Metas: arredondamento 2 casas decimais, Conta Fixa/Lazer usam despesas reais do mês, alerta visual de extrapolação |
| 08/08/2026 | Metas: progresso baseado em dados reais (saldo poupança, despesas mês, guardar), breakdown da receita nos cards |
| 08/08/2026 | Extrato: receitas de contas poupança agora aparecem (antes eram excluídas junto com despesas) |
| 08/08/2026 | Metas: categoria Guardar (cat-014) excluída do cálculo de salário-base |
| 08/08/2026 | Extrato: Guardar (cat-014) excluída do saldo acumulado e saldo confirmado do dia |
| 07/08/2026 | Correção: Saldo total no dashboard mostra somente transações efetivadas (`confirmada: true`) |
