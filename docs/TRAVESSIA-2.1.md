# Travessia do Mar Vermelho — 2.1.0

Esta atualização refina a cena **B05 — A travessia do Mar Vermelho**, com base em **Êxodo 14**, mantendo a direção de arte de massinha e a renderização interativa em Three.js.

## Composição

O caminho de areia passa entre duas paredes de água turquesa, modeladas como volumes de plasticina com cristas curvas. Espuma em tons de creme, gotas e pequenos peixes acrescentam detalhes às ondas. Pedrinhas, conchas e as margens de areia tornam o fundo seco legível.

Moisés conduz o grupo com um cajado curvo. A miniatura inclui dez israelitas, entre adultos e crianças, com cores e escalas variadas. O grupo representa as famílias do povo; sua quantidade e disposição são escolhas de composição. Ondas, espuma, peixes e detalhes da areia também são interpretações artísticas. O texto de Êxodo descreve o caminho por terra seca, com as águas como parede à direita e à esquerda.

Os arquivos da cena se concentram em `src/scenes/bible/red-sea.js` e no módulo de água `red-sea-water.js`, chamados pelo construtor B05 de `src/scenes/bible.js`. O refinamento não altera os modelos globais das demais histórias, os textos doutrinários, os controles ou o catálogo.

## Quatro momentos

| Instante | Momento | Leitura visual |
| --- | --- | --- |
| 0 s | Diante do mar | O mar ainda ocupa a passagem; Moisés e o povo aguardam. |
| 8 s | Abertura | As águas se levantam dos dois lados e revelam o caminho de areia. |
| 16 s | Travessia | Moisés e as famílias avançam pelo caminho aberto. |
| 24 s | Chegada | O grupo se aproxima da outra margem e se reúne durante o trecho final. |

A narrativa permanece com 32 segundos. A animação é calculada a partir do relógio da cena: pausar congela os elementos, buscar um momento recupera o estado correspondente e o loop recomeça a sequência. A preferência de repetição continua disponível em **Seu olhar → Repetir em loop**. As vistas permitem observar o caminho, Moisés e as famílias ou as ondas.

## Validação

Este documento registra o escopo visual e narrativo da atualização. A validação deve conferir os quatro momentos, os limites do caminho, a relação entre personagens e água, a reversibilidade ao buscar o tempo e o descarte de recursos. Medições de GPU e contagens finais de testes dependem da verificação da implementação concluída; não são presumidas aqui.
