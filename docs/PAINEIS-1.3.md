# Painéis por botão — versão 1.3.0

A cena começa sem painéis abertos em qualquer tamanho de tela. “Histórias” abre a escolha da obra e do episódio; “Seu olhar” abre os ajustes e a narrativa; “Controles” abre pausa, câmera e tela cheia. “Sobre a cena” reúne a apresentação poética, o texto, personagens e fontes. O botão da marca mantém a navegação do projeto.

Apenas um painel de exploração fica aberto por vez. Escolher link, botão, seletor ou confirmar um ajuste fecha o painel. Abrir uma fonte externa fecha o diálogo de estudo, mantendo o link funcionando em outra aba. Conteúdos de leitura, detalhes e personagens continuam abertos enquanto são consultados. Não há temporizador de fechamento. Escape e clique fora também recolhem os painéis; o fechamento por escolha/Escape devolve foco ao botão de abertura, e o clique fora preserva o destino do ponteiro.

O gerenciador e seus eventos são liberados ao mudar de página. O loop contínuo permanece ativado por padrão e respeita a preferência salva. Nenhuma cena, câmera, fonte ou dependência foi alterada nesta atualização.

## Verificações

- `npm test`: 94 testes aprovados, nenhuma falha.
- `npm run verify`: catálogo 72, distribuição 32/20/10/10, nenhum problema.
- `npm run build`: construção concluída; permanece o aviso do pacote principal Three.js acima de 500 kB.
- Navegador: painéis inicialmente fechados; seleção de história, link para a história atual, mudança de horário, nomes, ajuste de zoom e pausa fecharam o painel após a ação. A pausa indicou reprodução parada sem desligar o loop.
- Escape devolveu foco a “Histórias”; abrir “Seu olhar” fechou “Histórias”; clique no diorama fechou o painel. O botão “Sobre a cena” abriu por clique e teclado; a referência Gênesis 45 abriu em outra aba e deixou o diálogo fechado. O menu do projeto navegou até a biblioteca.
- Os três painéis foram medidos em 1440×900, 1024×768, 390×844, 320×740 e 740×390: 15 casos sem transbordamento horizontal nem painel fora da viewport.
- Visual móvel conferido em 320×740; botões legíveis e diorama livre. A revisão móvel usa viewport de desktop, sem ensaio em aparelho físico.

Arquivos: `src/ui/scene-panels.js`, `src/ui/immersive.js`, `src/main.js`, `src/immersive.css`. O ajustador da antiga coluna editorial foi retirado, pois o texto agora está no diálogo de estudo.
