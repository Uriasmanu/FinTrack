# Mercado: Quantidade, Peso/Volume e Preço por Medida

Data: 2026-10-02
Estende: `2026-09-19-mercado-marca-unidade-catalogo-design.md`

## Problema

Análise de `data/fintrack.json` (1 compra, 34 itens, 32 entradas no catálogo):

- Todos os itens têm `unidade: "un"`; hoje a unidade é só um rótulo ao lado da quantidade.
- Hortifruti (alho, tomate, cenoura…) está com quantidade 1 e valor entre 4 e 11: é o total da pesagem, mas o peso não foi registrado.
- O tamanho da embalagem está no nome ("500g Cafe…", "1kg açucar", "500ml Amaciante…"), sem uso nos cálculos.
- Não existe preço por kg/L, então não dá para comparar a mesma coisa comprada em pesos diferentes.
- "taxa ifood" está como item de mercado e entra na média de preços.

## Bug do painel: mês calculado com fuso errado

`estaNoMes` (`calculos-mercado.ts`) faz `new Date("2026-10-01")`. Esse formato é lido como meia-noite UTC, e no fuso de Brasília (UTC-3) vira 30/09 às 21h, então `getMonth()` devolve setembro. Toda compra lançada no **dia 1º** conta no mês anterior.

Efeito nos dados atuais (2 compras: 07/09 = R$ 443,16 e 01/10 = R$ 343,61), com hoje em outubro:

- Total Mês Atual R$ 0,00 (esperado R$ 343,61), Total Mês Anterior R$ 786,77 (esperado R$ 443,16).
- Variação −100% (esperado −22,5%) e Compras no Mês 0 (esperado 1).
- Comparativo mostra "Registre uma compra neste mês", pois nenhum item cai em outubro.

Correção: ler ano e mês direto da string `YYYY-MM-DD` (`split("-")`), sem passar por `Date`. Vale para `estaNoMes` e para qualquer outro ponto do módulo que faça `new Date(compra.data)`. A data padrão do formulário (`new Date().toISOString()`, em UTC) vira "amanhã" depois das 21h em Brasília; passa a usar `dataLocalISO()`.

## Nomes diferentes entre meses quebram o comparativo

O comparativo agrupa por nome normalizado, e a compra de outubro já separa a marca do nome: "creme de leite mococa" (set) vs "creme de leite" + marca Mococa (out); "detergente Ype" vs "detergente" + Ypê; "oleo Soya" vs "Oleo" + Soya; "Farinha Farina" vs "Farinha" + Farina; "tapioca Akio" vs "Tapioca" + Terrinha. Mesmo com o bug de data corrigido, quase todos os itens apareceriam como "novo", e o catálogo (60 entradas) duplica o mesmo produto.

Decisão: o comparativo agrupa só por nome (sem marca), como já definido; o catálogo ganha uma ação de **mesclar entradas** (ex.: "creme de leite mococa" → "creme de leite", com a marca Mococa) em `MercadoCatalogo`. Ao mesclar, as compras antigas com o nome antigo passam a usar o nome novo, e a marca extraída vai para o campo `marca` do item. A mesclagem é feita pela edição do item no catálogo (nome novo + marca opcional das compras antigas). Itens que só mudaram de produto ("sazon" vs "tempero em pó") ficam sob responsabilidade do usuário.

## Regra central

A unidade define como a linha é calculada:

| Unidade | Campo de valor | Quantidade | Subtotal |
|---|---|---|---|
| `un` | Preço Unit. (R$) | nº de itens | `preço × quantidade` |
| `kg`, `g`, `L`, `ml` | Valor pago (R$) | peso/volume, **só anotação** | `valor pago` (sem multiplicar) |

Exemplos: 4 creme de leite a 1,79 → `un`, subtotal 7,16. Tomate 1,234 kg por 8,17 → `kg`, subtotal 8,17.

## Modelo de dados

Sem campos novos em `ItemMercado`: `unidade` (já existe) passa a mandar no cálculo; `precoUnitario` continua sendo o nome do campo, mas para peso/volume guarda o valor total pago.

```ts
type UnidadeMedida = "un" | "g" | "kg" | "ml" | "L"; // inalterado
type Dimensao = "contagem" | "massa" | "volume";
```

- Dimensão: `un` → contagem; `g`/`kg` → massa; `ml`/`L` → volume.
- Unidade base por dimensão: `un`, `kg`, `L`. Fator: `g`→0,001, `kg`→1, `ml`→0,001, `L`→1.
- Quantidade na base = `quantidade × fator`.
- **Preço por unidade base** = `subtotal / quantidade na base`.
  Ex.: tomate 8,17 por 1,234 kg → R$ 6,62/kg. Creme de leite 1,79 × 4 → R$ 1,79/un.

## Lógica de cálculo (`calculos-mercado.ts`)

- `calcularSubtotalItem`: se `unidade === "un"` → `precoUnitario × quantidade`, senão `precoUnitario`. Total da compra, total do mês e dashboard passam a usar essa função (já usam).
- Novas funções puras: `dimensaoDaUnidade(u)`, `fatorParaBase(u)`, `calcularPrecoPorUnidadeBase(item)`.
- Comparativo mensal (`calcularComparacaoItens`): agrupa por **nome normalizado + dimensão** (não por marca). Preço médio do mês = soma dos subtotais ÷ soma das quantidades na base (média ponderada, igual à atual para `un`).
- Mesmo nome em dimensões diferentes → linhas separadas; sem conversão entre dimensões. O mês anterior só é comparado na mesma dimensão.
- `ComparacaoItem` ganha `unidadeBase` para exibir "R$ 6,62/kg".

## Catálogo

- `CatalogoItemMercado` mantém `ultimaUnidade` e `ultimoPreco`; `ultimoPreco` passa a significar o **preço por unidade base** do último registro (para `un`, o preço unitário).
- Pré-preenchimento ao reconhecer o nome: sempre a unidade; o preço só quando `un`. Para peso/volume, mostra a dica "último: R$ 6,62/kg" e deixa o valor pago vazio (ele depende da pesagem).
- Regras existentes não mudam (catálogo só cresce, `marcas` deduplicadas, chave por nome normalizado).

## Formulário (`compra-form.tsx`)

1. Linha do item: **Unidade** (Select), **Quantidade** e **valor** (Preço Unit. ou Valor pago).
2. Ao escolher `kg`/`g`/`L`/`ml`: o rótulo do campo de valor vira "Valor pago (R$)", o da quantidade vira "Peso (kg)" / "Volume (L)" conforme a unidade, e o subtotal mostrado é o valor pago (sem multiplicar).
3. Texto auxiliar abaixo da linha com o preço normalizado quando há valor e quantidade e a unidade é de peso/volume (para `un` seria igual ao preço unitário): "≈ R$ 6,62/kg".
4. A ordem Unidade → Quantidade → Valor segue como está no formulário atual; step da quantidade: 1 para `un`, 0,001 para peso/volume.
5. **O botão "Adicionar Item" fica abaixo da última linha de item**, antes do bloco "Total da Compra", com largura total. O cabeçalho da seção fica só com o rótulo "Itens".
6. Layout de 3 colunas precisa caber em 375 px.

## Exibição

- `compra-card.tsx`: `un` → "4 un × R$ 1,79"; peso/volume → "Tomate — 1,234 kg · R$ 8,17" (sem "×").
- `itens-comparacao.tsx`: preço médio com sufixo da unidade base (R$/kg, R$/L, R$/un).
- `catalogo-lista.tsx`: sem mudança de estrutura.

## Compatibilidade

- Itens antigos têm `unidade: "un"` e continuam calculando igual (nada muda no total das compras existentes).
- Não há migração automática dos itens atuais: tomate, alho, cenoura etc. seguem como `un` até o usuário editar a compra e trocar a unidade para `kg`.
- Nomes não são alterados.

## Fora de escopo

- Converter entre dimensões (g ↔ ml, un ↔ kg).
- Extrair tamanho ou marca do nome automaticamente (a mesclagem no catálogo é manual).
- Marcar itens que não são produto (ex.: "taxa ifood") para excluí-los da média.
- Agrupar o comparativo por marca.

## Verificação (sem framework de testes no projeto)

1. Item `un`: 4 × 1,79 → subtotal 7,16 (igual a hoje).
2. Item `kg`: 1,6 kg, valor pago 17,49 → subtotal 17,49, "≈ R$ 10,93/kg"; o total da compra soma 17,49, não 27,98.
3. Tomate 1 kg por 8,00 + tomate 0,5 kg por 5,00 no mesmo mês → média = 13,00 ÷ 1,5 = R$ 8,67/kg.
4. Tomate em `g` (500 g por 4,00) e em `kg` (1 kg por 7,00) no mesmo mês → agrupados, base 1,5 kg, média R$ 7,33/kg.
5. Mesmo nome em `kg` e `un` → duas linhas no comparativo.
6. Compras antigas: totais idênticos aos de antes.
7. Trocar a unidade de `un` para `kg` no formulário atualiza rótulos e subtotal na hora.
9. Compra de 01/10 conta em outubro (fuso America/Sao_Paulo): painel mostra Total Mês Atual R$ 343,61, Anterior R$ 443,16, Variação −22,5%, 1 compra.
10. Mesclar "creme de leite mococa" em "creme de leite" faz o comparativo de outubro mostrar o item com preço anterior (R$ 1,79) e variação (+5,6%).
8. "Adicionar Item" abaixo da lista em 375, 768 e 1440 px, sem scroll horizontal.
