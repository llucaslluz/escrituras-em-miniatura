# Direção de arte e animação — pilotos B11 e B05

Solicitação do usuário em 2 de novembro de 2026: elevar a qualidade visual das
cenas ao acabamento das duas imagens fornecidas, com riqueza de detalhes e
movimento mais convincente, mantendo a interação já existente e o foco no celular.
Este documento é um plano; não registra implementação ou aprovação visual.

## Referências preservadas

| Cena | Imagem fornecida pelo usuário | Direção principal |
| --- | --- | --- |
| B11 — Daniel na cova dos leões | [Referência de Daniel](referencias/daniel-cova.jpeg) | Cova de pedras irregulares, vegetação discreta, leões arredondados, Daniel em oração e anjo, com luz quente suave entrando por cima e fundo noturno. |
| B05 — A travessia do Mar Vermelho | [Referência do Mar Vermelho](referencias/mar-vermelho.jpeg) | Paredes de água turquesa com volume e espuma, peixes visíveis, areia com pequenos detalhes, Moisés e famílias de personagens de massinha, com luz clara e acolhedora. |

As cópias preservam os bytes dos JPEGs originais, sem edição. Arquivos originais:
`D:\Downloads\Gemini_Generated_Image (1).jpeg` (Daniel) e
`D:\Downloads\Gemini_Generated_Image.jpeg` (Mar Vermelho).

O acabamento das imagens é a referência estética. O resultado do produto deve
ser uma cena 3D navegável: verificar também laterais, aproximação, mudança de
câmera e movimento. A fidelidade e o custo precisam ser avaliados no visualizador
real; uma imagem de referência não define o comportamento da animação.

## Critérios visuais

- Formas arredondadas e expressivas, proporções de miniatura e materiais com
  aparência tátil de massinha; evitar peças que pareçam apenas sólidos básicos empilhados.
- Rosto, cabelo, barba, roupas e animais reconhecíveis em tela pequena, com
  variação de formas, cores e poses; detalhes devem ajudar a leitura da cena.
- Contato visual com o chão: pés, patas, joelhos e objetos apoiados, com sombras
  suaves e sem aparência involuntária de flutuação.
- Composição clara, profundidade, luz principal e preenchimento equilibrados.
  Efeitos não podem esconder rosto, narrativa, seleção ou texto da interface.
- Pedras, areia, vegetação, espuma e objetos secundários com distribuição variada
  e coerente. Densidade de objetos sozinha não é critério de qualidade.
- Preservar a história e suas referências. Asas, auréola e feixe de luz do anjo
  continuam sendo interpretação artística, conforme o conteúdo já documentado.

## Qualidade da animação

1. Observar e registrar primeiro os defeitos em reprodução: identificar cena,
   instante, personagem, movimento esperado e o que parece estranho.
2. Caminhada com passada compatível com deslocamento, apoio dos pés e balanço
   contido; evitar deslizamento, pulos involuntários e personagens atravessando
   chão, água, pedras ou outros personagens.
3. Respiração, olhar, roupa, cauda e pequenos gestos com amplitudes discretas e
   fases variadas. Evitar todos os personagens oscilando como um só bloco.
4. Transições com aceleração/desaceleração coerentes, sem aparições ou mudanças
   bruscas sem intenção narrativa; conferir pausas e momentos de repouso.
5. Água com movimento contínuo e coerente com suas formas; espuma e peixes
   acompanham o volume de água e não atravessam o caminho das famílias.
6. Animação continua derivada do tempo compartilhado: pausar congela narrativa
   e ambiente; avançar/retroceder recompõe o mesmo estado; repetição mantém a
   sequência coerente e sem salto evitável. Se houver reinício narrativo visível,
   tratá-lo deliberadamente e verificar a transição.

## Escopo técnico confirmado por leitura do código

- B11: construtor em `src/scenes/bible.js`, chave `B11`; já possui cova,
  vegetação, Daniel ajoelhado, leões, anjo, halo, luz e partículas. Há alternâncias
  de visibilidade condicionadas a `t>14` e `t>24`; verificar em reprodução antes
  de decidir como suavizar a entrada dos elementos. Preservar o trabalho atual.
- B05: `buildRedSea` em `src/scenes/bible/red-sea.js`; água especializada em
  `src/scenes/bible/red-sea-water.js`. Já existem dez familiares, trajetórias
  pré-calculadas, afastamento entre personagens, espuma e peixes. Refinar as
  formas e o movimento sem substituir a lógica determinística por acúmulo por quadro.
- Pessoas, animais, materiais e iluminação têm componentes compartilhados em
  `src/engine/`. Preferir opções locais ou explícitas nos pilotos. Uma mudança
  global exige identificar e validar as outras cenas que ela afeta.

## Sequência e responsáveis

| Etapa | Responsáveis | Entrega |
| --- | --- | --- |
| A — linha de base dos pilotos | Orquestrador + UX/QA | Capturas e sequência curta em movimento, câmera/instante/qualidade registrados; lista dos defeitos reais e arquivos atribuídos. |
| B — B11, primeiro piloto | Frontend/3D como editor; UX orienta arte | Refinar formas, contatos e luz; depois movimentos e transições. Resultado navegável e comparação com a referência. |
| C — revisão de B11 | QA + desempenho + acessibilidade | Interações, movimento reduzido, câmera/seleção, regressões e custo gráfico comparados; imagens e movimento exibidos ao usuário. |
| D — B05, segundo piloto | Frontend/3D como editor; UX orienta arte | Refinar água, espuma, detalhes e famílias; depois caminhada, contatos e chegada; manter quatro momentos narrativos. |
| E — revisão e expansão | Orquestrador + equipe | Consolidar critérios validados; propor lotes para as demais histórias, sem aplicar alteração global apenas para aumentar detalhe. |

O chat principal coordena; no máximo três especialistas simultâneos e um editor
por arquivo. Não é preciso criar outro sistema de agentes para executar esta etapa.
Começar com o código e os recursos atuais. Se uma limitação exigir modelos,
texturas, ferramentas ou dependências adicionais, descrevê-la com uma proposta
concreta e seus efeitos em qualidade, tamanho, licença e uso no celular.

## Interações e melhorias a preservar

Giro/toque/teclado, zoom, vistas, restauração, seleção no canvas e lista HTML,
personagens, referências, quatro momentos, busca temporal, pausa/reprodução,
velocidade, loop e atmosferas. Preservar movimento reduzido, fallback textual,
preferências, descarte de recursos e importação por obra.

Preservar os lotes de menus/acessibilidade/controles persistentes e leitura
expandida. A cena precisa continuar utilizável na área disponível do celular.
Não alterar conteúdo doutrinário, IDs, catálogo ou outras cenas incidentalmente.

## Aceite de cada piloto

- Exibir antes/depois nos mesmos enquadramentos e instantes e mostrar reprodução
  em vídeo curto ou sequência temporal verificável. Captura isolada não comprova
  qualidade da animação. Incluir vista geral, aproximação e outro ângulo.
- Conferir 320×568, 360×800, 390×844, 412×915 e 844×390, mais desktop. Enquadramento
  mantém personagens importantes legíveis e controles alcançáveis; leitura expandida
  e câmera livre continuam funcionando.
- Exercitar seleção, pausa, busca direta e retorno ao mesmo tempo, loop, velocidade,
  luzes, movimento reduzido e troca de cena. Verificar contatos em vários instantes,
  sobretudo marcha, transição e fim da narrativa.
- Comparar baixa e média sob as mesmas condições, com composição e ação preservadas
  na baixa. Ajustar efeitos secundários segundo o custo medido; não remover o que
  torna a cena reconhecível para simplesmente reduzir contagens.
- Comparar tempos de quadro/custo de renderização com o estado anterior quando a
  ferramenta permitir, além de draw calls, triângulos e recursos ativos. Não chamar
  intervalo RAF de FPS da GPU nem declarar ausência de vazamento só por contadores.
- Rodar os testes pertinentes e a suíte existente, acrescentando regressões úteis
  para os defeitos corrigidos. Build em pasta temporária, preservando `dist/` e
  `entrega/`. Não atualizar miniaturas oficiais ou publicar automaticamente.
- Registrar limitações de aparelho/navegador. Zoom nativo, segundo plano real,
  leitor de tela e Android/iPhone físicos continuam pendentes até serem executados;
  a emulação e as medições do computador não comprovam esses ambientes.

## Entrega e próximo passo

O próximo trabalho é implementar e mostrar **B11 como piloto**, preservando sua
versão atual como comparação e o trabalho local. Em seguida, executar B05 com o
mesmo padrão de validação. Esta atualização do plano não implementa as cenas,
não publica o site e não considera as 72 histórias visualmente revisadas.
