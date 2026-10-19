# Direção de arte de massinha — 2.0.0

As 72 cenas passam a compartilhar uma aparência inspirada em claymation e arte de brinquedos: personagens chibi, volumes arredondados, material de plasticina, cores pastel e uma base de miniatura com borda boleada. O resultado é renderizado por Three.js em tempo real, com giro, zoom, seleção e animação. A referência visual orienta o acabamento; não é um vídeo nem uma imagem pré-renderizada.

## Modelagem e materiais

- `clay-style.js` gera a textura de plasticina, com grão amassado e curvas suaves. Também arredonda caixas e rochas e constrói a base.
- `clay-people.js` modela cabeça maior, olhos e expressões, mãos arredondadas, cabelos e roupas. Conserva os pivôs dos rigs para preservar as ações das histórias.
- `clay-animals.js` cria animais de massinha, com corpos arredondados, expressões e movimentos próprios.
- `kit.js` mantém a API das 72 composições. Materiais físicos usam rugosidade, relevo discreto e acabamento suave; pequenos detalhes do terreno usam instâncias para reduzir chamadas de desenho.

Cada história mantém sua composição e seus personagens. Daniel na cova dos leões recebe uma composição de corte da cova, com parede de pedras, vegetação, leões em repouso e iluminação focal. Asas e auréola do anjo são uma convenção artística identificada no contexto da cena.

## Estúdio e lente

`clay-studio.js` usa a luz principal da história, preenchimento hemisférico, recorte frio e softbox frontal quente. A luz frontal ajuda a manter os rostos legíveis sob cabelos e mantos. Sombras filtradas têm bordas suaves. Os horários de exploração continuam disponíveis e não alteram o relato.

A câmera geral reduz a distorção de perspectiva com um afastamento moderado e campo de visão compensado. O enquadramento é adaptado à tela; os controles continuam livres. As vistas de detalhe mantêm os pontos de câmera de cada história.

A composição combina contato entre superfícies próximas, brilho discreto e tilt-shift conforme a profundidade em uma única passagem após o desenho da cena. Somente o canvas recebe a lente: título, doutrina, referências e menus são HTML e permanecem nítidos. O fundo do visualizador imersivo continua transparente.

| Qualidade | Alvo da lente | Maior dimensão física | MSAA máximo | Desfoque máximo no alvo |
| --- | --- | --- | --- | --- |
| Baixa | Renderização direta | Conforme canvas | Antialiasing do canvas | Sem lente |
| Média | HDR + profundidade | 1.800 px | 2 amostras | 1,1 px |
| Alta | HDR + profundidade | 2.560 px | 4 amostras | 1,55 px |

O número de amostras respeita o limite da GPU. Sem suporte a alvo HDR, o motor usa renderização direta com as mesmas cenas e controles. Os recursos da lente, os mapas de sombra e os modelos são liberados ao trocar de história ou destruir o visualizador.

## Conteúdo e interação preservados

Permanecem as 72 histórias, seus quatro momentos, fontes oficiais, ensinamentos doutrinários específicos, identificação de personagens, favoritos, histórico, busca e filtros. Os textos continuam na estrutura lateral. Menus e controles ficam recolhidos em botões e fecham após a escolha, ao clicar fora ou com Esc.

A repetição contínua segue ligada por padrão e pode ser desligada em **Seu olhar → Repetir em loop**. A pausa congela personagens, ambiente e luz narrativa. Movimento reduzido mantém a cena inicialmente pausada.

## Verificação e limites

`tests/clay-studio.test.mjs` cobre resolução e orçamento da lente, fallback sem HDR/qualidade baixa, restauração do destino de renderização, foco, contadores, liberação de recursos e adaptação das luzes. `tests/camera-framing.test.mjs` projeta as bordas superior e inferior da base nas 72 vistas gerais em 800×600 e verifica a margem completa, a preservação do zoom manual e as vistas de detalhe. Os testes de atmosfera e repetição cobrem as 72 cenas e a recuperação determinística do estado.

A revisão final passou em **122 testes automatizados**, incluindo os 72 construtores, materiais, normais suaves, animais, contato das mãos, enquadramento, água, repetição e atmosfera. As 72 cenas foram renderizadas com GPU em 800 × 600 e suas miniaturas foram refeitas a partir desses dioramas; as duas folhas de contato foram inspecionadas visualmente.

No navegador, foram exercitados seleção de um leão pela própria cena, pausa com tempo congelado, loop ligado/desligado, troca de atmosfera, fechamento automático dos painéis e qualidades baixa/alta. A baixa confirmou renderização direta; média/alta confirmaram a lente de miniatura, sem erros de console nos fluxos exercitados. A leitura foi conferida em 390 × 844 e 320 × 568, e não houve rolagem horizontal nessas telas nem em 844 × 390. Em retrato estreito, o texto ocupa uma faixa rolável acima do diorama para evitar sobreposição. Em 1440 × 900, permanece a coluna editorial lateral.

As águas horizontais acompanham a base circular, incluindo a espuma e as ondas. O enquadramento geral das miniaturas mantém a base inteira com margem, preservando o zoom manual e as vistas de detalhe. A aparência e o desempenho final variam conforme resolução, GPU e navegador. Uma viewport móvel no computador não equivale a um teste em telefone físico. Os relatórios das versões anteriores continuam disponíveis com suas condições e resultados históricos.
