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

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));

function obterCaminhoArquivo(ano) {
  return join(DATA_DIR, `fintrack_${ano}.json`);
}

function criarDadosNovo(ano) {
  return {
    ano,
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

// GET /api/data/:ano - Carregar dados do ano
app.get("/api/data/:ano", (req, res) => {
  try {
    const ano = parseInt(req.params.ano, 10);
    if (isNaN(ano)) {
      return res.status(400).json({ erro: "Ano inválido" });
    }

    const caminho = obterCaminhoArquivo(ano);

    if (!existsSync(caminho)) {
      const dadosNovos = criarDadosNovo(ano);
      writeFileSync(caminho, JSON.stringify(dadosNovos, null, 2), "utf-8");
      return res.json(dadosNovos);
    }

    const conteudo = readFileSync(caminho, "utf-8");
    const dados = JSON.parse(conteudo);

    dados.ativosFii = dados.ativosFii ?? [];
    dados.operacoesFii = dados.operacoesFii ?? [];
    dados.dividendosFii = dados.dividendosFii ?? [];

    res.json(dados);
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    res.status(500).json({ erro: "Erro ao carregar dados" });
  }
});

// PUT /api/data/:ano - Salvar dados do ano
app.put("/api/data/:ano", (req, res) => {
  try {
    const ano = parseInt(req.params.ano, 10);
    if (isNaN(ano)) {
      return res.status(400).json({ erro: "Ano inválido" });
    }

    const dados = req.body;
    if (!dados || typeof dados !== "object") {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    dados.ano = ano;
    dados.ativosFii = dados.ativosFii ?? [];
    dados.operacoesFii = dados.operacoesFii ?? [];
    dados.dividendosFii = dados.dividendosFii ?? [];

    const caminho = obterCaminhoArquivo(ano);
    writeFileSync(caminho, JSON.stringify(dados, null, 2), "utf-8");

    res.json({ ok: true });
  } catch (erro) {
    console.error("Erro ao salvar dados:", erro);
    res.status(500).json({ erro: "Erro ao salvar dados" });
  }
});

// DELETE /api/data/:ano - Excluir dados do ano
app.delete("/api/data/:ano", (req, res) => {
  try {
    const ano = parseInt(req.params.ano, 10);
    if (isNaN(ano)) {
      return res.status(400).json({ erro: "Ano inválido" });
    }

    const caminho = obterCaminhoArquivo(ano);
    if (existsSync(caminho)) {
      unlinkSync(caminho);
    }

    res.json({ ok: true });
  } catch (erro) {
    console.error("Erro ao excluir dados:", erro);
    res.status(500).json({ erro: "Erro ao excluir dados" });
  }
});

// GET /api/years - Listar anos disponíveis
app.get("/api/years", (_req, res) => {
  try {
    const arquivos = readdirSync(DATA_DIR)
      .filter((f) => f.startsWith("fintrack_") && f.endsWith(".json"))
      .map((f) => parseInt(f.replace("fintrack_", "").replace(".json", ""), 10))
      .filter((ano) => !isNaN(ano))
      .sort((a, b) => b - a);

    res.json(arquivos);
  } catch (erro) {
    console.error("Erro ao listar anos:", erro);
    res.status(500).json({ erro: "Erro ao listar anos" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor FinTrack rodando em http://localhost:${PORT}`);
  console.log(`Dados salvos em: ${DATA_DIR}`);
});
