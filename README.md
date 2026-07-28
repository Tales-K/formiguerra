# Formigueiro

Jogo de estratégia por turnos em tabuleiro hexagonal. Duas colônias de formigas
escavam um formigueiro no escuro procurando a rainha inimiga. Roda no browser
como **site estático, sem servidor**.

> Tu não enxerga o mapa. Tu escava ele. E cada túnel que tu abre é ao mesmo
> tempo teu caminho até a rainha inimiga e o caminho dela até ti.

## Estrutura

```
especificacao/
  REGRAS.md            fonte da verdade humana
  constantes.json      TODOS os números, lidos pelo núcleo e pela interface
jogo/                  o site — é isto que vai pro ar
  index.html
  src/
    core/              regras puras (hex, estado, ações, visão, serialização)
    ia/heuristica.js   IA por prioridades
    ui/                menu, tabuleiro, HUD, tooltips, entrada
    armazenamento.js   saves em localStorage
  testes/              testes de unidade e de IA (node --test)
```

O `core/` não importa nada de UI. Toda aleatoriedade passa por um gerador
semeado guardado no estado — mesma seed + mesmas ações = partida idêntica.
A UI e a IA recebem `observar(jogador)`, nunca o estado bruto, então a névoa
de guerra nunca vaza.

## Jogar

O jogo é um site estático. Sirva a **raiz do repositório** com qualquer
servidor de arquivos (o `index.html` está em `jogo/` e lê
`../especificacao/constantes.json`):

```bash
cd jogo
npm run serve
# abra http://localhost:8099/jogo/index.html
```

Ou publique a raiz do repositório em qualquer host estático (GitHub Pages etc.).

### Controles

- **Clique esquerdo** numa formiga sua: seleciona (destaca movimento em azul).
- Botões da unidade no painel armam uma ação (alvos em vermelho); clique num
  alvo para executar.
- **Clique direito / ESC**: cancela / abre o menu de pausa.
- **Scroll**: zoom. **Arrastar botão do meio**: pan.
- **Barra de espaço**: próxima formiga. **Enter**: encerra o turno.

## Testes

```bash
cd jogo
npm test
```

Cobre distância hexagonal, simetria de linha de visão, determinismo,
round-trip de save, invariantes de estado, geração de mapa e competência da IA.

## Estado do projeto

MVP jogável (fases 0–3 do roadmap): núcleo em TypeScript-idiomático JS,
heurística em três dificuldades, interface completa com névoa de guerra, saves
e autosave. As redes treinadas (Difícil/Brutal via PPO), o espelho Python e as
traces douradas de conformidade são as fases seguintes. O balanceamento fino
(as mil partidas) também é posterior — hoje a heurística nunca perde para um
agente aleatório, mas partidas simétricas heurística-vs-heurística ainda tendem
ao empate por limite de turnos, o que é esperado antes do RL.
