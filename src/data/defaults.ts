import type { Categoria, Config } from "@/types";
import categoriasDefault from "./categorias-default.json";
import configDefault from "./config-default.json";

export function obterCategoriasDefault(): Categoria[] {
  return categoriasDefault as Categoria[];
}

export function obterConfigDefault(): Config {
  return configDefault as Config;
}
