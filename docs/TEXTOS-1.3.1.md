# Textos na estrutura da cena — versão 1.3.1

A apresentação voltou à lateral permanente da cena: local/contexto, título poético, nome e tema da história, convite dos personagens e referência com link. O título visível é o único h1 da página. O diálogo “Sobre a cena” mantém o resumo, personagens, contexto e fontes, sem repetir o bloco poético.

Os botões “Histórias”, “Seu olhar” e “Controles” continuam recolhidos por padrão e fecham após a escolha. O loop contínuo também foi preservado.

A coluna usa fluxo vertical e ajuste do título ao espaço disponível, evitando a colisão do título com o bloco dos personagens. Em telas curtas, nenhuma descrição, convite ou referência é ocultada: a coluna passa a aceitar rolagem e foco por teclado. A rolagem mantém o restante do diorama disponível para interação. O ajustador e seus observadores são liberados na navegação.

## Verificações desta correção

- Construção de produção concluída. Permanece o aviso já conhecido do pacote Three.js acima de 500 kB.
- Checagem de sintaxe dos três módulos alterados e `git diff --check` concluídas.
- `npm run verify`: 72 histórias, contagens 32/20/10/10 e nenhum problema.
- Navegador: todos os 72 títulos únicos em 1440×900, com convite dos personagens visível, sem sobreposição entre os blocos, transbordamento do título ou necessidade de rolar a coluna. Menus permaneceram recolhidos após selecionar cada história.
- B01 e B12 em 1920×827, 1280×720, 1024×768, 390×844, 320×740 e 740×390: 12 casos sem colisão; quando houve excesso de altura, a coluna habilitou rolagem. Em 390×844, a referência Daniel 3 foi alcançada por End no teclado e ficou dentro da área visível da coluna.
- Modelo, câmera e motor de animação não foram modificados. A suíte de 94 testes do motor/catálogo havia passado na versão 1.3.0; nesta correção visual, foram executadas as verificações de construção, sintaxe, catálogo e navegador descritas acima.

A verificação móvel usa viewport de desktop; não foi feita nova medição de desempenho nem ensaio em aparelho físico.
