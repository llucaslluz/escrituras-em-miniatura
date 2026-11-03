# Plano da equipe — experiência excepcional no celular

## Execução autorizada — catálogo completo de 72 cenas

Pedido atual: executar a melhoria visual e de animação de **todas as 72 histórias**, começando por B11 e B05 e continuando autonomamente por lotes internos. A sequência antiga de pilotos abaixo permanece como histórico; o escopo vigente abrange todo o catálogo.

Registro individual: [CATALOGO-72.md](CATALOGO-72.md) e [dados estruturados](CATALOGO-72.json). Lotes exaustivos: 00-pilotos (B11, B05); 01-agua-jornadas (B01, B13, B17, B18, B22, B23, M05, M09, M19); 02-deserto-convenios (B02, B04, B06, B10, M01, M04, M12, M13, M20, P05, P07); 03-cidades-testemunhos (B03, B07, B09, B16, B20, B21, B27, M03, M07, M08, M11, M14, M15, D03); 04-encontros-cuidado (B08, B14, B15, B19, B24, B25, B26, B28, M17, M18, D04); 05-bosques-oracao (B29, B31, M06, M10, M16, D01, D02, P09, P10); 06-fogo-interiores (B12, B30, D06, D07, D08); 07-visoes-criacao (B32, M02, D05, D09, D10, P01, P02, P03, P04, P06, P08).

Cada cena exige revisão de código, melhorias próprias ou refinamento compartilhado explicitamente justificado, teste determinístico, inspeção visual em ângulos/instantes distintos e pendências registradas. Aprovação visual não decorre só de testes. Modificações no motor passam pela suíte e revisão do catálogo afetado. UI, narrativas, fontes e estado persistido permanecem protegidos. Builds e comparações ficam em pastas temporárias.

### Estado da execução do catálogo

Os oito lotes foram implementados e as **72 cenas receberam revisão individual por amostras**, com registro de mudanças, vistas, instantes e limites em [CATALOGO-72.md](CATALOGO-72.md). O [relatório consolidado](RELATORIO-72-CENAS.md) registra os resultados de navegador e desempenho, os arquivos efetivamente alterados desde a cópia inicial e os passos ainda dependentes de aparelhos ou ferramentas indisponíveis.

O padrão partiu de B11 e B05 e se expandiu com intervenções locais, apoio analítico dos pés, variação de materiais/formas, transições suaves e câmeras de inspeção. O acabamento continua estilizado e simplificado; a revisão amostral não certifica equivalência às imagens de referência nem ausência de interpenetração em todo instante/ângulo livre. Não há pendência de implementação atribuída ao próximo lote nesta tarefa; as verificações não executadas estão explicitamente separadas no relatório.

O fechamento técnico passou em **241 testes**, build externa temporária e auditoria determinística das 72 cenas. A regressão emulada cobriu as seis dimensões pedidas; fonte-base de 15 para 30 px é um teste distinto do zoom nativo. Foram medidas reprodução, pausa, qualidades baixa/média e vinte trocas controladas na versão final. As otimizações aplicadas foram decididas a partir das medições: renderização ociosa, instancing de B11 e cache matematicamente equivalente do mar em B05. Não se infere desempenho móvel físico, uso de VRAM ou ausência de vazamento a partir dessas medições.

Ponto de continuidade: usar a versão de origem atual e o relatório/registro acima, mantendo a galeria antes/depois e os dados brutos; executar somente as verificações externas pendentes antes de ampliar conclusões. `dist/`, `../entrega/`, conteúdo editorial e correções dos dois lotes móveis continuam preservados. Nenhuma publicação ou exportação foi realizada.

Concorrência: até três especialistas simultâneos, papéis TOML do projeto quando os perfis nativos não estiverem expostos. Frontend é editor dos pilotos; QA edita apenas sua ferramenta de auditoria/testes atribuídos; UX revisa sem escrever; orquestrador edita somente planejamento e registro. Novos responsáveis por arquivos serão atribuídos ao avançar os lotes, sem escrita concorrente.


## Escopo e atualização anterior do plano — histórico

Diagnosticar o projeto e configurar uma equipe de desenvolvimento no Codex. A inspeção está registrada em `DIAGNOSTICO-2026-11-02.md`. A configuração inclui instruções persistentes, seis papéis e prompts para iniciar trabalhos com escopo definido.

A configuração inicial não implementou mudanças no site. Desde então, o usuário trouxe relatos de conclusão dos lotes de semântica/controles e legibilidade/leitura expandida. Esses relatos e as medições posteriores são contexto das próximas tarefas; esta atualização do plano não executou novamente esses ensaios.

**Nova prioridade solicitada:** elevar o acabamento visual e a qualidade das animações, preservando a interação 3D e o uso no celular. Os pilotos são **B11 — Daniel na cova dos leões** e **B05 — A travessia do Mar Vermelho**. As duas imagens fornecidas pelo usuário, a direção visual, o escopo e os critérios de aceite estão em [DIRECAO-ARTE-3D.md](DIRECAO-ARTE-3D.md). Esta atualização altera somente planejamento e guarda as referências; não modifica cenas, dependências ou entregas.

### Próxima sequência de desenvolvimento

1. Registrar o estado visual e animado atual das duas cenas; refinar **B11 primeiro**, como piloto de acabamento, contato e movimento suave.
2. Validar B11 em reprodução e câmera livre, com comparação visual, interações e custo gráfico. Em seguida, aplicar o processo à **B05**, incluindo água e caminhada das famílias.
3. Consolidar os padrões que funcionarem e planejar a expansão gradual para as demais histórias, em lotes pequenos. Não alterar todas as cenas de uma vez.
4. Manter zoom nativo, segundo plano real, leitor de tela e celulares físicos como verificações pendentes até execução efetiva. Elas não invalidam o início do piloto artístico, mas limitam as conclusões de qualidade móvel e desempenho.

### Estado de desempenho informado pelo usuário

O último relato informa ensaios no navegador integrado, em 390×844, com DPR aproximado de 1: narrativa congelada na pausa apesar da renderização continuar; comparação de uma rodada por qualidade; e 20 trocas com um canvas/contexto ativo e contagens de recursos da B17 iguais no retorno. O heap variou e não demonstrou ausência nem presença de vazamento. Intervalos de RAF medem agendamento; não comprovam FPS da GPU ou desempenho em celular. Zoom nativo e segundo plano real permaneceram pendentes. Usar o registro original da execução para comparações; estes pontos não foram remedidos nesta atualização.

## Organização do trabalho

O **orquestrador** recebe o objetivo do usuário, inspeciona o estado atual, define uma entrega pequena e distribui tarefas independentes. UX, acessibilidade e desempenho podem revisar em paralelo. Frontend implementa a mudança e QA verifica o comportamento resultante. O orquestrador integra achados, resolve divergências e informa o que foi comprovado e o que permanece pendente.

Usar no máximo **três subagentes simultâneos**, conforme a configuração do projeto e os limites efetivos da sessão. Os seis papéis não precisam executar ao mesmo tempo. Não permitir dois agentes editando o mesmo arquivo; o responsável pelo lote atribui os arquivos antes de iniciar a implementação. Revisores trabalham em leitura quando o mesmo arquivo está em edição.

| Papel | Responsabilidade principal | Entrega esperada |
| --- | --- | --- |
| Orquestrador | Escopo, decisões, preservação do trabalho, integração | Plano curto, atribuição de arquivos e resultado consolidado |
| UX/UI mobile-first | Jornada, hierarquia, navegação, leitura e toque | Problemas reproduzíveis, proposta de interação e critérios visuais |
| Frontend/3D | Interface, rotas, estado e integração com o visualizador | Mudança pequena, mantendo os contratos existentes |
| Acessibilidade | Semântica, teclado, foco, contraste, movimento e alternativa ao 3D | Achados com evidência e verificação manual/automática adequada |
| QA/testes | Regressões e fluxos em resoluções móveis | Casos de teste, passos, resultado e evidências |
| Desempenho | Carregamento, renderização, memória e custo no celular | Linha de base comparável e ganho medido |

## Prioridades e critérios de aceite

| Etapa | Dono e apoio | Trabalho | Aceite verificável |
| --- | --- | --- | --- |
| P0 — base segura | Orquestrador | Confirmar raiz Git interna, registrar estado atual e preservar alterações preexistentes | Arquivos atribuídos explicitamente; nenhuma mudança incidental, reset, limpeza, publicação ou exportação |
| P1 — linha de base móvel | QA + UX e acessibilidade | Abrir fluxos reais na versão atual e registrar evidências nas resoluções abaixo | Passos reproduzíveis, dimensões e navegador informados; lista de sobreposições, corte de texto, rolagem e problemas de foco; lacunas declaradas |
| P1 — navegação e acessibilidade | Frontend + acessibilidade e QA | Corrigir o nome do diálogo de preferências e o estado/relação do menu móvel; abordar outros defeitos comprovados | Diálogo anunciado pelo nome; estado expandido coerente; teclado e foco previsíveis; abertura/fechamento e retorno ao acionador verificados |
| P1 — layout para toque e leitura | UX + frontend e QA | Priorizar conteúdo, legibilidade e acesso aos controles em telas estreitas/curtas | Sem sobreposição ou rolagem horizontal nos fluxos comuns; alvos principais confortáveis, meta de 44×44 CSS px; texto ampliado e teclado virtual não bloqueiam ações |
| P1 — desempenho 3D | Desempenho + frontend e QA | Medir pacote inicial, entrada, cena pausada, retomada e trocas; avaliar RAF contínuo e drawing buffer | Comparação antes/depois no mesmo ambiente; câmera, pausa, captura e qualidade preservadas; sem crescimento contínuo de recursos ao alternar cenas |
| P1 — arte e animação dos pilotos | Frontend/3D + UX, desempenho e QA | Refinar B11 e depois B05 segundo as imagens do usuário e a direção de arte vinculada acima | Comparação de imagem e movimento; detalhes legíveis; contatos e transições coerentes; interações mantidas; custo gráfico comparável e limitações registradas |
| P2 — regressão automatizada | QA + frontend | Acrescentar testes de comportamento para defeitos corrigidos e jornadas críticas | Testes verificam resultado para o usuário; suíte existente passa; falha original reproduzida quando aplicável; evitar testes que apenas espelham o código |
| P2 — atualização documental | Orquestrador | Alinhar documentos de continuidade e metadados à versão entregue | Versões e limites coerentes; evidências antigas identificadas; manifesto e pacotes só regenerados em tarefa própria de entrega |

## Matriz móvel e fluxos de aceitação

Primeiro validar **320×568**, **360×800**, **390×844** e **412×915** CSS px em retrato; incluir uma viewport curta em paisagem, por exemplo **844×390**, além de tablet e desktop para regressão. Emulação cobre layout; registrar testes em telefone físico separadamente.

Verificar nestas condições:

1. Entrada, abertura de uma história por link e retorno/avanço do navegador.
2. Abrir e fechar Histórias, Seu olhar, Controles, menu do projeto e Sobre a cena; escolher obra, anterior/próxima e uma história de título longo.
3. Biblioteca: busca com/sem acentos, filtros, nenhum resultado, favoritos e histórico. Abrir o teclado virtual e conferir acesso ao campo e aos resultados.
4. Girar/aproximar por toque e por controles, pausar/retomar, escolher momento, alterar loop e velocidade, selecionar personagem pela lista e restaurar câmera.
5. Preferências: texto grande/extra grande, movimento reduzido e qualidade baixa; recarregar e navegar para conferir persistência.
6. Navegar por teclado com foco visível, fechar painéis com Esc e verificar retorno do foco. Realizar leitura assistiva nas interfaces prioritárias.
7. Conferir fallback de WebGL e falhas de carregamento por método controlado; os textos, referências e caminhos de saída devem permanecer acessíveis.
8. Repetir trocas de histórias e comparar recursos/memória; alternar aba e voltar. Testar Safari/iOS e Chrome/Android em dispositivos reais quando disponíveis.

Registrar capturas com viewport/navegador, cenário, passos e resultado. Não declarar aprovação de Safari, telefone físico ou leitor de tela sem executar a verificação correspondente.

## Metas de qualidade

- Priorizar tarefas de uma mão, rótulos claros e acesso fácil à biblioteca e à história atual.
- Tratar [WCAG 2.2 nível AA](https://www.w3.org/TR/WCAG22/) como objetivo de acessibilidade, incluindo contraste, foco, semântica, teclado, leitura e movimento; uma ferramenta automática sozinha não comprova conformidade.
- Preservar IDs das 72 histórias, referências, conteúdo editorial, links, favoritos, histórico, preferências e alternativa textual ao 3D.
- Preservar pausa narrativa determinística, câmera manual, descarte de recursos e o fluxo de captura usado pelo projeto.
- Medir LCP, INP e CLS em condições declaradas. [Metas de referência de Web Vitals](https://web.dev/articles/vitals): LCP até 2,5 s, INP até 200 ms e CLS até 0,1 no percentil 75 quando houver dados de campo suficientes. Uma rodada de laboratório não equivale a dados de campo.
- Definir orçamento de GPU/FPS e carregamento após medir celulares de referência; não prometer fluidez apenas pelo resultado do build ou do computador de desenvolvimento.

## Verificação de cada entrega

Na raiz interna do aplicativo, conferir os scripts existentes antes de executar comandos. `npm test` executa a suíte Node; `npm run build` produz a saída estática. Para mudanças apenas de documentação e agentes, validar sintaxe/configuração, links e escopo do diff é suficiente.

Para mudanças no site, executar testes compatíveis com o comportamento alterado e a matriz móvel relevante. A suíte inicial teve 127 testes aprovados, mas não substitui testes de interface. Registrar o ambiente e o aviso de tamanho de chunk quando ainda existir.

`npm run verify` grava inventário em `artifacts/`; `npm run export` sobrescreve manifesto e artefatos em `entrega/`. Não executar exportações como efeito lateral de uma revisão. Não instalar ferramentas, alterar dependências ou substituir lockfiles sem necessidade da tarefa.

O resultado final de cada lote deve informar: problema resolvido, arquivos alterados, testes executados, evidências móveis, limitações e próximo trabalho pendente. Distinguir sempre inspeção de código, teste automatizado, inspeção visual, medição de laboratório e teste em dispositivo físico.

## Sequência original de implementação — histórico

Começar por uma rodada de navegação móvel e acessibilidade, sem redesenho amplo. Reproduzir as questões de preferências e menu, confirmar os problemas de texto/toque e registrar a linha de base de desempenho. Em seguida, implementar somente as correções comprovadas de nome, estado e foco com um editor responsável por `src/main.js`, mantendo os revisores em leitura. Melhorias de renderização ficam em lote separado, após a medição.

Os lotes de semântica/controles e leitura foram posteriormente relatados como concluídos pelo usuário. Preserve essas melhorias. A próxima tarefa indicada é o piloto de arte e animação descrito no início deste plano, sem repetir a configuração da equipe.
