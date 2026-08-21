# Feature: Calculadora — Entrada via Teclado

## Status
Implementado

## Data
21/08/2026

## Contexto e Objetivo

- **O que é:** A calculadora no campo de valor deve aceitar entradas do teclado (números e sinais matemáticos)
- **Por que existe:** Usuários de desktop esperam poder digitar valores diretamente ao invés de clicar nos botões da calculadora
- **Quem usa:** Usuários do FinTrack acessando por desktop/notebook
- **Escopo:** Apenas o componente `calculator.tsx` — adicionar listener de teclado

## Problema Resolvido

**Comportamento atual:** A calculadora só aceita cliques nos botões da interface. Usuários com teclado não conseguem digitar números ou operadores.

**Comportamento esperado:** O usuário deve poder digitar números (0-9), operadores (+, -, *, /), parênteses, ponto decimal e Enter/Backspace/Escape diretamente pelo teclado quando a calculadora estiver aberta.

**Escopo:** `src/components/ui/calculator.tsx`

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/ui/calculator.tsx` | Adicionado `useEffect` com listener de teclado para capturar input do teclado |

## Funcionalidades Implementadas

- Números (0-9) digitados no teclado são adicionados à expressão
- Operadores (+, -, *, /) digitados são adicionados à expressão
- Parênteses ( e ) funcionam via teclado
- Ponto decimal (.) funciona via teclado
- Enter aplica o resultado (mesmo comportamento do botão "=")
- Backspace apaga o último caractere (mesmo comportamento do botão "⌫")
- Escape fecha a calculadora sem aplicar
- Nenhum conflito com atalhos do navegador (eventos são tratados corretamente)

## Critérios de Aceite

- [x] CA-01: Dado que a calculadora está aberta, quando o usuário digita um número (0-9), então o número aparece na expressão
- [x] CA-02: Dado que a calculadora está aberta, quando o usuário digita um operador (+, -, *, /), então o operador é adicionado à expressão
- [x] CA-03: Dado que a calculadora está aberta, quando o usuário pressiona Enter, então o resultado é aplicado ao campo de valor
- [x] CA-04: Dado que a calculadora está aberta, quando o usuário pressiona Backspace, então o último caractere é removido
- [x] CA-05: Dado que a calculadora está aberta, quando o usuário pressiona Escape, então a calculadora fecha sem aplicar valor
- [x] CA-06: Dado que a calculadora está aberta, quando o usuário digita um ponto decimal, então ele é adicionado à expressão

## Notas de Implementação

- Usar `useEffect` com listener no `window` para capturar eventos de teclado
- Listener deve ser removido ao desmontar o componente (cleanup function)
- Listener só deve processar teclas quando a calculadora está aberta (`open === true`)
- Usar `event.key` para identificar a tecla pressionada
- Prevenir comportamento padrão em teclas que possam causar efeitos colaterais (ex: Enter em formulário)
