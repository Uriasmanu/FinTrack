# FinTrack - Documento de Requisitos

## Visão Geral

O **FinTrack** é um aplicativo mobile desenvolvido em **React Native** para controle financeiro pessoal. O app permite ao usuário gerenciar receitas, despesas, contas bancárias, cartões e metas de economia, além de visualizar gráficos e exportar dados.

---

## Funcionalidades

### 1. Dashboard com Resumo Financeiro

- Exibição do saldo total consolidado
- Resumo de receitas e despesas do mês atual
- Comparativo com o mês anterior
- Cards com indicadores rápidos (saldo, receitas, despesas, economia)

### 2. Receitas e Despesas

- Cadastro de transações (receita ou despesa)
- Campos: descrição, valor, data, categoria, conta associada
- Edição e exclusão de transações
- Listagem com filtros por período, categoria e tipo
- Busca por descrição

### 3. Categorias Personalizadas

- Criação de categorias customizadas pelo usuário
- Edição e exclusão de categorias
- Ícones e cores para identificação visual
- Categorias padrão pré-definidas (Alimentação, Transporte, Moradia, Lazer, etc.)

### 4. Contas Bancárias e Cartões

- Cadastro de contas bancárias (nome, saldo inicial, banco)
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

---

### 7. Exportação de Dados

- **Exportar para PDF**: relatório mensal/anual com gráficos e tabelas
- **Exportar para CSV**: dados brutos para uso em planilhas
- Seleção de período para exportação
- Compartilhamento via apps do dispositivo (e-mail, messaging, etc.)

### 8. Armazenamento Local (JSON Interno)

- Todos os dados persistidos em arquivo JSON interno do dispositivo
- Estrutura de dados organizada por módulo:
  - `transacoes.json` — lista de receitas e despesas
  - `categorias.json` — categorias personalizadas
  - `contas.json` — contas bancárias
  - `cartoes.json` — cartões de crédito
  - `metas.json` — metas de economia
- Backup e restauração de dados (importação/exportação do JSON)
- Sincronização entre dispositivos (futuro)

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React Native |
| Navegação | React Navigation |
| Gráficos | react-native-chart-kit ou Victory Native |
| Armazenamento Local | AsyncStorage / react-native-fs |
| Geração de PDF | react-native-pdf ou expo-print |
| Geração de CSV | papaparse / library própria |

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
  ]
}
```

---

## Telas Principais

| Tela | Descrição |
|---|---|
| Home / Dashboard | Resumo financeiro e indicadores |
| Transações | Lista, cadastro, edição e exclusão |
| Categorias | Gestão de categorias |
| Contas | Gestão de contas bancárias |
| Cartões | Gestão de cartões de crédito |
| Gráficos | Visualização gráfica dos dados |
| Metas | Acompanhamento de metas de economia |
| Exportar | Opções de exportação PDF/CSV |
| Configurações | Preferências e backup |

---

## Requisitos Não Funcionais

- **Performance**: carregamento rápido das telas (< 2s)
- **Usabilidade**: interface intuitiva e responsiva
- **Segurança**: dados armazenados localmente (sem servidor externo)
- **Acessibilidade**: suporte a leitores de tela e fontes escaláveis
- **Compatibilidade**: Android e iOS
