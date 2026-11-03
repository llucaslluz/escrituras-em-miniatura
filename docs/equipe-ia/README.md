# Sua equipe de IA para o SUD 3D

Configurada em 2 de novembro de 2026 para desenvolver o **Escrituras em Miniatura**
com prioridade para o celular. Esta etapa acrescenta instruções e planejamento;
preserva o código e as alterações locais anteriores do site.

## Começar no Codex

1. Abra a pasta `C:\Users\lluca\Documents\ChatGPT\SUD 3d\escrituras-em-miniatura`
   como projeto/pasta de trabalho no Codex. Ela é o repositório do aplicativo.
2. Inicie um novo chat nessa pasta para carregar as instruções e os agentes.
3. Copie um dos pedidos de [PROMPTS.md](PROMPTS.md). Comece pelo diagnóstico móvel
   ou por uma tarefa pequena do [plano](PLANO.md).
4. O chat principal coordena, delega o que for independente e reúne os resultados.
   Para acompanhar um especialista, abra sua atividade de subagente no chat.

Se começar pelo projeto externo `SUD 3d`, o `AGENTS.md` externo aponta para o app.
Os agentes personalizados ficam na pasta interna; abra-a diretamente para usar
os nomes nativos. O guia também contém prompts que funcionam com papéis em
sequência ou com subagentes genéricos, se o cliente não carregar os personalizados.

## Quem faz o quê

| Papel / nome nativo | Resultado esperado |
| --- | --- |
| Orquestrador — `sud_orquestrador` | Plano, distribuição dos arquivos, integração e resumo. O chat principal normalmente cumpre esse papel. |
| UX/UI mobile — `sud_ux_mobile` | Jornadas e propostas visuais claras, confortáveis e verificáveis no celular. |
| Frontend — `sud_frontend` | Mudanças pequenas em JavaScript/CSS com integração segura ao 3D. |
| Acessibilidade — `sud_acessibilidade` | Revisão de teclado, foco, nomes, leitura, texto ampliado e movimento reduzido. |
| Testes/QA — `sud_qa` | Casos reproduzíveis, regressões e evidências por tela/navegador. |
| Desempenho — `sud_desempenho` | Medições e otimizações de carga, GPU e memória, preservando a arte. |

Os seis são papéis disponíveis, usados conforme a tarefa. Eles não ficam rodando
permanentemente. O limite local é de **três subagentes simultâneos**, além do chat
principal, para reduzir conflitos e consumo. A delegação pode usar mais tokens.

UX, acessibilidade, QA e desempenho começam em leitura/análise. O frontend edita
apenas dentro da tarefa de implementação. Um único agente edita cada arquivo.
As instruções de leitura são acordos de trabalho; as permissões técnicas são
herdadas da sessão principal.

## Onde está a configuração

- `AGENTS.md`: contexto do projeto, segurança do trabalho e padrões de qualidade.
- `.codex/config.toml`: habilita agentes e limita concorrência a três.
- `.codex/agents/sud_*.toml`: seis definições nativas, com nome, descrição e instruções.
- Esta pasta: diagnóstico, plano, matriz móvel e prompts prontos.

Modelo e nível de raciocínio são herdados do chat principal. Não há modelo fixo,
chaves de API, serviços novos ou dependências adicionais nesta configuração.
Foi acrescentado apenas o registro de confiança desta pasta interna em
`C:\Users\lluca\.codex\config.toml`, pois a pasta externa já era confiável e
o Codex bloqueava a configuração do repositório interno. A comparação confirmou
que todas as demais opções globais foram preservadas. Isso permite carregar os
perfis locais; não muda o modo de execução, o modelo ou as integrações.

## O que foi verificado

- Executável local: **codex-cli 0.166.0-alpha.5.1**. Essa é a versão do mecanismo
  consultado; não é uma afirmação sobre o número de versão da interface desktop.
- TOML validado e configuração aceita pelo modo estrito do executável local.
  A configuração efetiva confirmou agentes habilitados, concorrência três e
  camada do projeto ativa, sem bloqueio de confiança.
- Contexto de inicialização renderizado localmente para conferir o `AGENTS.md`
  e as definições personalizadas, sem disparar uma tarefa de modelo.
- Na inspeção, três subagentes fizeram análises paralelas. Isso comprova a
  delegação nesta sessão; não significa que os seis perfis novos já executaram tarefas.
- Baseline do aplicativo: **127 testes passaram**; build em pasta temporária
  externa passou e avisou sobre o tamanho do JavaScript inicial.
- Não foram realizados testes de navegador, leitor de tela ou telefone físico
  nesta configuração. Consulte o [diagnóstico](DIAGNOSTICO-2026-11-02.md).

Os formatos usados seguem a documentação oficial de
[subagentes personalizados](https://learn.chatgpt.com/docs/agent-configuration/subagents)
e [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
Se o Codex for atualizado, confira a descoberta dos perfis antes de mudar o formato.

## Próxima tarefa recomendada — atualização de direção visual

O usuário relatou a conclusão dos lotes de semântica/controles e leitura ampliada,
além de ensaios parciais de desempenho. Preserve esse trabalho. A configuração
inicial e seu baseline, descritos acima, permanecem como registro histórico.

A próxima prioridade é refinar a qualidade visual e as animações, usando as
duas referências fornecidas pelo usuário. Leia [DIRECAO-ARTE-3D.md](DIRECAO-ARTE-3D.md)
e o [plano atualizado](PLANO.md): comece por **B11 — Daniel na cova dos leões** e
depois **B05 — A travessia do Mar Vermelho**, mantendo as interações e validando
o custo no celular. As referências estão guardadas na subpasta `referencias/`.

Esta atualização documenta a nova direção; não altera as cenas. Zoom nativo,
segundo plano real e dispositivos físicos continuam como pendências de QA,
conforme os relatos trazidos pelo usuário.
