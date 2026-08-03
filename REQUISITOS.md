# FinTrack - Documento de Requisitos

## Visão Geral

O **FinTrack** é um aplicativo mobile desenvolvido em **React Native (Expo)** para controle financeiro pessoal. O app permite ao usuário gerenciar receitas, despesas, contas bancárias, cartões e metas de economia, além de visualizar gráficos e exportar dados.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React Native (Expo) | SDK 52+ |
| Linguagem | TypeScript | 5.x |
| Estilização | NativeWind (Tailwind CSS) | 4.x |
| Componentes | React Native Reusables (shadcn) | latest |
| Navegação | Expo Router | 4.x |
| Gráficos | react-native-gifted-charts | latest |
| Armazenamento Local | expo-file-system + JSON | — |
| Geração de PDF | expo-print | — |
| Geração de CSV | papaparse + expo-sharing | — |
| Formulários | React Hook Form + Zod | latest |
| Ícones | lucide-react-native | latest |
| UUID | expo-crypto | — |

---

## Dependências (package.json)

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-file-system": "~18.0.0",
    "expo-print": "~13.0.0",
    "expo-sharing": "~13.0.0",
    "expo-crypto": "~14.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-gifted-charts": "^1.4.0",
    "react-native-linear-gradient": "^2.8.0",
    "react-native-svg": "^15.0.0",
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react-native": "^0.400.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "papaparse": "^5.4.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.5.0",
    "@babel/core": "^7.24.0"
  }
}
```

---

## Paleta de Cores

### Tema Claro

| Elemento | Cor | Código |
|---|---|---|
| Fundo Principal | Branco | `#FFFFFF` |
| Fundo Secundário | Cinza Claro | `#F8F9FA` |
| Fundo Card | Branco | `#FFFFFF` |
| Texto Principal | Cinza Escuro | `#1A1A2E` |
| Texto Secundário | Cinza Médio | `#6C757D` |
| Texto Suave | Cinza Claro | `#ADB5BD` |
| Primária | Azul | `#2563EB` |
| Primária Hover | Azul Escuro | `#1D4ED8` |
| Sucesso / Receita | Verde | `#16A34A` |
| Sucesso Fundo | Verde Claro | `#DCFCE7` |
| Perigo / Despesa | Vermelho | `#DC2626` |
| Perigo Fundo | Vermelho Claro | `#FEE2E2` |
| Aviso | Amarelo | `#F59E0B` |
| Aviso Fundo | Amarelo Claro | `#FEF3C7` |
| Borda | Cinza Borda | `#E5E7EB` |

### Tema Escuro

| Elemento | Cor | Código |
|---|---|---|
| Fundo Principal | Preto | `#0A0A0A` |
| Fundo Secundário | Cinza Escuro | `#1A1A2E` |
| Fundo Card | Cinza Card | `#16213E` |
| Texto Principal | Branco | `#F8F9FA` |
| Texto Secundário | Cinza Claro | `#9CA3AF` |
| Texto Suave | Cinza Médio | `#6B7280` |
| Primária | Azul | `#3B82F6` |
| Sucesso / Receita | Verde | `#22C55E` |
| Perigo / Despesa | Vermelho | `#EF4444` |
| Aviso | Amarelo | `#EAB308` |
| Borda | Cinza Borda | `#2D2D3F` |

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
| Outros | `#6B7280` (Cinza) |

---

## Estrutura de Pastas

```
fintrack/
├── app/                          # Expo Router (rotas)
│   ├── _layout.tsx               # Layout raiz
│   ├── (tabs)/                   # Rotas com tab navigation
│   │   ├── _layout.tsx           # Configuração das tabs
│   │   ├── index.tsx             # Dashboard (Home)
│   │   ├── transacoes.tsx        # Lista de transações
│   │   ├── graficos.tsx          # Gráficos
│   │   └── config.tsx            # Configurações
│   ├── transacoes/
│   │   ├── nova.tsx              # Nova transação
│   │   └── [id].tsx              # Editar transação
│   ├── categorias/
│   │   ├── index.tsx             # Lista de categorias
│   │   └── nova.tsx              # Nova categoria
│   ├── contas/
│   │   ├── index.tsx             # Lista de contas
│   │   ├── nova.tsx              # Nova conta
│   │   └── [id].tsx              # Editar conta
│   ├── cartoes/
│   │   ├── index.tsx             # Lista de cartões
│   │   ├── nova.tsx              # Novo cartão
│   │   └── [id].tsx              # Editar cartão
│   ├── metas/
│   │   ├── index.tsx             # Lista de metas
│   │   ├── nova.tsx              # Nova meta
│   │   └── [id].tsx              # Editar meta
│   └── exportar.tsx              # Tela de exportação
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── saldo-card.tsx
│   │   ├── receitas-despesas-card.tsx
│   │   └── resumo-mensal.tsx
│   ├── transacoes/
│   │   ├── transacao-item.tsx
│   │   └── transacao-form.tsx
│   ├── graficos/
│   │   ├── barras-mensais.tsx
│   │   ├── pizza-categorias.tsx
│   │   └── linha-saldo.tsx
│   └── metas/
│       ├── meta-card.tsx
│       └── progresso-meta.tsx
├── lib/                          # Utilitários
│   ├── storage.ts                # Leitura/escrita de JSON
│   ├── export.ts                 # Exportação PDF/CSV
│   ├── calculos.ts               # Cálculos financeiros
│   ├── uuid.ts                   # Geração de IDs
│   └── cn.ts                     # Utility para classes
├── data/                         # Dados iniciais
│   ├── categorias-default.json
│   └── templates-metas.json
├── stores/                       # State management
│   └── useFinanceStore.ts        # Zustand store
├── types/                        # Tipagens TypeScript
│   └── index.ts
├── tailwind.config.js
├── nativewind-env.d.ts
├── app.json
└── package.json
```

---

## Funcionalidades

### 1. Dashboard com Resumo Financeiro

- Exibição do saldo total consolidado
- Resumo de receitas e despesas do mês atual
- Comparativo com o mês anterior
- Cards com indicadores rápidos (saldo, receitas, despesas, economia)
- Últimas 5 transações realizadas

### 2. Receitas e Despesas

- Cadastro de transações (receita ou despesa)
- Campos: descrição, valor, data, categoria, conta associada
- Edição e exclusão de transações
- Listagem com filtros por período, categoria e tipo
- Busca por descrição
- Marcar transação como recorrente

### 3. Categorias Personalizadas

- Criação de categorias customizadas pelo usuário
- Edição e exclusão de categorias
- Ícones (lucide) e cores para identificação visual
- Categorias padrão pré-definidas:
  - Alimentação, Transporte, Moradia, Lazer
  - Saúde, Educação, Salário, Investimentos, Outros

### 4. Contas Bancárias e Cartões

- Cadastro de contas bancárias (nome, saldo inicial, banco, tipo)
- Cadastro de cartões de crédito (limite, data de fechamento, vencimento)
- Associação de transações a contas/cartões
- Edição e exclusão de contas e cartões
- Resumo de saldo por conta e fatura por cartão

### 5. Gráficos Mensais

- Gráfico de barras: receitas vs despesas por mês
- Gráfico de pizza: distribuição de despesas por categoria
- Gráfico de linha: evolução do saldo ao longo do tempo
- Seletor de período para análise
- Dados atualizados em tempo real conforme cadastro de transações

### 6. Metas de Economia

- Criação de metas com valor alvo e prazo
- Acompanhamento do progresso (porcentagem e valor acumulado)
- Edição e exclusão de metas
- Notificações de progresso (opcional)
- Visualização de metas atingidas e pendentes

#### 6.1 Regras de Metas (baseadas no salário)

O usuário define seu salário mensal na configuração. As metas são calculadas automaticamente com base nesse valor:

| Meta | Fórmula | Descrição |
|---|---|---|
| Viver de Renda | `salário × 200` | Valor necessário para viver apenas de rendimentos passivos |
| Reserva de Emergência Total | `salário × 6` | Cobertura de 6 meses de despesas |
| Guardar por Mês | `salário × 0,1` | Valor mínimo para economizar todo mês (10% do salário) |
| Valor Máximo em Conta Fixa | `salário × 0,6` | Limite máximo gasto com despesas fixas (60% do salário) |
| Lazer | `salário × 0,3` | Orçamento mensal para lazer e entretenimento (30% do salário) |

> **Nota**: O usuário pode ajustar os multiplicadores nas configurações do app.

### 7. Exportação de Dados

- **Exportar para PDF**: relatório mensal/anual com gráficos e tabelas
- **Exportar para CSV**: dados brutos para uso em planilhas
- Seleção de período para exportação
- Compartilhamento via apps do dispositivo (e-mail, messaging, etc.)

### 8. Armazenamento Local (JSON Interno)

- Todos os dados persistidos em arquivo JSON via `expo-file-system`
- Estrutura de dados organizada por módulo:
  - `transacoes.json` — lista de receitas e despesas
  - `categorias.json` — categorias personalizadas
  - `contas.json` — contas bancárias
  - `cartoes.json` — cartões de crédito
  - `metas.json` — metas de economia
  - `config.json` — configurações do usuário (salário, tema, etc.)
- Backup e restauração de dados (importação/exportação do JSON)

---

## Estrutura de Dados (JSON)

```json
{
  "transacoes": [
    {
      "id": "uuid",
      "tipo": "receita | despesa",
      "descricao": "string",
      "valor": 0.00,
      "data": "YYYY-MM-DD",
      "categoriaId": "uuid",
      "contaId": "uuid",
      "cartaoId": "uuid | null",
      "recorrente": false,
      "criadoEm": "ISO timestamp"
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
      "nome": "string",
      "banco": "string",
      "saldoInicial": 0.00,
      "tipo": "corrente | poupanca | investimento"
    }
  ],
  "cartoes": [
    {
      "id": "uuid",
      "nome": "string",
      "bandeira": "string",
      "limite": 0.00,
      "diaFechamento": 1,
      "diaVencimento": 10
    }
  ],
  "metas": [
    {
      "id": "uuid",
      "nome": "string",
      "valorAlvo": 0.00,
      "valorAtual": 0.00,
      "dataInicio": "YYYY-MM-DD",
      "dataFim": "YYYY-MM-DD",
      "status": "em_andamento | concluida | cancelada"
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
    }
  }
}
```

---

## Telas Principais

| Tela | Rota | Descrição |
|---|---|---|
| Dashboard | `(tabs)/` | Resumo financeiro e indicadores |
| Transações | `(tabs)/transacoes` | Lista com filtros e busca |
| Nova Transação | `/transacoes/nova` | Formulário de cadastro |
| Editar Transação | `/transacoes/[id]` | Formulário de edição |
| Categorias | `/categorias` | Gestão de categorias |
| Contas | `/contas` | Gestão de contas bancárias |
| Cartões | `/cartoes` | Gestão de cartões de crédito |
| Gráficos | `(tabs)/graficos` | Visualização gráfica dos dados |
| Metas | `/metas` | Acompanhamento de metas de economia |
| Exportar | `/exportar` | Opções de exportação PDF/CSV |
| Configurações | `(tabs)/config` | Preferências, salário e backup |

---

## Configurações do Projeto

### app.json

```json
{
  "expo": {
    "name": "FinTrack",
    "slug": "fintrack",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "backgroundColor": "#2563EB"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.fintrack.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#2563EB"
      },
      "package": "com.fintrack.app"
    },
    "plugins": [
      "expo-router",
      "expo-file-system",
      "expo-print",
      "expo-sharing"
    ]
  }
}
```

### tailwind.config.js

```js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        "primary-hover": "#1D4ED8",
        success: "#16A34A",
        "success-bg": "#DCFCE7",
        danger: "#DC2626",
        "danger-bg": "#FEE2E2",
        warning: "#F59E0B",
        "warning-bg": "#FEF3C7",
        border: "#E5E7EB",
      },
    },
  },
  plugins: [],
};
```

---

## Requisitos Não Funcionais

- **Performance**: carregamento rápido das telas (< 2s)
- **Usabilidade**: interface intuitiva e responsiva
- **Segurança**: dados armazenados localmente (sem servidor externo)
- **Acessibilidade**: suporte a leitores de tela e fontes escaláveis
- **Compatibilidade**: Android 10+ e iOS 14+
- **Offline**: funcionamento completo sem conexão com a internet
