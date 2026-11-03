# Matriz de QA e desempenho mobile

Plano de verificação da equipe, criado em 2 de novembro de 2026. **Nenhum caso desta matriz foi executado por sua criação.** Os relatos históricos do projeto não substituem um registro da versão e do ambiente atuais. Use ferramentas já disponíveis; esta matriz não exige instalar dependências.

## Ambiente e níveis de evidência

Antes da rodada, registre revisão/branch, alterações locais relevantes, data, sistema, navegador/versão, dispositivo/GPU quando conhecidos, URL e modo de execução (desenvolvimento ou build). Preserve os arquivos locais anteriores à tarefa. Build substitui `dist/`; `verify` escreve em `artifacts/`; exportação e publicação não são testes desta matriz.

| Nível | O que demonstra | Limite |
| --- | --- | --- |
| `npm test` | Lógica, catálogo, contratos e regressões 3D cobertos pelos testes | Não comprova layout, toque, acessibilidade completa ou GPU real. |
| `npm run build` | Construção dos recursos estáticos | Não comprova navegação nem desempenho no telefone. |
| Navegador com viewport emulada | Layout, estados, foco e fluxos nas dimensões registradas | Emular tamanho/toque não reproduz GPU, bateria, barras móveis ou Safari de um telefone. |
| Telefone físico | Gestos, teclado, áreas seguras, barras, GPU e comportamento daquele aparelho | Não generalizar para todos os celulares; registre modelo e condições. |

Use **PASSOU**, **FALHOU** ou **NÃO EXECUTADO** por caso e ambiente. Falta de hardware ou ferramenta resulta em NÃO EXECUTADO, com motivo. Um caso de fallback só passa quando o fallback é realmente provocado e observado; revisar o código não equivale a executá-lo.

## Resoluções e variantes

Dimensões abaixo são de viewport em CSS px. Registre o DPR separadamente. Ajuste a viewport do aparelho físico às dimensões disponíveis e anote a dimensão real.

| ID | Viewport | Foco da inspeção |
| --- | --- | --- |
| R01 | 320×568 | Menor largura, textos longos, painéis e controles no pouco espaço vertical. |
| R02 | 360×800 | Fluxos completos em Android estreito, teclado virtual e rolagem. |
| R03 | 390×844 | Fluxos completos, enquadramento, navegação e leitura da narrativa. |
| R04 | 412×915 | Aproveitamento de espaço, escalas e alcance dos controles. |
| R05 | 844×390 | Paisagem: estudo, menus, tela cheia e barras sem cobrir ações. |
| R06 | 768×1024 | Tablet em retrato, transição de layout e colunas. |
| R07 | 1024×768 | Tablet em paisagem, painéis e reposicionamento da câmera. |
| R08 | 1440×900 | Referência desktop, teclado, colunas e regressões fora do celular. |

Em todas as resoluções, faça F01–F07 abaixo com qualidade média e texto padrão. Em R01, R03 e R05, repita as telas principais com texto a 200% (zoom de texto quando disponível; registre o método) e com a preferência de texto Extra grande do site. Esses dois controles são verificações distintas. Confira movimento reduzido do sistema e do site. Em R03, rode F04 e F08 nas qualidades baixa, média e alta. Repita os riscos relevantes em ao menos um Android e um iPhone/Safari físicos quando disponíveis.

Metas de aceite: conteúdo e ações alcançáveis; ausência de rolagem horizontal da página e cortes; textos legíveis; foco visível; alvos de toque confortáveis (meta de 44×44 CSS px, avaliando espaçamento e contexto); navegação sem depender exclusivamente de arrastar o 3D. Não declarar conformidade de acessibilidade apenas com esta matriz.

## Casos e passos

| Caso | Passos | Aceite e evidência necessária |
| --- | --- | --- |
| F01 — Entrada e rotas | Abrir sem histórico; abrir `/#historia/B17` diretamente; recarregar; navegar, voltar e avançar pelo navegador; repetir com última história salva. | História/rota/título coerentes, sem tela vazia ou erro de console. Registrar URL, sequência e captura do resultado. |
| F02 — Histórias e menus | Abrir Histórias, alternar as quatro obras, escolher episódio e anterior/próximo; abrir/fechar menus por botão, clique fora e Esc. | Escolha e limites da obra corretos; menus recolhem conforme esperado; foco retorna de forma coerente. Registrar vídeo curto ou passos e foco antes/depois. |
| F03 — Biblioteca e busca | Abrir biblioteca; buscar com/sem acentos; combinar filtros; testar nenhum resultado; favoritar, recarregar e conferir persistência. | Resultados coerentes, estado vazio compreensível, controles acessíveis com teclado virtual aberto. Registrar consulta, filtros, resultado e persistência. |
| F04 — Câmera e narrativa | Em B17 e B05, girar, aproximar/afastar, restaurar e trocar vistas; pausar, esperar, buscar momentos, alterar velocidade, repetir e desligar loop; abrir tela cheia e sair. | Tempo permanece congelado na pausa; busca recompõe o instante; loop respeita a escolha; controles alcançáveis. Registrar tempos antes/depois, momento, viewport e vídeo/capturas comparáveis. |
| F05 — Leitura e seleção | Abrir estudo, ler título/contexto/ensinamento, selecionar personagem no canvas e pela lista; abrir referência; voltar à história. | Alternativa textual utilizável, informações corretas, foco/rolagem coerentes e link de referência preservado. Registrar item escolhido, nome acessível e foco. |
| F06 — Acessibilidade e preferências | Navegar por Tab/Shift+Tab/Enter/Esc/setas; testar texto a 200%, texto Extra grande, movimento reduzido antes da carga e preferência do site; recarregar e trocar de história. | Foco visível sem aprisionamento, nomes/estados compreensíveis, narrativa inicialmente pausada com movimento reduzido, preferências mantidas. Registrar método e estado inicial/final; leitor de tela requer rodada própria. |
| F07 — Gestos e orientação | Rolar começando dentro e fora do canvas, operar com uma mão, abrir teclado virtual, alternar retrato/paisagem e mostrar/ocultar barras móveis. | É possível alcançar e deixar o diorama, texto e ações continuam disponíveis; não há sobreposição por teclado/área segura; câmera e zoom permanecem coerentes. Evidência em telefone físico para barras/gestos reais. |
| F08 — Qualidade e fallback | Repetir B05/B11 nas três qualidades; provocar ausência de WebGL em sessão isolada se a ferramenta permitir; testar qualidade baixa e ausência de HDR separadamente. | Qualidade baixa continua funcional; lente sem HDR usa alternativa prevista; ausência de WebGL mostra orientação e permite texto/listas/fontes. Registrar como a condição foi provocada; não confundir baixa qualidade com ausência de WebGL. |

Amostra inicial de cenas: **B05, B11, B17, M15, M19, D09 e P09**. Ela cobre água, animais, pessoas, animação, elementos selecionáveis, diagrama e atmosfera. Uma mudança no motor compartilhado exige ao menos a suíte existente de 72 construtores e uma rodada direcionada de todas as cenas afetadas; a amostra não substitui a cobertura do catálogo.

## Desempenho, memória e energia

Meça antes de otimizar e repita sob as mesmas condições após mudanças. Registre ferramenta/versão, rede, cache frio ou quente, viewport/DPR, qualidade, movimento, energia/bateria e aquecimento inicial. Para comparações, faça três rodadas e guarde cada resultado; evite números isolados como promessa de qualidade.

| Caso | Procedimento | Evidência e interpretação |
| --- | --- | --- |
| P01 — Carga e resposta | Na build local, medir entrada fria e quente, abertura de menu, busca e troca de história. Usar medição de rede/CPU controlada quando disponível. | Registrar bytes transferidos/compressão, carregamento, tarefas longas e LCP/INP/CLS quando a ferramenta permitir. Medições locais são diagnóstico; dados de uso real são outra evidência. |
| P02 — Fluidez e custo gráfico | Medir 60 s nas cenas de amostra em baixa/média/alta; comparar pausa, reprodução, câmera manual e troca de atmosfera. | Guardar FPS e distribuição de tempos de quadro quando disponíveis, draw calls/triângulos e perfil CPU/GPU. Contador de RAF do site sozinho não prova fluidez sustentada. |
| P03 — Ciclo de vida e memória | Alternar 20 vezes entre cenas de obras diferentes; abrir/fechar painéis; voltar à biblioteca; repetir o ciclo. | Registrar geometrias/texturas, contextos WebGL e memória antes, durante e após. Crescimento persistente exige investigar; memória de heap JavaScript não representa toda a memória da GPU. |
| P04 — Pausa e visibilidade | Comparar reprodução, pausa, movimento reduzido, aba em segundo plano e retorno; na apresentação, sair da área visível do diorama. | Medir atividade de renderização/CPU/GPU em cada estado e recuperação ao retornar. Há risco estático de renderização contínua mesmo na pausa; confirmar o custo por medição. |
| P05 — Sustentação no telefone | No mesmo brilho/qualidade, rodar uma sessão de 5–10 min, depois repetir a sessão equivalente com pausa/baixa qualidade; controlar ordem e temperatura. | Registrar modelo, bateria inicial/final, carregador, aquecimento percebido/telemetria disponível, quedas de fluidez e eventual perda de contexto. Queda de bateria curta é ruidosa; não atribuir economia sem comparação confiável. |
| P06 — Interrupções | Bloquear/desbloquear aparelho, alternar app/aba e retomar; provocar perda de contexto apenas com ferramenta disponível e escopo local. | Conferir cena, controles, tempo e recuperação; guardar erro de console e passos se houver falha. Não alegar resiliência sem observar o retorno. |

Riscos a investigar, sem tratá-los como falhas já reproduzidas em telefone: renderização contínua enquanto a narrativa está pausada; `preserveDrawingBuffer` permanente; custo de sombras/lente em qualidade média/alta; carga inicial do motor 3D; descarte após muitas trocas. Preserve exportação de imagens e contratos de animação ao propor qualquer otimização.

## Registro de uma execução

Copie o modelo por caso e ambiente:

```text
Data/hora e responsável:
Caso e viewport/DPR:
Revisão/branch e alterações locais relevantes:
Ambiente: [unitário | build | emulação | telefone físico]
Dispositivo/SO/GPU/navegador/versões:
URL e modo [dev | build], rede/cache:
Texto/zoom, reduced motion, qualidade, bateria/temperatura:
Passos executados:
Esperado:
Observado:
Status: [PASSOU | FALHOU | NÃO EXECUTADO]
Evidências: [capturas/vídeo/log/perfil, com localização]
Limite ou motivo de não execução:
Problema/prioridade e próxima ação:
```

Ao concluir, reporte contagem por status, ambientes realmente cobertos e casos pendentes. Relacione cada problema reproduzido aos passos e evidências. Não usar relatórios antigos, build aprovada ou teste unitário como substituto de uma rodada móvel atual.