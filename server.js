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

const { name: NOME_APLICACAO } = JSON.parse(
  readFileSync(join(__dirname, "package.json"), "utf-8")
);
const ARQUIVO_UNICO = join(DATA_DIR, `${NOME_APLICACAO}.json`);
const PADRAO_ARQUIVOS_ANTIGOS = new RegExp(`^${NOME_APLICACAO}_\\d{4}\\.json$`);

const MAPA_ID_ANTIGO_NOVO = {
  "cat-001": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "cat-002": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
  "cat-003": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
  "cat-004": "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80",
  "cat-005": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091",
  "cat-006": "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8091a2",
  "cat-007": "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8091a2b3",
  "cat-008": "b8c9d0e1-f2a3-4b4c-5d6e-7f8091a2b3c4",
  "cat-009": "c9d0e1f2-a3b4-4c5d-6e7f-8091a2b3c4d5",
  "cat-010": "d0e1f2a3-b4c5-4d6e-7f80-91a2b3c4d5e6",
  "cat-011": "e1f2a3b4-c5d6-4e7f-8091-a2b3c4d5e6f7",
  "cat-012": "f2a3b4c5-d6e7-4f80-91a2-b3c4d5e6f708",
  "cat-013": "a3b4c5d6-e7f8-4091-a2b3-c4d5e6f70819",
  "cat-014": "b4c5d6e7-f809-41a2-b3c4-d5e6f7081920",
  "cat-015": "c5d6e7f8-091a-42b3-c4d5-e6f708192031",
  "cat-016": "d6e7f809-1a2b-43c4-d5e6-f70819203142",
  "cat-017": "e7f80919-2a3b-44d5-e6f7-081920314253",
  "cat-018": "f8091a20-3b4c-45e6-f708-192031425364",
  "cat-019": "091a2031-4c5d-46f7-0819-203142536475",
};

function migrarIdsCategorias(dados) {
  let houveMudanca = false;

  for (const cat of dados.categorias ?? []) {
    if (MAPA_ID_ANTIGO_NOVO[cat.id]) {
      cat.id = MAPA_ID_ANTIGO_NOVO[cat.id];
      houveMudanca = true;
    }
  }

  for (const t of dados.transacoes ?? []) {
    if (MAPA_ID_ANTIGO_NOVO[t.categoriaId]) {
      t.categoriaId = MAPA_ID_ANTIGO_NOVO[t.categoriaId];
      houveMudanca = true;
    }
    if (t.subtipoId && MAPA_ID_ANTIGO_NOVO[t.subtipoId]) {
      t.subtipoId = MAPA_ID_ANTIGO_NOVO[t.subtipoId];
      houveMudanca = true;
    }
  }

  for (const m of dados.metas ?? []) {
    if (m.receitasBase && Array.isArray(m.receitasBase)) {
      const novoReceitasBase = m.receitasBase.map((id) => MAPA_ID_ANTIGO_NOVO[id] ?? id);
      if (novoReceitasBase.some((id, i) => id !== m.receitasBase[i])) {
        m.receitasBase = novoReceitasBase;
        houveMudanca = true;
      }
    }
  }

  return houveMudanca;
}

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
  const arquivos = readdirSync(DATA_DIR).filter((f) => PADRAO_ARQUIVOS_ANTIGOS.test(f));
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
    console.log(`Arquivo padrão criado: ${ARQUIVO_UNICO}`);
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

  if (migrarIdsCategorias(dados)) {
    writeFileSync(ARQUIVO_UNICO, JSON.stringify(dados, null, 2), "utf-8");
    console.log("Migração de IDs de categorias concluída: cat-NNN substituídos por UUIDs");
  }

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

// Primeira ação da aplicação: garantir que o JSON padrão exista fisicamente na pasta data
carregarOuCriar();

app.listen(PORT, () => {
  console.log(`Servidor FinTrack rodando em http://localhost:${PORT}`);
  console.log(`Banco de dados JSON: ${ARQUIVO_UNICO}`);
});
