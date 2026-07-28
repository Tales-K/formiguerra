import { setConstantes } from "./core/dados.js";
import { criarEstado } from "./core/estado.js";
import { salvarPartida, carregarPartida, gerarId } from "./armazenamento.js";
import { criarControlador } from "./ui/controlador.js";
import { iniciarHud } from "./ui/hud.js";
import { iniciarInput } from "./ui/input.js";
import { montarDificuldades, montarSaves } from "./ui/menu.js";

const $ = (id) => document.getElementById(id);

function mostrar(id) { $(id).classList.remove("oculto"); }
function esconder(id) { $(id).classList.add("oculto"); }

async function boot() {
  const resp = await fetch("../especificacao/constantes.json");
  setConstantes(await resp.json());

  const canvas = $("canvas-hex");
  const ctx = canvas.getContext("2d");
  const mapArea = $("area-mapa");

  let hud = () => {};
  const ctrl = criarControlador({ ctx, canvas, atualizarHud: (info) => hud(info), mostrarFim });
  hud = iniciarHud(ctrl);

  iniciarInput(ctrl, canvas, mapArea, abrirPausa);

  function irParaJogo() {
    esconder("tela-menu");
    esconder("tela-pausa");
    esconder("tela-fim");
    mostrar("tela-jogo");
  }

  function irParaMenu() {
    esconder("tela-jogo");
    esconder("tela-pausa");
    esconder("tela-fim");
    esconder("painel-dificuldade");
    esconder("painel-saves");
    mostrar("tela-menu");
  }

  function novaPartida(dif) {
    const seed = Math.floor(Math.random() * 0x7fffffff);
    const estado = criarEstado(seed, dif);
    const id = gerarId();
    salvarPartida(estado, { id, auto: true });
    ctrl.iniciar(estado, id);
    irParaJogo();
  }

  function carregarJogo(id) {
    const estado = carregarPartida(id);
    if (!estado || estado.incompativel) {
      alert("Save incompatível com esta versão.");
      return;
    }
    ctrl.iniciar(estado, id);
    irParaJogo();
  }

  function mostrarFim(vencedor) {
    const texto = vencedor === "vermelho" ? "Vitória!" : vencedor === "azul" ? "Derrota" : "Empate";
    $("lbl-resultado").textContent = texto;
    mostrar("tela-fim");
  }

  function abrirPausa() {
    mostrar("tela-pausa");
  }

  $("btn-novo").addEventListener("click", () => {
    esconder("painel-saves");
    montarDificuldades($("painel-dificuldade"), novaPartida);
  });
  $("btn-carregar").addEventListener("click", () => {
    esconder("painel-dificuldade");
    montarSaves($("painel-saves"), carregarJogo);
  });

  $("btn-passar").addEventListener("click", () => ctrl.passarTurno());
  $("btn-menu").addEventListener("click", abrirPausa);
  $("btn-continuar").addEventListener("click", () => esconder("tela-pausa"));
  $("btn-salvar").addEventListener("click", () => {
    const nome = prompt("Nome do save:", "Minha partida");
    if (nome) {
      salvarPartida(ctrl.estado, { id: gerarId(), nome });
      esconder("tela-pausa");
    }
  });
  $("btn-salvar-sair").addEventListener("click", () => {
    const nome = prompt("Nome do save:", "Minha partida");
    if (nome) salvarPartida(ctrl.estado, { id: gerarId(), nome });
    irParaMenu();
  });
  $("btn-sair").addEventListener("click", irParaMenu);
  $("btn-voltar-menu").addEventListener("click", irParaMenu);
}

boot();
