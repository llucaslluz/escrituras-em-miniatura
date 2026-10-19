# Verificações e limites — histórico da versão 1.0.0

A versão atual é 1.1.0. Consulte também `REDESIGN-1.1.md` para as novas verificações do visualizador imersivo e os 86 testes aprovados. O relatório abaixo preserva as medições e a curadoria da entrega inicial.

Revisão da entrega em 18 de outubro de 2026 (America/Sao_Paulo). Arquivos de exportação usam data/hora UTC explícita no manifesto.

## Ambiente e independência

- Criação, leitura e execução foram confirmadas com um script Node que escreveu um arquivo e leu seu conteúdo: `create/read/execute: OK`.
- Pasta nova: `escrituras-em-miniatura`. Identidade nova de hospedagem: `appgprj_6ad56ed77f7c81919aa38412c0bb3f18`. O site anterior não foi alterado ou reutilizado.
- Windows, PowerShell, Node.js 22.17.0, npm 10.9.2. A construção também é utilizável fora da plataforma.
- O helper inicial de instalação da plataforma falhou: `Error: Cannot find module 'C:\Users\lluca\Documents\ChatGPT\SUD 3d\escrituras-em-miniatura\node_modules\npm\bin\npm-prefix.js'` (também apontou `npm-cli.js`, `MODULE_NOT_FOUND`). A instalação foi concluída com `npm.cmd install --no-audit --no-fund`, gerando o lockfile. Não houve `environment_offline` ou `Environment is not connected`.

## Verificação automática executada

`npm test`: **79 testes aprovados, zero falhas**. A cópia da saída está em `docs/test-results.tap`.

- 72 IDs únicos, 32/20/10/10 por obra e exatamente 18 marcações da base anterior.
- Fontes HTTPS oficiais em português, dados essenciais e quatro momentos ordenados por episódio.
- Busca com e sem acentos, filtros e limites da navegação anterior/próxima dentro de cada obra.
- Exatamente 72 construtores correspondentes ao catálogo.
- Construção de cada cena, ação narrativa registrada, elementos selecionáveis e ambiente vivo.
- Animação em 0/4/8/12/16/24/32/45 segundos sem transformações não finitas.
- Retorno de 24 segundos a outros instantes e novamente a 24: mesmo estado, sem acúmulo por quadro.
- Liberação de todas as geometrias e materiais presentes na cena e remoção dos callbacks.
- Exatamente 16 pedras identificadas e individualmente iluminadas em M19.
- Oito trajetórias visíveis de M15 amostradas em 276 instantes a intervalos de 0,04 s: nenhuma interseção com a caixa espacial de Samuel.
- Separação das identidades de rei Noé, rei Benjamim e Néfi, discípulo de Cristo, em dados e modelos.

`npm run build`: construção estática concluída. O Vite informa que o chunk principal supera 500 kB minificados; o motor Three.js está incluído localmente (~242 kB comprimidos), e os construtores são separados por obra. Trata-se de aviso de tamanho, não falha de construção.

## Verificação no navegador executada

Navegador Chromium integrado do Codex, no Windows, servidor local HTTP, WebGL 2.

- **Todas as 72 cenas abertas e renderizadas**, com captura dos próprios dioramas. As capturas compõem as miniaturas locais da biblioteca. As cenas refinadas após a primeira rodada foram recapturadas.
- Inspeção visual dirigida: B17 Batismo, B11 Daniel, B28 Ceia, B29 Getsêmani, B30 Gólgota, M15 Samuel, D09 Plano de Salvação e P09 Primeira Visão. P09 foi inspecionada também em 29 s, com dois Personagens visíveis.
- Busca por “samuel” encontrou Samuel, o lamanita, e Davi/Golias pela passagem de 1 Samuel. Favorito foi guardado e permaneceu após recarregar o navegador.
- Filtros: 13 histórias no Antigo Testamento; filtro Novo Testamento + parábola retornou Bom Samaritano e Filho Pródigo; biblioteca do Livro de Mórmon retornou 20.
- Link direto de B17 abriu a história e suas vistas específicas. Repetir retornou a `0:00`; selecionar o quarto momento atualizou a legenda correspondente.
- **Pausa integral confirmada por pixels**: tempo permaneceu fixo e hashes de duas capturas do canvas foram idênticos, enquanto a velocidade podia ser ajustada sem retomar a cena.
- Seleção pela lista acessível de João Batista abriu papel, resumo, referência e história relacionada. As dez entradas de D09 abriram a explicação; Reino celestial mostrou sua referência específica e a nota de simbolismo.
- Tela cheia manteve o painel de reprodução dentro do elemento exibido. A caixa de reprodução terminou em y=934 dentro de uma viewport com altura 1000.
- Movimento reduzido abriu P09 em `0:00`, pausada, após navegação. Tamanho grande foi aplicado e persistido.
- Layout em **1440×1000** e **390×844**. Sem rolagem horizontal no início, biblioteca e visualizador móvel, inclusive com texto grande. Câmera adapta o campo de visão para telas estreitas.
- Foco da busca e cores secundárias foram revisados; o link para pular conteúdo foi separado do roteador. Seleção/rótulos filtram ancestrais invisíveis.
- Sem erros relevantes de aplicação na rodada final do console. Um aviso antigo de `PCFSoftShadowMap` da fase de desenvolvimento foi corrigido para o tipo suportado `PCFShadowMap`.

### Amostra de desempenho medida

Cena B17 no destaque do início, viewport 1440×1000, qualidade média, Chromium integrado no Windows: uma janela de cerca de 2 segundos do contador de `requestAnimationFrame` registrou **92,7 quadros/s**, 1.642 chamadas de desenho e 210.824 triângulos (incluindo passagem de sombras). A resolução usa o limite de pixel ratio 1,5 da qualidade média. Esta é uma amostra local de uma cena, sem medição de percentis ou desempenho sustentado de todo o catálogo. Não deve ser interpretada como promessa de taxa em outros computadores ou em telefone físico.

## Distribuição

- `dist/` incluído no ZIP, com scripts, estilos, favicon e 72 JPGs locais.
- Manifesto de exportação lista versão, data UTC, arquivos, tamanhos e hashes. O arquivo SHA-256 externo corresponde ao ZIP completo.
- `scripts/export.py` executa o teste CRC de todas as entradas do ZIP. A entrega foi extraída em diretório limpo para `npm ci`, testes e nova construção; o resultado desta conferência acompanha a entrega.
- Excluídos: credenciais, tokens, valores privados de ambiente, `node_modules`, Git, caches, logs e capturas temporárias.

## Limites explícitos

- Não foi realizado teste em telefone físico, Safari/iOS ou Firefox. A viewport móvel foi emulada no mesmo computador.
- As 72 cenas tiveram abertura/captura e verificações de estado, mas não uma revisão humana exaustiva de cada quadro, objeto e ângulo ao longo de todos os 32 segundos de cada episódio.
- O fallback sem WebGL foi implementado e revisado por código; o navegador disponível tinha WebGL, portanto não foi executado um teste em hardware sem esse recurso.
- Arte estilizada procedural. Não são digitalizações de bonecos físicos. Não há áudio nesta edição.
- Datas antigas são aproximadas ou explicitamente indefinidas. Visões e diagramas são identificados como representações artísticas/simbólicas. A curadoria registra decisões e links consultados; não pretende resolver divergências de interpretação, cronologia ou arqueologia.
- Leitura das fontes oficiais exige internet; os dioramas e a interface construída usam recursos locais.
