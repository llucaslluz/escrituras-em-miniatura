# Escrituras em Miniatura

**Histórias de fé em movimento — versão 2.0.0**

Aplicação independente em português do Brasil, com **72 dioramas 3D procedurais**: Bíblia (32), Livro de Mórmon (20), Doutrina e Convênios (10) e Pérola de Grande Valor (10). Reconstruída do zero. Não recupera a fonte de “Gólgota em Miniatura” nem altera seu site ou identificador.

As 72 cenas usam uma direção de arte inspirada em **claymation**: personagens chibi, formas arredondadas, textura de massinha, cores pastel e iluminação suave de estúdio. São cenas interativas renderizadas em tempo real com Three.js. A câmera geral reduz a distorção de perspectiva para aproximar a aparência de uma miniatura isométrica; a lente aplica um tilt-shift discreto conforme a profundidade, sem desfocar os textos da interface.

## Executar

Requisitos: Node.js 22.12 ou superior, npm e um navegador com WebGL 2. O ambiente de desenvolvimento usado tinha Node 22.17.0 e npm 10.9.2. Não há variáveis de ambiente, contas, chaves, banco de dados ou serviços privados obrigatórios.

```sh
npm ci
npm run dev
```

Abra o endereço Local impresso pelo Vite. Por padrão, `http://127.0.0.1:5173`.

## Verificar, construir e servir

```sh
npm test
npm run build
npm run verify
npm run preview
```

`npm run preview` serve a construção em `http://127.0.0.1:4173`. O ZIP também inclui `dist/` pronto. É possível servir essa pasta sem instalar dependências:

```sh
node scripts/serve.mjs
```

Não abra `index.html` por `file://`: módulos JavaScript exigem um servidor HTTP. Para hospedar em outro provedor, publique o conteúdo de `dist/` na raiz do domínio. A navegação por hash dispensa regras especiais de reescrita. Exemplo de link estável: `/#historia/B17`.

## Experiência

- Início direto em uma experiência imersiva que ocupa a viewport inteira, com a última história visitada ou o Batismo.
- Botão central “Histórias” abre as quatro obras, seleção das histórias e anterior/próxima dentro da obra. O menu fecha depois da escolha.
- A apresentação da história permanece em texto na lateral, com título, contexto, ensinamento doutrinário próprio e referência. Os menus e painéis de controles começam recolhidos. “Seu olhar” abre a exploração: enquadramento, zoom, nomes, animação, repetição contínua e luz da história/manhã/entardecer/noite. A luz de exploração é artística e não altera o relato.
- A apresentação editorial anterior continua em `/#apresentacao`; biblioteca, linha do tempo, personagens e fontes permanecem no menu do projeto.
- Biblioteca com busca insensível a acentos, filtros por obra/tipo e testamentos da Bíblia.
- Visualizador com giro por arraste/toque, zoom, restauração, vistas específicas, pausa, repetição, velocidade, progresso e quatro momentos narrativos.
- Seleção de personagens/objetos no 3D e alternativa por lista acessível; referências e histórias relacionadas.
- Linha do tempo com épocas aproximadas; galeria de personagens; fontes e proposta artística.
- Favoritos, histórico, continuação da última cena e preferências no armazenamento deste navegador.
- Movimento reduzido (inclui a preferência inicial do sistema), três qualidades gráficas e três tamanhos de texto.
- Tela cheia inclui os controles de reprodução. Fallback textual quando WebGL 2 não está disponível.
- Sem áudio nesta edição. Nenhum recurso de áudio é simulado ou reproduzido automaticamente.

**Câmera pelo teclado:** focalize o diorama e use as setas para girar/inclinar e `+` / `−` para aproximar/afastar. Todos os controles também são botões e seletores nativos. A pausa congela o tempo compartilhado de personagens, água, tecidos, partículas e luzes; a câmera continua manualmente ajustável. Todas as cenas repetem a narrativa de 32 segundos continuamente por padrão. Em **Seu olhar → Repetir em loop**, é possível desligar a repetição; nesse caso, a ação narrativa termina e o ambiente continua vivo até ser pausado. A escolha fica salva entre histórias. Movimento reduzido mantém a cena inicialmente pausada.

## Organização

```text
src/
  main.js                 telas, navegação e interações
  ui/immersive.js          composição do visualizador em tela inteira
  ui/scene-panels.js       abertura e fechamento dos painéis compactos
  ui/scene-copy.js         ajuste e fluxo da coluna de apresentação
  immersive.css            painéis flutuantes e layout móvel imersivo
  style.css, print.css    apresentação responsiva, foco e impressão
  storage.js              preferências, favoritos, histórico e continuação
  icons.js                ícones SVG locais
  data/                   catálogo, personagens derivados e fontes por obra
  data/editorial.js       72 ensinamentos próprios com versículos de apoio
  data/editorial/         textos autorais por obra
  engine/kit.js           API compartilhada, terreno e animações comuns
  engine/clay-style.js    materiais de massinha, formas e base arredondada
  engine/clay-people.js   personagens chibi articulados
  engine/clay-animals.js  animais de massinha e aves articuladas
  engine/clay-studio.js   luzes suaves e lente de miniatura por qualidade
  engine/viewer.js        renderer, câmera, seleção e ciclo de vida
  scenes/bible.js         32 composições e ações bíblicas
  scenes/mormon.js        agregador dos 20 episódios do Livro de Mórmon
  scenes/mormon/          jornadas, comunidades e testemunhos
  scenes/dc.js            10 cenas de Doutrina e Convênios
  scenes/pearl.js         10 cenas da Pérola de Grande Valor
public/thumbnails/        72 capturas reais dos próprios dioramas
tests/                    verificações do catálogo, animação e regressões
docs/                     inventário, curadoria, dependências e relatório
dist/                     versão estática construída (no ZIP)
```

Uma cena é construída somente quando selecionada. Os módulos de código são importados por obra; as 72 geometrias não são mantidas simultaneamente. Ao trocar de tela, o visualizador cancela seu ciclo, remove os observadores/listeners, libera geometrias, materiais, sombras e recursos da lente, e destrói o contexto anterior. A textura procedural compartilhada é reutilizada. A qualidade baixa e dispositivos sem suporte ao alvo HDR usam a renderização direta, preservando a interação e as cores.

### Adicionar uma história

1. Acrescente metadados com ID único ao arquivo da obra em `src/data/`.
2. Acrescente seu construtor ao módulo de cenas correspondente e ao `builders` exportado.
3. Defina composição própria, personagens/objetos, ação narrativa determinística, reações, ambiente e quatro momentos de 20–40 segundos.
4. Use os métodos de `Kit` descritos em `docs/engine-api.md`. Todos os movimentos devem depender do tempo recebido, sem `Date.now()`, timers independentes ou acúmulo por quadro.
5. Confira as fontes oficiais e registre decisões em `docs/curation-*.md`.
6. Abra `/?capture=ID` para enquadrar a captura em 22 segundos (ou `/?capture=P09&t=29` para escolher outro instante); use a imagem do canvas 800×600 como miniatura. `scripts/thumbnails.py` comprime capturas de desenvolvimento com Pillow (opcional, não necessário para executar ou construir).
7. Atualize as contagens e os testes do catálogo, capture a miniatura e execute as verificações.

## Fontes, créditos e limites

O índice oficial é <https://www.churchofjesuschrist.org/study/scriptures?lang=por>. Cada história contém links para suas passagens. Resumos e legendas são originais; não há reprodução extensa do texto das escrituras. As composições são artísticas, e as visões/etapas doutrinárias não descrevem posições físicas literais.

Modelos, texturas de plasticina, detalhes do terreno, água, animais, roupas e iluminação são produzidos por código incluído. Não há modelos, imagens ou fontes tipográficas remotas. Fontes do sistema variam conforme o computador. Three.js e Vite são MIT; consulte `docs/DEPENDENCIAS.md` e `LICENSE`.

As miniaturas são estilizadas e procedurais, não digitalizações de bonecos físicos. O relatório `docs/VERIFICACOES.md` distingue verificações automáticas, inspeção visual e limitações. A qualidade/performance em um telefone físico deve ser avaliada nesse dispositivo; uma viewport móvel no computador não substitui esse teste.

## Exportar novamente

Com Python 3.10+ disponível e após construir:

```sh
python scripts/export.py
```

O script gera ZIP, manifesto e SHA-256 em `../entrega/`, testa o CRC de todas as entradas e exclui dependências instaladas, Git, caches, logs, segredos e arquivos temporários. O ZIP contém fonte, recursos locais, testes, documentação, dependências travadas e `dist/`. O arquivo `.openai/hosting.json` é metadado público da nova hospedagem; não contém credenciais e pode ser ignorado por outros provedores.

A versão 1.2.0 corrige a sobreposição de títulos longos e acrescenta repetição contínua por padrão. Ver [docs/CORRECOES-1.2.md](docs/CORRECOES-1.2.md).

A versão 1.3.0 recolhe menus, textos e controles em botões. Os painéis fecham após uma escolha, com Esc ou ao clicar fora. Os textos da história ficam em “Sobre a cena”. Ver [docs/PAINEIS-1.3.md](docs/PAINEIS-1.3.md).

A versão 1.3.1 restaura os textos editoriais na estrutura da cena, preservando os botões e o fechamento automático dos menus. Em telas curtas, a coluna de texto pode ser rolada sem esconder a descrição, o convite dos personagens ou a referência.

Detalhes desta restauração e validação: [docs/TEXTOS-1.3.1.md](docs/TEXTOS-1.3.1.md).

A versão 1.4.0 substitui a chamada repetida por 72 ensinamentos doutrinários próprios, com versículos de apoio e links oficiais. A lateral e “Sobre a cena” exibem o mesmo conteúdo específico. Curadoria e verificação: [docs/DOUTRINA-1.4.md](docs/DOUTRINA-1.4.md).

A versão 2.0.0 aplica a direção de arte de massinha às 72 cenas, com personagens chibi, animais remodelados, materiais de plasticina, base e objetos arredondados, iluminação de estúdio e lente de miniatura. O catálogo, as referências, os ensinamentos específicos e os controles de reprodução permanecem disponíveis. Detalhes: [docs/MASSINHA-2.0.md](docs/MASSINHA-2.0.md).
