import type { Categoria, Config, Meta } from "@/types";
import { gerarId } from "@/lib/uuid";
import categoriasDefault from "./categorias-default.json";
import configDefault from "./config-default.json";

export function obterCategoriasDefault(): Categoria[] {
  return categoriasDefault as Categoria[];
}

export function obterConfigDefault(): Config {
  return configDefault as Config;
}

export function obterMetasDefault(): Meta[] {
  const hoje = new Date();
  const dataInicio = hoje.toISOString().split("T")[0];
  const dataFim = new Date(hoje.getFullYear() + 10, hoje.getMonth(), hoje.getDate())
    .toISOString()
    .split("T")[0];

  const metas: Meta[] = [
    {
      id: gerarId(),
      nome: "Viver de Renda",
      tipo: "padrao",
      ativo: true,
      valorAlvo: 0,
      valorAtual: 0,
      meses: 120,
      parcelaMensal: 0,
      dataInicio,
      dataFim,
      status: "em_andamento",
      receitasBase: [],
    },
    {
      id: gerarId(),
      nome: "Reserva de Emergência",
      tipo: "padrao",
      ativo: true,
      valorAlvo: 0,
      valorAtual: 0,
      meses: 6,
      parcelaMensal: 0,
      dataInicio,
      dataFim: new Date(hoje.getFullYear(), hoje.getMonth() + 6, hoje.getDate())
        .toISOString()
        .split("T")[0],
      status: "em_andamento",
      receitasBase: [],
    },
    {
      id: gerarId(),
      nome: "Guardar por Mês",
      tipo: "padrao",
      ativo: true,
      valorAlvo: 0,
      valorAtual: 0,
      meses: 1,
      parcelaMensal: 0,
      dataInicio,
      dataFim,
      status: "em_andamento",
      receitasBase: [],
    },
    {
      id: gerarId(),
      nome: "Conta Fixa",
      tipo: "padrao",
      ativo: true,
      valorAlvo: 0,
      valorAtual: 0,
      meses: 1,
      parcelaMensal: 0,
      dataInicio,
      dataFim,
      status: "em_andamento",
      receitasBase: [],
    },
    {
      id: gerarId(),
      nome: "Lazer",
      tipo: "padrao",
      ativo: true,
      valorAlvo: 0,
      valorAtual: 0,
      meses: 1,
      parcelaMensal: 0,
      dataInicio,
      dataFim,
      status: "em_andamento",
      receitasBase: [],
    },
  ];

  return metas;
}
