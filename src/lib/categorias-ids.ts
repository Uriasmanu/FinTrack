export const CAT_ALIMENTACAO = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
export const CAT_TRANSPORTE = "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e";
export const CAT_MORADIA = "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f";
export const CAT_LAZER = "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80";
export const CAT_SAUDE = "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091";
export const CAT_EDUCACAO = "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8091a2";
export const CAT_SALARIO = "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8091a2b3";
export const CAT_INVESTIMENTOS = "b8c9d0e1-f2a3-4b4c-5d6e-7f8091a2b3c4";
export const CAT_TICKET = "c9d0e1f2-a3b4-4c5d-6e7f-8091a2b3c4d5";
export const CAT_OUTROS = "d0e1f2a3-b4c5-4d6e-7f80-91a2b3c4d5e6";
export const CAT_DIVIDA = "e1f2a3b4-c5d6-4e7f-8091-a2b3c4d5e6f7";
export const CAT_VA_VR = "f2a3b4c5-d6e7-4f80-91a2-b3c4d5e6f708";
export const CAT_TRANSFERENCIA = "a3b4c5d6-e7f8-4091-a2b3-c4d5e6f70819";
export const CAT_GUARDAR = "b4c5d6e7-f809-41a2-b3c4-d5e6f7081920";
export const CAT_COMBUSTIVEL = "c5d6e7f8-091a-42b3-c4d5-e6f708192031";
export const CAT_LIMPEZA = "d6e7f809-1a2b-43c4-d5e6-f70819203142";
export const CAT_COMIDA = "e7f80919-2a3b-44d5-e6f7-081920314253";
export const CAT_BESTEIRA = "f8091a20-3b4c-45e6-f708-192031425364";
export const CAT_ACOUGUE = "091a2031-4c5d-46f7-0819-203142536475";

export const SUBTIPO_IDS: readonly string[] = [
  CAT_LIMPEZA,
  CAT_COMIDA,
  CAT_BESTEIRA,
  CAT_ACOUGUE,
];

export const CATEGORIA_ALIMENTACAO = CAT_ALIMENTACAO;

export const CATEGORIAS_AUTO_TICKET: readonly string[] = [
  CAT_ALIMENTACAO,
  CAT_TICKET,
  CAT_VA_VR,
];

export const CATEGORIA_LAZER = CAT_LAZER;
export const CATEGORIA_EDUCACAO = CAT_EDUCACAO;
export const CATEGORIA_COMBUSTIVEL = CAT_COMBUSTIVEL;
export const CATEGORIA_LIMPEZA = CAT_LIMPEZA;
export const CATEGORIA_COMIDA = CAT_COMIDA;
export const CATEGORIA_BESTEIRA = CAT_BESTEIRA;
export const CATEGORIA_ACOUGUE = CAT_ACOUGUE;

export const CATEGORIA_TRANSFERENCIA = CAT_TRANSFERENCIA;
export const CATEGORIA_GUARDAR = CAT_GUARDAR;

export const MAPA_ID_ANTIGO_NOVO: Record<string, string> = {
  "cat-001": CAT_ALIMENTACAO,
  "cat-002": CAT_TRANSPORTE,
  "cat-003": CAT_MORADIA,
  "cat-004": CAT_LAZER,
  "cat-005": CAT_SAUDE,
  "cat-006": CAT_EDUCACAO,
  "cat-007": CAT_SALARIO,
  "cat-008": CAT_INVESTIMENTOS,
  "cat-009": CAT_TICKET,
  "cat-010": CAT_OUTROS,
  "cat-011": CAT_DIVIDA,
  "cat-012": CAT_VA_VR,
  "cat-013": CAT_TRANSFERENCIA,
  "cat-014": CAT_GUARDAR,
  "cat-015": CAT_COMBUSTIVEL,
  "cat-016": CAT_LIMPEZA,
  "cat-017": CAT_COMIDA,
  "cat-018": CAT_BESTEIRA,
  "cat-019": CAT_ACOUGUE,
};
