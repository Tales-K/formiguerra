import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { setConstantes } from "../src/core/dados.js";

const aqui = dirname(fileURLToPath(import.meta.url));
const caminho = join(aqui, "..", "..", "especificacao", "constantes.json");
setConstantes(JSON.parse(readFileSync(caminho, "utf8")));
