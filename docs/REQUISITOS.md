# Requisitos — FinTrack

## Visão Geral

O FinTrack é um aplicativo de controle financeiro pessoal que permite ao usuário gerenciar transações, contas, cartões, metas e visualizar dashboards e gráficos. Os dados são persistidos localmente no localStorage.

---

## Requisitos Funcionais

### RF-01: Inicialização e Persistência de Configuração

- [x] RF-01.1: O sistema deve armazenar um timestamp `criadoEm` no objeto `config` quando o ano é criado pela primeira vez.
- [x] RF-01.2: Na inicialização, o sistema deve verificar `config.criadoEm` para determinar se é um novo usuário.
- [x] RF-01.3: Se `config.criadoEm` existir, o sistema NÃO deve sobrescrever nenhum campo do config.
- [x] RF-01.4: Se `config.criadoEm` não existir (dados legados), o sistema deve preservar campos existentes e preencher apenas os ausentes com defaults.
- [x] RF-01.5: O campo `salario === 0` não deve ser usado como critério de detecção de novo usuário.

### RF-02: Gerenciamento de Transações

- [ ] RF-02.1: O sistema deve permitir criar, editar e excluir transações.
- [ ] RF-02.2: Transações devem ser classificadas como "receita" ou "despesa".
- [ ] RF-02.3: Transações devem suportar recorrência (única, recorrente, parcelada).
- [ ] RF-02.4: Transações recorrentes/parceladas devem permitir edição individual ou em grupo.

### RF-03: Gerenciamento de Contas

- [x] RF-03.1: O sistema deve permitir criar, editar e excluir contas.
- [x] RF-03.2: Contas devem ter tipos: corrente, poupança, investimento, ticket.
- [x] RF-03.3: Contas devem exibir saldo hoje (confirmado) e saldo do mês (projetado).
- [x] RF-03.4: Contas devem ter campo `dataCriacao` opcional para controle de saldo inicial.

### RF-04: Dashboard

- [x] RF-04.1: Dashboard deve exibir saldo total do mês selecionado (incluindo saldoInicial e transações anteriores).
- [x] RF-04.2: Dashboard deve permitir navegação entre meses.
- [x] RF-04.3: Dashboard deve exibir próximas transações confirmadas.
- [x] RF-04.4: Saldo total deve excluir contas ticket (vale-alimentação).

### RF-05: Tema

- [ ] RF-05.1: Tema (claro/escuro) deve ser persistido no localStorage.
- [ ] RF-05.2: Tema deve ser aplicado imediatamente na inicialização (sem flash).
- [x] RF-05.3: Tema não deve ser resetado ao recarregar a página.

### RF-06: Extrato

- [x] RF-06.1: Extrato deve mostrar saldo início e fim do dia.
- [x] RF-06.2: Saldo inicial deve considerar data de criação da conta.
- [x] RF-06.3: Saldo final do extrato deve ser exibido no rodapé.

### RF-07: Transferência entre Contas

- [x] RF-07.1: Sistema deve permitir transferir valores entre contas.
- [x] RF-07.2: Transferências devem usar categoria "Guardar" ou "Transferencia".

### RF-08: Exportação e Importação

- [x] RF-08.1: Sistema deve permitir exportar dados em formato JSON.
- [x] RF-08.2: Sistema deve permitir importar dados de arquivo JSON.
- [x] RF-08.3: Importação deve solicitar confirmação antes de sobrescrever dados.

### RF-09: Interface

- [x] RF-09.1: Dropdowns de contas devem mostrar tipo entre parênteses (ex: "Nubank (Corrente)").
- [x] RF-09.2: Formulário de metas deve trazer valores ao editar.

---

## Requisitos Não-Funcionais

### RNF-01: Performance

- Carregamento inicial deve ocorrer em menos de 2 segundos.
- Operações de CRUD devem ser instantâneas (< 100ms).

### RNF-02: Compatibilidade

- Suporte a navegadores modernos (Chrome, Firefox, Safari, Edge).
- Layout responsivo: mobile (375px+), tablet (768px+), desktop (1280px+).

### RNF-03: Persistência

- Dados devem ser persistidos no localStorage.
- Estrutura de dados deve ser versionável por ano.

---

## Histórico de Alterações

| Data | Requisito | Alteração |
|------|-----------|-----------|
| 03/08/2026 | RF-01 | Criado — Requisitos de inicialização e persistência de configuração |
| 03/08/2026 | RF-05.3 | Implementado — Tema não resetado ao recarregar |
| 03/08/2026 | RF-03.4 | Implementado — Campo dataCriacao em Conta |
| 03/08/2026 | RF-04.1 | Implementado — Saldo total considera saldoInicial e transações anteriores |
| 03/08/2026 | RF-04.4 | Implementado — Saldo total exclui contas ticket |
| 03/08/2026 | RF-06 | Implementado — Extrato com saldo início/fim do dia |
| 03/08/2026 | RF-07 | Implementado — Transferência entre contas com categoria |
| 03/08/2026 | RF-08 | Implementado — Exportação e importação JSON |
| 03/08/2026 | RF-09 | Implementado — Interface com tipo de conta e metas |
