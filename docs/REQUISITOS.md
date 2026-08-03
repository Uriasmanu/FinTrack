# FinTrack - Documento de Requisitos

## Visão Geral

O **FinTrack** é um aplicativo web desenvolvido em **React** para controle financeiro pessoal. O app permite ao usuário gerenciar receitas, despesas, contas bancárias, cartões e metas de economia, além de visualizar gráficos e exportar dados.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React + Vite | 18.x / 5.x |
| Linguagem | TypeScript | 5.x |
| Estilização | Tailwind CSS | 3.4+ |
| Componentes | shadcn/ui | latest |
| Navegação | React Router | 6.x |
| Gráficos | Recharts | 2.x |
| Armazenamento Local | JSON por ano (localStorage) | — |
| Geração de PDF | jsPDF + html2canvas | — |
| Geração de CSV | papaparse | — |
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
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "recharts": "^2.12.0",
    "papaparse": "^5.4.0",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "lucide-react": "^0.400.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-slot": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-progress": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/papaparse": "^5.3.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
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
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Router principal
│   ├── index.css                   # Tailwind imports
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
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
│   │   │   └── separator.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── saldo-card.tsx
│   │   │   ├── receitas-despesas-card.tsx
│   │   │   └── resumo-mensal.tsx
│   │   ├── transacoes/
│   │   │   ├── transacao-item.tsx
│   │   │   ├── transacao-form.tsx
│   │   │   └── filtros.tsx
│   │   ├── graficos/
│   │   │   ├── barras-mensais.tsx
│   │   │   ├── pizza-categorias.tsx
│   │   │   └── linha-saldo.tsx
│   │   └── metas/
│   │       ├── meta-card.tsx
│   │       └── progresso-meta.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Transacoes.tsx
│   │   ├── NovaTransacao.tsx
│   │   ├── EditarTransacao.tsx
│   │   ├── Categorias.tsx
│   │   ├── Contas.tsx
│   │   ├── Cartoes.tsx
│   │   ├── Graficos.tsx
│   │   ├── Metas.tsx
│   │   ├── NovaMeta.tsx
│   │   ├── Exportar.tsx
│   │   └── Configuracoes.tsx
│   ├── lib/
│   │   ├── storage.ts              # Leitura/escrita localStorage
│   │   ├── export.ts               # Exportação PDF/CSV
│   │   ├── calculos.ts             # Cálculos financeiros
│   │   └── cn.ts                   # Utility para classes
│   ├── data/
│   │   ├── categorias-default.json
│   │   └── templates-metas.json
│   ├── stores/
│   │   └── useFinanceStore.ts      # Zustand store
│   └── types/
│       └── index.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
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

- Gráfico de barras: receitas vs despesas por mês (Recharts)
- Gráfico de pizza: distribuição de despesas por categoria
- Gráfico de linha: evolução do saldo ao longo do tempo
- Seletor de período para análise
- Dados atualizados em tempo real conforme cadastro de transações

### 6. Metas de Economia

- Criação de metas com valor alvo e prazo
- Acompanhamento do progresso (porcentagem e valor acumulado)
- Edição e exclusão de metas
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

- **Exportar para PDF**: relatório mensal/anual com gráficos e tabelas (jsPDF + html2canvas)
- **Exportar para CSV**: dados brutos para uso em planilhas (papaparse)
- Seleção de período para exportação
- Download direto no navegador

### 8. Armazenamento Local (JSON por Ano)

- Um único JSON por ano: `fintrack_2026.json`, `fintrack_2027.json`, etc.
- O JSON do ano atual é o ativo (lido e escrito)
- Ao mudar o ano, o app cria um novo JSON automaticamente
- Todos os dados do ano ficam em um único arquivo
- Backup e restauração de dados (importação/exportação do JSON)

---

## Estrutura de Dados (JSON por Ano)

```json
{
  "ano": 2026,
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

## Rotas

| Rota | Página | Descrição |
|---|---|---|
| `/` | Dashboard | Resumo financeiro e indicadores |
| `/transacoes` | Transacoes | Lista com filtros e busca |
| `/transacoes/nova` | NovaTransacao | Formulário de cadastro |
| `/transacoes/:id` | EditarTransacao | Formulário de edição |
| `/categorias` | Categorias | Gestão de categorias |
| `/contas` | Contas | Gestão de contas bancárias |
| `/cartoes` | Cartoes | Gestão de cartões de crédito |
| `/graficos` | Graficos | Visualização gráfica dos dados |
| `/metas` | Metas | Acompanhamento de metas de economia |
| `/metas/nova` | NovaMeta | Cadastrar nova meta |
| `/exportar` | Exportar | Opções de exportação PDF/CSV |
| `/configuracoes` | Configuracoes | Preferências, salário e backup |

---

## Configurações do Projeto

### vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Requisitos Não Funcionais

- **Performance**: carregamento rápido das telas (< 2s)
- **Usabilidade**: interface intuitiva e responsiva
- **Segurança**: dados armazenados localmente (sem servidor externo)
- **Acessibilidade**: suporte a leitores de tela e fontes escaláveis
- **Responsividade**: layout adaptável para desktop e mobile
- **Offline**: funcionamento completo sem conexão com a internet
- **Navegadores**: Chrome, Firefox, Safari, Edge (últimas 2 versões)
