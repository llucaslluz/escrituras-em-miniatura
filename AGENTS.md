# Escrituras em Miniatura — equipe de desenvolvimento

## Objetivo e contexto

Experiência em português do Brasil para explorar 72 histórias em dioramas 3D.
Priorize uma navegação clara, agradável e acessível no celular, preservando o
conteúdo, a identidade artística e os recursos existentes.

Stack atual: JavaScript ESM sem framework, Vite 8.3.4 e Three.js 0.186.1.
`src/main.js` contém rotas por hash e interações; `src/ui/` contém painéis;
`src/style.css` e `src/immersive.css` contêm layout; `src/data/` contém catálogo
e editoriais; `src/engine/` e `src/scenes/` contêm o 3D. Estado em `src/storage.js`.
Leia README, `docs/engine-api.md` e os documentos da tarefa antes de alterar contratos.

## Início e preservação

- Execute comandos nesta raiz Git, não no Git externo de `SUD 3d`.
- Comece por `git status --short --branch` e pelos diffs dos arquivos da tarefa.
  Há alterações locais anteriores à equipe; preserve-as. A lista da inspeção
  está em `docs/equipe-ia/DIAGNOSTICO-2026-11-02.md`, mas o status atual prevalece.
- Não faça reset, clean, checkout de arquivos, exclusões, commits, publicação
  ou regeneração de entregas sem escopo que autorize a ação. Nunca use a build
  para substituir trabalho de origem.
- A configuração inicial da equipe cobre documentação e agentes. As correções
  do site descritas no plano ficam para uma tarefa de implementação.
- Não exiba credenciais nem envie arquivos a serviços externos por iniciativa própria.

## Equipe e coordenação

O chat principal atua como orquestrador. Configurações em `.codex/agents/`:

| Agente | Responsabilidade |
| --- | --- |
| `sud_orquestrador` | Escopo, arquitetura, tarefas, integração e síntese das evidências. |
| `sud_ux_mobile` | Jornadas, hierarquia, legibilidade, gestos e navegação móvel. |
| `sud_frontend` | Implementação incremental de interface e integração com o 3D. |
| `sud_acessibilidade` | Semântica, foco, teclado, texto, movimento e alternativas ao 3D. |
| `sud_qa` | Regressões de fluxos, testes automatizados e evidências em resoluções móveis. |
| `sud_desempenho` | Carga inicial, GPU, memória e fluidez medidas em dispositivos. |

Delegue trabalho independente em paralelo quando houver benefício. Use no máximo
três subagentes simultâneos nesta configuração; os seis papéis podem trabalhar
em etapas. Não delegue o mesmo trabalho ao orquestrador e a outro coordenador.
Cada tarefa deve informar objetivo, escopo de arquivos, permissão de escrita,
critérios de aceite e formato de devolução. Um único editor por arquivo;
revisores trabalham sem editar por padrão. Aguarde e consolide os resultados.
Se um agente personalizado não estiver disponível, leia seu TOML e use as mesmas
instruções com um subagente disponível, ou execute os papéis em sequência.
Não afirme execução paralela ou testes que não aconteceram.

## Padrões de produto

- Mobile-first: confira 320×568, 360×800, 390×844, 412×915 e 844×390,
  além de tablet/desktop. Matriz e fluxos em `docs/equipe-ia/MATRIZ-MOBILE.md`.
- Evite cortes, rolagem horizontal da página e controles cobertos pelo teclado,
  barras do navegador ou áreas seguras. Verifique texto a 200% e títulos longos.
- Use alvos de toque de 44×44 CSS px como meta de conforto. Avalie controles
  menores com espaçamento e contexto; não trate essa meta como prova de conformidade.
- Prefira HTML nativo, nomes acessíveis, foco visível, estados de expansão corretos,
  Escape e retorno de foco coerentes. Meta de qualidade: WCAG 2.2 AA; não declare
  conformidade apenas com testes automáticos. Preserve leitura e uso sem WebGL.
- Respeite movimento reduzido e pausa. Texto, personagens e referências precisam
  continuar acessíveis sem interação precisa com o canvas.
- Preserve rotas `#historia/ID`, biblioteca/filtros, favoritos, histórico e chave de
  armazenamento. Não mude textos doutrinários/fontes como efeito colateral de UI.
- Preserve animação determinística por tempo, pausa, busca temporal e loop;
  importação de cenas por obra; descarte de recursos/listeners ao trocar de cena.
- Meça antes de otimizar. Compare build/carga fria, CPU/GPU, troca de cenas e memória
  sob condições registradas. Não prometa FPS ou ganhos sem medição comparável.

## Executar e verificar

Node 22.12+; dependências já instaladas na inspeção. Use o lockfile. `npm ci` é
para instalação limpa, não um passo obrigatório de toda tarefa.

- `npm run dev`: servidor local em 127.0.0.1, porta padrão 5173.
- `npm test`: testes de lógica/3D via node:test; não testa layout de navegador.
- `npm run build`: constrói e substitui `dist/` (gerado).
- `npm run preview`: serve `dist/`, normalmente na porta 4173.
- `npm run verify`: confere miniaturas/arquivos e escreve `artifacts/inventory.json`;
  exige `dist/index.html`. Não é uma verificação de acessibilidade nem de UX.
- `npm run export`: sobrescreve manifesto e pacotes em `../entrega/`; não use
  como teste. Publicação também exige tarefa que a autorize.

Execute testes adequados às mudanças. Para JS/3D, rode a suíte existente e a build;
para UI, inclua navegação em navegador e a matriz móvel pertinente. Não acrescente
testes que apenas repitam a implementação. Se precisar de nova ferramenta ou
dependência, explique seu propósito e mantenha a alteração dentro do escopo.
Quando só editar documentação/configuração, valide os arquivos e a descoberta
dos agentes; não é necessário repetir toda a suíte sem outra mudança.

## Entrega

Reporte resultado, arquivos alterados, testes com condições e limitações.
Separe problemas reproduzidos, achados estáticos e hipóteses a medir. Diga
explicitamente quando faltou navegador, iOS/Android físico ou leitor de tela.
O guia de uso e os prompts estão em `docs/equipe-ia/README.md` e `PROMPTS.md`.
