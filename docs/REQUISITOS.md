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

- [ ] RF-03.1: O sistema deve permitir criar, editar e excluir contas.
- [ ] RF-03.2: Contas devem ter tipos: corrente, poupança, investimento, ticket.
- [ ] RF-03.3: Contas devem exibir saldo hoje (confirmado) e saldo do mês (projetado).

### RF-04: Dashboard

- [ ] RF-04.1: Dashboard deve exibir saldo total do mês selecionado.
- [ ] RF-04.2: Dashboard deve permitir navegação entre meses.
- [ ] RF-04.3: Dashboard deve exibir próximas transações confirmadas.

### RF-05: Tema

- [ ] RF-05.1: Tema (claro/escuro) deve ser persistido no localStorage.
- [ ] RF-05.2: Tema deve ser aplicado imediatamente na inicialização (sem flash).
- [x] RF-05.3: Tema não deve ser resetado ao recarregar a página.

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
