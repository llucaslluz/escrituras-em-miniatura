# Diagnóstico inicial — 2 de novembro de 2026

## Resultado e alcance

O aplicativo **Escrituras em Miniatura** já oferece uma experiência 3D com 72 histórias, navegação, biblioteca e preferências. A base permite melhorias graduais para celular. Esta etapa inspecionou o projeto e configurou instruções de desenvolvimento; não implementou mudanças no comportamento, conteúdo ou aparência do site.

As observações abaixo distinguem inspeção estática, verificações executadas e pontos que ainda precisam ser medidos. Relatórios antigos do projeto são contexto histórico, não comprovação desta versão.

## Localização e duas raízes Git

- Projeto cadastrado no Codex: `C:\Users\lluca\Documents\ChatGPT\SUD 3d`.
- Aplicativo e repositório de desenvolvimento: `C:\Users\lluca\Documents\ChatGPT\SUD 3d\escrituras-em-miniatura`.
- A pasta externa tem seu próprio `.git`, branch `main`, sem commits. Na inspeção inicial, ela listava `entrega/` e `escrituras-em-miniatura/` como não rastreadas.
- O aplicativo possui um segundo `.git`, branch `main`, com HEAD `46cc30d`, de 19 de outubro de 2026, mensagem `Update Site source`. Foram contados 153 arquivos rastreados e nenhum remote foi listado.
- `entrega/` contém arquivos de distribuição e uma cópia de verificação antiga. Esses arquivos não são a fonte principal de desenvolvimento.

As instruções e configurações de agentes devem ficar na raiz interna do aplicativo, para também funcionarem quando ele for aberto diretamente no Codex. Um guia na pasta externa pode apontar para essa raiz.

### Alterações preexistentes no aplicativo

Antes da configuração da equipe, o repositório interno já estava com alterações locais. Preservá-las integralmente:

| Estado inicial | Arquivo ou pasta |
| --- | --- |
| Modificado | `README.md` |
| Modificado | `package-lock.json` |
| Modificado | `package.json` |
| Modificado | `src/main.js` |
| Modificado | `src/scenes/bible.js` |
| Modificado | `tests/water-plinth.test.mjs` |
| Não rastreado | `docs/TRAVESSIA-2.1.md` |
| Não rastreado | `src/scenes/bible/` |
| Não rastreado | `tests/red-sea-families.test.mjs` |
| Não rastreado | `tests/red-sea-water.test.mjs` |

Não foram encontrados `AGENTS.md` ou overrides na árvore do projeto ou nos ancestrais inspecionados antes desta configuração. Os novos documentos da equipe não devem ser confundidos com as alterações preexistentes acima.

## Estrutura e tecnologias

| Área | Evidência local |
| --- | --- |
| Aplicação | JavaScript com módulos ESM, sem framework de interface; `package.json:5` |
| Construção e servidor local | Vite `8.3.4`; `package.json:6–18` |
| Renderização 3D | Three.js `0.186.1`; `package.json:14–15` |
| Versão em desenvolvimento | `2.1.0`; `package.json:3` e `README.md:3` |
| Requisitos documentados | Node.js 22.12+, npm e navegador com WebGL 2; `README.md:13` |
| Interface e roteamento | `src/main.js`; composição imersiva e painéis em `src/ui/` |
| Conteúdo | Catálogo, personagens e editoriais em `src/data/` |
| Motor e arte procedural | `src/engine/` e construtores por obra em `src/scenes/` |
| Persistência | Favoritos, histórico, preferências e continuação em `localStorage`; `src/storage.js:1–7` |
| Recursos | Miniaturas e favicon locais em `public/`; saída estática em `dist/` |
| Testes | Test runner nativo do Node em `tests/*.test.mjs`; `package.json:10` |

Não foi identificada dependência de backend, login, banco de dados ou API privada para executar o site. Os links de fontes abrem passagens externas; favoritos e histórico permanecem no navegador (`docs/DEPENDENCIAS.md:21–25`). Não há necessidade de criar agentes dentro do site ou adicionar chaves de API para organizar esta equipe de desenvolvimento.

## Fluxos existentes

1. A entrada e `#inicio` abrem a última história visitada ou B17, o Batismo de Jesus. A apresentação editorial permanece em `#apresentacao` (`src/main.js:72`).
2. `#historia/ID` oferece escolha de obra/história, anterior/próxima, exploração por toque e teclado, zoom, enquadramento, pausa, repetição, velocidade e momentos narrativos. Os painéis começam recolhidos (`src/ui/immersive.js:18–38`).
3. A biblioteca reúne pesquisa sem acentos, filtros por obra/tipo/testamento, favoritos e histórico (`src/main.js:32–34`).
4. Há linha do tempo, galeria de personagens e página de fontes/sobre (`src/main.js:67–69`).
5. Personagens e elementos podem ser selecionados no 3D ou pela lista textual. Preferências incluem movimento reduzido, qualidade gráfica e tamanho do texto.

O catálogo contém 32 histórias da Bíblia, 20 do Livro de Mórmon, 10 de Doutrina e Convênios e 10 da Pérola de Grande Valor (`src/data/catalog.js:5–7`).

## Pontos fortes a preservar

- Os módulos de cenas são carregados por obra e a cena é construída quando escolhida (`src/engine/viewer.js:8,31–38`).
- A troca de rota destrói o visualizador anterior; há descarte explícito de observadores, eventos, geometrias, materiais, sombras e recursos de renderização (`src/main.js:71`; `src/engine/viewer.js:82`).
- Existe alternativa textual ao 3D, controles nativos, navegação de câmera por teclado e respeito inicial à preferência de movimento reduzido.
- A narrativa, suas fontes e a identidade artística já têm documentação e testes de regressão. Alterações visuais devem manter IDs, referências, conteúdos e determinismo das cenas.

## Achados de inspeção estática

| Prioridade | Achado | Implicação e próximo passo |
| --- | --- | --- |
| P0 | Dois repositórios e alterações locais preexistentes | Trabalhar na raiz interna e limitar cada entrega aos arquivos atribuídos. Não resetar, limpar ou substituir o trabalho existente. |
| P1 | O diálogo de preferências não tem nome acessível explícito (`src/main.js:70`) | Associar o título ao diálogo em uma futura correção e verificar o anúncio com tecnologia assistiva. |
| P1 | O botão do menu móvel da interface editorial não declara inicialmente `aria-expanded`/`aria-controls` (`src/main.js:21,87`) | Tornar a relação e o estado do menu explícitos e testar abertura, fechamento e foco. |
| P1 | Há tamanhos pequenos de texto e controles compactos nas regras de estilo (`src/style.css:2,7,13`) | Medir alvos de toque e legibilidade em telas estreitas, texto ampliado e paisagem antes de definir a correção. São riscos, não falhas visuais comprovadas nesta rodada. |
| P1 | O ciclo de renderização continua mesmo com a narrativa pausada (`src/engine/viewer.js:81`) | Medir consumo e comportamento antes de propor renderização sob demanda; câmera e controles devem continuar utilizáveis. |
| P1 | `preserveDrawingBuffer: true` é definido no renderer (`src/engine/viewer.js:15`) | Avaliar o custo e a necessidade para capturas. Qualquer mudança deve preservar os fluxos de captura existentes. |
| P2 | Documentos e artefatos indicam versões diferentes | `EXPORT-MANIFEST.json:3` indica 2.0.0 e `docs/CONTINUIDADE.md:3` indica 1.1.0, enquanto o código indica 2.1.0. A metadescrição ainda menciona feltro (`index.html:2`). Atualizar em uma entrega própria, sem regenerar pacotes nesta etapa. |

## Verificações executadas nesta rodada

- **127 testes passaram**, em aproximadamente **9,38 segundos**, na execução informada pelo agente principal.
- **Build de inspeção passou** em diretório temporário externo ao aplicativo: 44 módulos processados. Arquivo principal JavaScript: **966,24 kB**, **262,52 kB gzip**. CSS: **83,42 kB**, **17,22 kB gzip**. Vite emitiu aviso de chunk maior que 500 kB.
- Esses resultados comprovam os testes executados e a construção. O tamanho do pacote é uma medição de saída; ele não comprova tempo de carregamento, fluidez ou consumo em celular.
- Não foram executados `npm run export` nem `npm run verify` nesta inspeção. O primeiro sobrescreve manifestos/pacotes (`scripts/export.py:24–37`); o segundo grava `artifacts/inventory.json` (`scripts/verify.mjs:8`).

## Lacunas de validação

Não houve teste de navegador, emulação móvel ou telefone físico nesta rodada. Portanto, ainda não foram confirmados visualmente: ausência de sobreposição, rolagem horizontal, legibilidade, ordem e retorno do foco, experiência de toque, comportamento com teclado virtual, perda de WebGL, leitores de tela, FPS ou Core Web Vitals.

O relatório histórico menciona 390×844 e declara ausência de testes em telefone físico, Safari/iOS e Firefox (`docs/VERIFICACOES.md:45,62`). Essas condições precisam ser reavaliadas para a versão atual. O plano em `PLANO.md` define responsáveis, critérios e sequência.

## Equipe de desenvolvimento

A configuração prevista usa `AGENTS.md` na raiz interna, seis definições independentes em `.codex/agents/`, prompts reutilizáveis e um limite de três subagentes simultâneos. Os agentes herdam o modelo da sessão; não se fixa um modelo que a conta possa não oferecer. O orquestrador consolida o trabalho; os especialistas atuam em lotes e com um único editor por arquivo.

Os papéis são orquestrador, UX/UI mobile-first, frontend/3D, acessibilidade, QA/testes e desempenho. A existência dos arquivos descreve e orienta os agentes; não implica que seis processos fiquem permanentemente em execução.
