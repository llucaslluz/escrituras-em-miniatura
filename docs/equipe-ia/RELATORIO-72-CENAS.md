# Relatório final — Escrituras em Miniatura, 72 cenas

Fechamento em 2 de novembro de 2026. As 72 cenas receberam revisão individual e correções incrementais de arte, animação, câmera e uso móvel, preservando histórias, referências, recursos e os lotes 1/2. Mudanças compartilhadas não significam modelagem local ampla em todas as cenas. A aprovação visual é amostral: não certifica fidelidade integral às referências, continuidade completa ou contatos ocultos/exatos.

## Resultado final e preservação

- **241/241 testes passaram**, zero falhas, 16,43 s. Build final: 49 módulos, 512 ms, aviso de chunk acima de 500 kB mantido.
- Auditoria profunda **72/72** após arte compartilhada, com dez instantes diretos/inversos; B05 auditada novamente após cache. Inclui transforms, matrizes, visibilidade, geometria inteira, normais, instâncias, cores e estado material. Exclui contador interno material.version, mantendo opacity/transparent/depthWrite.
- **72 cenas revistas individualmente** em 800×600, DPR 1, média: três vistas em t=16 e quatro amostras t=0/8/16/24, mais complementos de fase. Bíblia foi revista pelo UX e as outras 40 pelo QA. Sem novo bloqueio demonstrado nas amostras; ressalvas opcionais incluem vela diante de passageiros em M05 e coluna diante de acompanhantes em M08.
- SHA256 confirmou preservação de **1.837 arquivos de dist/entrega e 22 arquivos de dados/UI/main/CSS**. A lista de fontes alteradas no JSON foi calculada contra o snapshot anterior de src/, não inferida do Git com mudanças locais preexistentes.
- Não houve publicação nem substituição dos pacotes históricos. O histórico das revisões anteriores permanece separado no JSON.

## Entrega e evidências

Preview final: http://127.0.0.1: 4186/; build temporária `C:/Users/lluca/AppData/Local/Temp/sud-shortcut-final-8915ee2ba4eb447e86336571be25f397`. Desenvolvimento preservado: http://127.0.0.1: 5174/. Galeria: http://127.0.0.1: 4177/.

Galeria durável fora do projeto: `C:/Users/lluca/.codex/visualizations/2026/11/02/01a19acf-be34-73a2-ac73-c8e246184e07/catalogo/galeria-offline.html` e `sequencias.html`, com imagens em contatos/. [Catálogo por ID](CATALOGO-72.md) e [registro completo](CATALOGO-72.json) incluem achados, arquivos, evidências e pendências. registro.json da galeria acompanha o JSON do projeto.

## Arte e animação: alcance e complementos encerrados

O passe compartilhado ajustou roupas/personagens, copas, rochas/materiais e apresentação studio. Seis intervenções locais destacadas: B04 sarça orgânica; B06 montanha/caminho; B13 baleia/margem; M07 torre/tendas; D04 mesa/escrita/luz de Emma; P04 caminho/copa/fruto. Outras correções específicas de pose, apoio, câmera e fades estão registradas por ID. Não declaramos acabamento equivalente às imagens de referência.

| Complemento | Resultado amostral final |
|---|---|
| P01 t=24 vistas1/2 | Moisés e corpos celestes íntegros; ausência emt16 é fase anterior |
| P09 t=28 vista2 | Duas figuras suspensas legíveis; não confundir aparição intencional com falha de apoio |
| P10 t=8/24/30 e seis amostras24–30 | Aparição no quarto e progressão placas da caixa às mãos distinguíveis; não certifica interpolação entre quadros |
| B31 t=24 ambas vistas | Cristo/Maria separados, encontro legível sem árvore/tumba ocultando foco |
| D01 seis amostras12–17 | Mãos próximas às coroas, sem penetração grosseira aparente; contato exato parcialmente oculto |
| B05 seis amostras18–19 | Deslocamento e alternância dos pés perceptíveis, Moisés/cajado e famílias separados na projeção; sola parcial sob túnica, sem certificar ausência de deslizamento |

A folha B05 de10–11 s mostrava espera, não passada, e permanece somente como histórico. A tentativa extra B05-final241-fixedcamera.jpg em 736×900 foi excluída da comparação800×600. Equivalência geométrica do cache foi demonstrada por erro zero no Node, sem usar imagem de dimensão divergente como prova.

## Navegador, acessibilidade e matriz móvel

A rodada de rotas cobriu as72 histórias nos seis tamanhos320×568, 360×800, 390×844, 412×915, 844×390 e1440×900. As evidências finais de fonte ampliada em mobile/matriz-final241-font 200.jsonl contêm **54 amostras**: nove IDs(B11/B05/B04/B06/B13/M07/P04/D04/P10)×seis tamanhos, fonte raiz de 30 px, sem overflow horizontal, canvas ausente ou três gatilhos primários inalcançáveis. Fonte30 px é fixture separada e **não certifica zoom nativo200%**.

Os registros interativos demonstraram canvas/lista, foco, arraste, nomes, seek, velocidade, loop, menus, seleção de história, busca/filtros, favorito reversível, histórico, continuação em 16 s e fallback WebGL provocado. Galeria offline exibiu72 cenas e pré-filtroB05 sem overflow320 px; imagens inline e reprodução finita18→19 foram verificadas.

O defeito real de Ctrl+= com canvas focado(zoom 3D22→36) foi corrigido: guard Ctrl/Meta/Alt devolve atalhos ao navegador. Em mobile/atalho-zoom-modificado-depois.json, Ctrl+= preservou zoom 22/fonte15/390×844; duas teclas simples=elevaram zoom 48 e ArrowUp atualizou frames 2→5, tempo 0. Sete testes do Viewer passaram. Ctrl+0/cincoCtrl+= não alteraram viewport no IAB; isso mantém zoom nativo200% não validado, mesmo com o guard correto.

A tentativa performance/background-final241.json abriu outra aba IAB visible: true por47, 127 s. Documento permaneceu visible, visibilityEvents vazio, narrativa avançou com loop. Portanto **ocultação e retorno de aba real não foram validados**. Viewport736×900 nessa tentativa impede comparação com janelas390×844. O teste unitário hidden cobre lógica, não reproduz esse ambiente real.

## Desempenho medido e limites

Condições: IAB UA Chrome 156/Windows, ANGLE IntelUHD/D3D11; viewport390×844, DPR ≈ 1, canvas390×336; localhost sem throttling; uma aba 3D nas janelas finais, sem suíte/build concorrentes; mesma câmera e fase t=8, aquecimento2 s e janela≈8 s. Instrumentação temporária adiciona custo. Renders/s são quadros solicitados, não FPS apresentado na GPU; método render inclui submissão/driver, não tempo de GPU. Handles/contextos não são bytes de VRAM.

| Verificação | Resultado final | Interpretação |
|---|---|---|
| B05 média original/final241, n=3 | Mediana69,24→80,10 renders/s; update6, 234→4, 108 ms; P95RAF20,8–20,9→14 ms; GL 1.223/render iguais | +15,7% cadência/-34,1% update nesta pequena amostra; não promessa para celulares |
| B05 média pré-cache239/final241, n=3 |70,07→80,10 renders/s; update6, 225→4, 108 ms; GL iguais | Comparação direta do cache: -34,0% update/+14,3% cadência amostral |
| B05 baixa original/final241, n=2 |89,08→98,54 renders/s; update6, 390→4, 517 ms; GL 616iguais; P95RAF14 ms ambos | Economia de update; método render aumentou4, 338→5, 113 ms, sem atribuir tudo à GPU |
| B11 original/final241, n=1 por qualidade | GL/render -20,4% baixa/-21,8% média | Menos submissões após instancing; stalls/amostra única impedem ganho causal de cadência |
| Pausa final estável |21, 458 s com zero renders e zero draws; tempo 8 | Renderização redundante suspensa nessa condição; RAF ainda pode agendar |
| Final241-controlled |5 warmups+20 trocas, média/reducedtrue; 1 canvas/1 ativo,25 contextos totais/24 perdidos; B17 com 547 geometrias | Ciclo concluído; não prova ausência geral de vazamento |
| Heap no ciclo final |86.083.738 bytes após warmup→72.681.072final; faixa40,68–83,50 MB nos ciclos | Heap JS oscilante; não mede VRAM nem substitui retainers/GC controlado |

Dados: performance/windows-cache-comparison.jsonl, paused-stable-final241.json e swaps.jsonl fase final241-controlled. Excluir windows.jsonl exploratório e fases/câmeras não comparáveis. O estresse anterior de46 trocas com bloqueio de contexto após erros de shader foi observação separada, não experimento final controlado nem prova de vazamento. Console final contém histórico de4185/4180; não atribuir esses eventos antigos à4186 nem declarar todo arquivo limpo.

## Três otimizações aplicadas

| Mudança | Benefício observado | Risco e verificação |
|---|---|---|
| Invalidação em pausa | Zero renders/draws na janela final estável | Redraw pode faltar após resize/câmera/nomes/atmosfera; testes e interações confirmaram retomada, segundo plano real permanece pendente |
| Cache espacial local B05 | Node, 7 pares: 5, 98884→4, 78159 ms; WebGL update médio comparável caiu34% | +106.665 bytes(104,2 KiB) por mar ativo; erro exato0 em 97.354 componentes×10 amostras,29 malhas/83.836 triângulos iguais; snapshot acrescentou normais sem retirar posições/instâncias |
| Instancing de blocos B11 | Cerca20–22% menos submissões GL/render nas janelas finais | Pode alterar seleção/sombras/culling/normais; revisar câmeras/seleção e medir GPU em aparelhos físicos antes de generalizar |

## Peso dos artefatos

Mesmo Node gzip padrão, mesma máquina; somente JS, sem HTML/CSS/public/harness. Inicial inclui preloads.

| JS | Original bytes/gzip | Final241 bytes/gzip |
|---|---: |---: |
| Inicial+preloads |966.597/260.238|977.676/265.827|
| Todos os chunks |1.114.938/316.602|1.170.793/337.919|

O principal final isolado tem597.989 bytes/164.737gzip, mas omite preloads377.980+1.707 bytes. O peso inicial aumentou; não alegar redução de carregamento por chunk isolado. Arquivo comparável: TEMP/sud-audit72/shortcut-final-size-comparison.json.

## Próximos testes manuais

1. Em Android e iPhone reais, repetir escolha de história, texto, teclado virtual, barras móveis, orientação, toque e saída do canvas.
2. Com leitor de tela, verificar nomes/ordem/retorno de foco, diálogos e alternativa textual.
3. Em navegador que suporte zoom nativo, testar 200% com canvas focado; depois ocultar realmente a aba e registrar visibilitychange/tempo ao retornar.
4. Reproduzir continuamente contatos/transições críticos e todas as fases narrativas; snapshots não certificam intervalos.
5. Medir carga fria/quente, GPU ativa, energia/temperatura e retenção de memória em aparelhos reais antes de ampliar conclusões de desempenho.

Esses limites não impedem registrar as verificações concluídas, mas impedem declarar conformidade ampla WCAG, fidelidade integral ou desempenho universal. Não há nova implementação pendente nesta entrega; próximos passos são validações manuais e melhorias opcionais com evidência.

Carregamento medido na final241: sceneReadyMs de 202–450 ms e loadEventEnd de 169–879 ms, no ambiente local instrumentado e com caches mistos. Não há comparação causal de carregamento; sceneReadyMs não representa o primeiro quadro apresentado pela GPU. O tamanho do JavaScript, isoladamente, também não prova lentidão.


