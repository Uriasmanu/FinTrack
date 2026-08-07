import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = join(__dirname, "data");
const ARQUIVO_UNICO = join(DATA_DIR, "fintrack.json");

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));

function criarDadosNovos() {
  return {
    transacoes: [],
    categorias: [],
    contas: [],
    cartoes: [],
    metas: [],
    ativosFii: [],
    operacoesFii: [],
    dividendosFii: [],
    config: {
      salario: 0,
      tema: "claro",
      moeda: "BRL",
      multiplicadores: {
        viverDeRenda: 200,
        reservaEmergencia: 6,
        guardarPorMes: 0.1,
        contaFixa: 0.6,
        lazer: 0.3,
      },
      criadoEm: new Date().toISOString(),
    },
  };
}

// Migra os arquivos antigos fintrack_YYYY.json para um único fintrack.json
function migrarArquivosAntigos() {
  const arquivos = readdirSync(DATA_DIR).filter((f) => /^fintrack_\d{4}\.json$/.test(f));
  if (arquivos.length === 0) return;

  const dados = criarDadosNovos();
  const categoriasVistas = new Set();
  const contasVistas = new Set();

  for (const arquivo of arquivos.sort()) {
    try {
      const conteudo = readFileSync(join(DATA_DIR, arquivo), "utf-8");
      const anoDados = JSON.parse(conteudo);

      dados.transacoes.push(...(anoDados.transacoes ?? []));

      for (const cat of anoDados.categorias ?? []) {
        if (cat && !categoriasVistas.has(cat.id)) {
          categoriasVistas.add(cat.id);
          dados.categorias.push(cat);
        }
      }

      for (const conta of anoDados.contas ?? []) {
        if (conta && !contasVistas.has(conta.id)) {
          contasVistas.add(conta.id);
          dados.contas.push(conta);
        }
      }

      dados.cartoes.push(...(anoDados.cartoes ?? []));
      dados.metas.push(...(anoDados.metas ?? []));
      dados.ativosFii.push(...(anoDados.ativosFii ?? []));
      dados.operacoesFii.push(...(anoDados.operacoesFii ?? []));
      dados.dividendosFii.push(...(anoDados.dividendosFii ?? []));

      if (anoDados.config) {
        dados.config = {
          ...dados.config,
          ...anoDados.config,
          multiplicadores: {
            ...dados.config.multiplicadores,
            ...(anoDados.config.multiplicadores ?? {}),
          },
        };
      }
    } catch (erro) {
      console.error(`Erro ao migrar ${arquivo}:`, erro);
    }
  }

  writeFileSync(ARQUIVO_UNICO, JSON.stringify(dados, null, 2), "utf-8");

  for (const arquivo of arquivos) {
    try {
      unlinkSync(join(DATA_DIR, arquivo));
    } catch {
      // ignora falha ao remover arquivo antigo
    }
  }

  console.log(`Migração concluída: ${arquivos.length} arquivo(s) por ano mesclado(s) em fintrack.json`);
}

function carregarOuCriar() {
  if (!existsSync(ARQUIVO_UNICO)) {
    migrarArquivosAntigos();
  }

  if (!existsSync(ARQUIVO_UNICO)) {
    writeFileSync(ARQUIVO_UNICO, JSON.stringify(criarDadosNovos(), null, 2), "utf-8");
  }

  const conteudo = readFileSync(ARQUIVO_UNICO, "utf-8");
  const dados = JSON.parse(conteudo);

  dados.transacoes = dados.transacoes ?? [];
  dados.categorias = dados.categorias ?? [];
  dados.contas = dados.contas ?? [];
  dados.cartoes = dados.cartoes ?? [];
  dados.metas = dados.metas ?? [];
  dados.ativosFii = dados.ativosFii ?? [];
  dados.operacoesFii = dados.operacoesFii ?? [];
  dados.dividendosFii = dados.dividendosFii ?? [];
  dados.config = dados.config ?? criarDadosNovos().config;

  return dados;
}

// GET /api/data - Carregar todos os dados (todos os anos e meses)
app.get("/api/data", (_req, res) => {
  try {
    res.json(carregarOuCriar());
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    res.status(500).json({ erro: "Erro ao carregar dados" });
  }
});

// PUT /api/data - Salvar todos os dados
app.put("/api/data", (req, res) => {
  try {
    const dados = req.body;
    if (!dados || typeof dados !== "object") {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    dados.ativosFii = dados.ativosFii ?? [];
    dados.operacoesFii = dados.operacoesFii ?? [];
    dados.dividendosFii = dados.dividendosFii ?? [];

    writeFileSync(ARQUIVO_UNICO, JSON.stringify(dados, null, 2), "utf-8");
    res.json({ ok: true });
  } catch (erro) {
    console.error("Erro ao salvar dados:", erro);
    res.status(500).json({ erro: "Erro ao salvar dados" });
  }
});

// DELETE /api/data - Excluir todos os dados
app.delete("/api/data", (_req, res) => {
  try {
    if (existsSync(ARQUIVO_UNICO)) {
      unlinkSync(ARQUIVO_UNICO);
    }
    res.json({ ok: true });
  } catch (erro) {
    console.error("Erro ao excluir dados:", erro);
    res.status(500).json({ erro: "Erro ao excluir dados" });
  }
});

// GET /api/years - Listar anos disponíveis a partir das transações
app.get("/api/years", (_req, res) => {
  try {
    const dados = carregarOuCriar();
    const anos = [
      ...new Set(
        dados.transacoes
          .map((t) => new Date(t.data).getFullYear())
          .filter((a) => !isNaN(a))
      ),
    ].sort((a, b) => b - a);

    res.json(anos);
  } catch (erro) {
    console.error("Erro ao listar anos:", erro);
    res.status(500).json({ erro: "Erro ao listar anos" });
  }
});

// Servir o build de produção (quando existir)
const DIST_DIR = join(__dirname, "dist");
app.use(express.static(DIST_DIR));

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(join(DIST_DIR, "index.html"), (erro) => {
    if (erro) next();
  });
});

app.listen(PORT, () => {
  console.log(`Servidor FinTrack rodando em http://localhost:${PORT}`);
  console.log(`Banco de dados JSON: ${ARQUIVO_UNICO}`);
});
