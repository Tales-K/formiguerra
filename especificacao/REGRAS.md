# FORMIGUEIRO — Regras (fonte da verdade)

Este documento descreve as regras exatas implementadas no MVP. Todos os
números moram em `constantes.json` e são lidos tanto pelo núcleo do jogo
quanto pela interface. Nada é escrito à mão no código.

## Tabuleiro

- Grade de `largura` × `altura` hexágonos pointy-top.
- Armazenamento em coordenadas de offset `odd-r` (`col`, `row`); a matemática
  de distância e linha de visão converte para coordenadas cúbicas.
- Vizinhança calculada pela tabela `odd-r`.
- Terrenos:

  | Terreno | Passável | Bloqueia visão | Escavável | Valor |
  |---|---|---|---|---|
  | `TERRA` | não | sim | sim | 0 |
  | `ROCHA` | não | sim | não | 1 |
  | `TUNEL` | sim | não | — | 2 |
  | `CAMARA` | sim | não | — | 3 |

- Um hexágono comporta no máximo uma unidade.

## Geração do mapa

- `fracaoRocha` do mapa é rocha, distribuída em manchas por random walk a
  partir de sementes aleatórias.
- Rainha vermelha no canto inferior, azul no canto superior, espelhadas.
- Cada base nasce com uma câmara (centro + vizinhos) já escavada em `CAMARA`.
- **Validação:** flood fill prova que existe caminho escavável entre as duas
  câmaras. Mapa reprovado é descartado e regerado com nova semente.

## Unidades

Atributos em `constantes.json > unidades`. Todas têm 1 movimento + 1 ação por
turno, em ordem livre.

- **Rainha** — não move, não ataca, muita vida. Alvo da partida.
- **Operária** — *escavar*: converte um `TERRA` adjacente em `TUNEL`.
- **Guerreira** — *atacar* corpo a corpo; *defender*: defesa +`defesaBonus`
  até o início do próximo turno.
- **Caçadora** — *disparo* (alcance 3, exige linha de visão); *armadilha*:
  invisível ao inimigo, causa dano ignorando defesa, some ao disparar.
  Máximo de `maxArmadilhas` ativas por colônia.
- **Mago** — *cura* (alcance 2, não reduzida por defesa); *explosão*
  (alcance 3, raio 1, exige linha de visão, **atinge aliados**); *teleporte*
  (alcance 2, só para hexágono escavado, vazio e visível).

Teto de `tetoUnidades` unidades por colônia, sem contar a rainha.

## Combate

```
dano = max(danoMinimo, ataque − defesa)
```

Exceções: armadilha ignora defesa; cura não é reduzida por nada.

## Visão e névoa de guerra

Três níveis por jogador por hexágono: `DESCONHECIDO`, `EXPLORADO`, `VISIVEL`.

- Recalculado no início de cada turno: cada unidade própria ilumina hexágonos
  dentro do seu raio de visão com linha de visão livre.
- `EXPLORADO` é permanente e acumula.
- O hexágono da rainha inimiga nasce `EXPLORADO`.
- Armadilhas inimigas nunca aparecem.
- Linha de visão: interpolação linear em coordenadas cúbicas com epsilon de
  deslocamento para garantir simetria `los(a,b) == los(b,a)`.

## Economia

Recurso único: biomassa.

- `+rendaBase` por turno.
- `+bonusPorGrupo` a cada `hexPorBonus` hexágonos escavados que a colônia possui.
- Teto de acúmulo `tetoBiomassa`. Início `biomassaInicial`.
- Produzir exige biomassa suficiente e um hexágono escavado e vazio adjacente
  à câmara da rainha. Máximo de uma unidade por turno.

## Estrutura do turno

```
INÍCIO
  ├─ coleta biomassa
  ├─ expira postura de defesa
  ├─ reseta ações das unidades do jogador
  └─ recalcula visibilidade
AÇÕES
  ├─ produzir (opcional, 1×)
  └─ para cada unidade: mover e/ou agir
FIM
  ├─ resolve unidades mortas
  ├─ checa vitória
  └─ passa a vez
```

Armadilha dispara quando uma unidade inimiga entra no hexágono.

## Fim de jogo

- **Vitória:** rainha inimiga com vida ≤ 0.
- **Empate:** `limiteTurnos` turnos sem vitória.

## Determinismo

- Toda aleatoriedade passa por um gerador semeado guardado no estado
  (`rngEstado`). Mesma seed + mesmas ações = partida idêntica.
- Serialização canônica: chaves ordenadas, apenas inteiros no estado, tiles
  comprimidos com RLE.
