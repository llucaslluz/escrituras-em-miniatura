# Experiência imersiva — versão 1.1.0

Atualização de design a partir da imagem de referência fornecida pelo usuário. As 72 cenas, seus modelos, animações e referências permanecem no catálogo. A identidade de hospedagem e a audiência do site atual foram preservadas; o antigo Gólgota em Miniatura não foi alterado.

## O que mudou

- `/#inicio` entra diretamente na última história visitada, ou no Batismo de Jesus quando ainda não há histórico. A cena ocupa toda a viewport, sem cabeçalho/rodapé tomando seu espaço.
- Menu central flutuante: Bíblia, Livro de Mórmon, D&C e Pérola. Seleção de todas as histórias da obra atual, com setas anterior/próxima. Os links `/#historia/ID` continuam estáveis.
- Títulos editoriais à esquerda, informações breves e acesso às fontes, com tipografia e disposição inspiradas na referência.
- Painel lateral recolhível com vistas, aproximação, identificação de pessoas, animação, progresso, velocidade e momentos. No celular, ele abre pela parte inferior.
- Luz de exploração: **Da história, Manhã, Entardecer e Noite**. Os três horários ajustam direção/cor/intensidade da luz, preenchimento, exposição e atmosfera. A escolha persiste ao trocar de história e não é anulada pelos callbacks narrativos.
- “Da história” restaura o estado de iluminação autoral no instante corrente, inclusive a transição de escuro para claro da Criação. Os horários manuais são opções artísticas de exploração, sem redefinir época, cronologia ou contexto do relato.
- “Sobre a cena” abre uma janela com narrativa, personagens, objetos, etapas do Plano de Salvação, relações e fontes. A seleção no modelo também abre essa janela.
- O botão “+” abre a biblioteca, linha do tempo, galeria, favoritos, fontes e preferências. A apresentação editorial anterior está preservada em `/#apresentacao`.
- Câmera e contraste adaptam-se à viewport e ao horário escolhido. Textura discreta de fundo gerada por filtro SVG local, sem novo recurso externo.

## Verificações executadas

- **86 testes automatizados aprovados, zero falhas**: 79 da base mais 7 para iluminação/controle do visualizador. Saída em `docs/redesign-tests.tap`.
- Novos testes avaliam as 72 cenas nos três presets em vários instantes, a restauração exata da luz autoral, pausa/busca/repetição, canvas transparente, limites de aproximação e a transição escuro/claro da Criação.
- Construção Vite concluída e inventário verificado: 72 histórias, contagens 32/20/10/10 e nenhum recurso obrigatório ausente.
- Navegador Chromium integrado, servidor HTTP local, viewport 1440×1000: menu central exibiu exatamente 32, 20, 10 e 10 opções, conforme a obra.
- Manhã, entardecer e noite foram trocados com a cena pausada. O tempo permaneceu igual, a luz/atmosfera mudou e a escolha permaneceu ao navegar entre as quatro obras.
- Viewports móveis 390×844 e 320×740: cena com as dimensões da viewport, sem rolagem horizontal. O painel desktop recolheu ao cruzar o breakpoint e abriu como gaveta inferior com rolagem interna.
- Escape recolheu as configurações. A janela “Sobre a cena” abriu, e a seleção acessível de Deus, o Pai em P09 mostrou papel, resumo e referência.
- O menu do projeto abriu a biblioteca com 72 resultados; a página normal recuperou sua rolagem. Os controles de narrativa anteriores foram preservados no painel/toolbar.
- As cenas/modelos não foram refeitos nesta atualização; os limites de revisão artística e de dispositivos físicos da versão inicial continuam aplicáveis.

## Arquivos principais

`src/ui/immersive.js`, `src/immersive.css`, `src/main.js`, `src/engine/viewer.js`, `src/engine/atmosphere.js`, `src/storage.js`, `tests/atmosphere.test.mjs`.

## Limites

Validação móvel feita por viewport no computador; sem ensaio em celular físico, Safari/iOS ou Firefox. Não foi medido um novo benchmark de desempenho desta interface, portanto a amostra de FPS da versão 1.0 é apenas histórica. O fallback sem WebGL continua revisado por código, sem teste em hardware sem WebGL.
