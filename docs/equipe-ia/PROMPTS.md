# Pedidos prontos para usar no Codex

Abra a pasta interna do aplicativo e use um pedido por tarefa. O `AGENTS.md`
complementa estas instruções. Leia o diagnóstico e o plano antes de implementar.

## 1. Diagnóstico móvel com especialistas

```text
Atue como orquestrador do SUD 3D e leia AGENTS.md e docs/equipe-ia/README.md.
Confira o Git atual e preserve todas as alterações locais.
Quero um diagnóstico da experiência no celular, sem alterar o site.
Delegue análises independentes para sud_ux_mobile, sud_acessibilidade e sud_qa,
respeitando o máximo de três subagentes simultâneos. Em seguida, use
sud_desempenho para medir ou planejar a medição dos principais gargalos.
Use docs/equipe-ia/MATRIZ-MOBILE.md. Não instale ferramentas nem publique.
Peça a cada agente evidências, fluxo afetado, prioridade e critérios de aceite.
Aguarde os resultados e apresente uma lista única, separando problemas
reproduzidos, achados estáticos e pontos ainda não testados.
```

## 2. Primeiro lote de implementação

```text
Leia AGENTS.md e o diagnóstico atual. Confira os diffs existentes antes de editar.
Implemente somente duas correções de acessibilidade, se ainda forem necessárias:
dar nome acessível ao diálogo de preferências e completar o estado inicial e a
relação do botão de menu móvel com seu painel.
Você coordena; delegue a sud_frontend a implementação mínima em src/main.js.
Esse arquivo já tem trabalho local: preserve-o e não refatore o restante.
Peça revisão sem edição a sud_acessibilidade e validação a sud_qa após a mudança.
Verifique teclado, abrir/fechar, foco, navegação, 360x800 e 390x844; rode os testes
adequados e a build. Se não houver navegador disponível, registre essa lacuna.
Não altere textos das histórias, dependências, cenas 3D ou pacotes de entrega.
Entregue o comportamento final, os arquivos e as evidências, sem publicar.
```

## 3. Melhorar uma jornada no celular

```text
Leia AGENTS.md e o plano. Quero melhorar a jornada de escolher uma história e
ajustar a cena no celular. Primeiro use sud_ux_mobile para mostrar os problemas
reproduzidos e uma proposta incremental com critérios de aceite.
Use sud_acessibilidade para revisar a proposta e sud_qa para preparar os cenários.
Não modifique o site neste primeiro pedido; entregue a proposta e os arquivos
que precisariam mudar, com atenção a texto, toque, paisagem e teclado virtual.
```

## 4. Medir desempenho antes de otimizar

```text
Use sud_desempenho para estabelecer uma linha de base do visualizador.
Leia AGENTS.md e a matriz móvel. Compare carga fria, pausa, aba oculta e trocas
repetidas de cenas sob condições registradas, incluindo qualidade baixa.
Investigue tamanho inicial, RAF pausado, preserveDrawingBuffer e recursos de GPU.
Não altere código nesta medição. Separe métricas reais de hipóteses; se faltar
telefone físico ou ferramenta, entregue um procedimento reproduzível e registre
o que não foi executado. Não publique nem execute export.
```

## 5. Um especialista específico

```text
Use sud_acessibilidade para revisar somente os diálogos e painéis da interface.
Leia AGENTS.md. Trabalhe sem editar. Verifique nomes, foco, teclado, Escape,
estado de expansão e leitura com texto ampliado. Devolva achados com elemento,
arquivo/linha, impacto e passos para reproduzir. Declare o que não foi testado.
```

## Se os agentes personalizados não aparecerem

```text
Leia AGENTS.md e os arquivos .codex/agents/sud_*.toml deste aplicativo.
Use as instruções de cada arquivo como papéis de trabalho. Se houver delegação,
crie subagentes disponíveis com essas instruções e tarefas independentes;
se não houver, execute os papéis em sequência no chat principal.
Mantenha um único editor por arquivo. Informe qual modo foi realmente usado.
```

Para outra tarefa, informe sempre: resultado desejado, telas/arquivos permitidos,
o que conta como concluído e se o pedido é análise ou implementação. Não é
necessário chamar os seis especialistas em toda mudança pequena.
