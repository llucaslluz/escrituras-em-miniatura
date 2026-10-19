# API compartilhada das cenas — 2.0.0

Cada módulo exporta `builders = { B01(k) { ... }, ... }`. O argumento `k` é um `Kit` com uma base circular de massinha de raio 6. O eixo vertical é `y`, `x` é horizontal e `z` representa profundidade. Um personagem adulto sem escala tem aproximadamente 1,75 unidade de altura. A direção de arte é claymation, com renderização Three.js em tempo real.

## Personagens e animação

`k.person(name, x, z, options)` retorna `root`, `head`, `robe`, `leftArm`, `rightArm`, `leftForearm`, `rightForearm`, `leftLeg`, `rightLeg`, `handL` e `handR`. As opções incluem `y`, `robe`, `mantle`, `hair`, `skin`, `scale`, `beard`, `rotation` e `eyesClosed`. A figura chibi conserva os pivôs usados pelas animações: cabeça em `y=1.37`, ombros em `y=1.08`, cotovelo a 0,31 unidade do ombro e mão a 0,27 do cotovelo. Os braços inicialmente apontam para baixo. `k.people` reúne os rigs.

`k.animate((t, p) => {})` registra a ação narrativa. `t` é o tempo em segundos, limitado à duração da história, e `p` é sua fração. `k.ambient((t, p) => {})` recebe o mesmo relógio, mas pode continuar depois do fim quando a repetição estiver desligada. A pausa congela ambos.

Todas as histórias repetem continuamente por padrão. Ao atingir 32 segundos, o relógio volta ao início, preservando o restante do quadro. Se a pessoa desliga a repetição, a narrativa mantém seu estado final enquanto o ambiente continua. Toda transformação deve ser calculada a partir de `t`/`p`, sem `Date.now()`, timers próprios ou incrementos acumulados por quadro. Assim, busca, retorno e repetição recuperam o mesmo estado.

`k.walk(rig, [x,z], [x,z], start, end)` anima deslocamento e passos. Objetos podem ser presos a `handL`/`handR` com `attach` ou `add` e posições locais. Mantenha cenário, ação principal, reações e quatro momentos específicos para cada episódio.

## Objetos, materiais e terreno

Os métodos adicionam o resultado a `k.group`, salvo quando recebem outro pai:

- `k.box(w,h,d,color,x,y,z)`, `k.sphere(radius,color,x,y,z)`, `k.cylinder(radius,height,color,x,y,z)` e `k.rock(x,z,scale)` retornam meshes. Caixas e rochas passam pela conversão de formas arredondadas de `clay-style.js`, mantendo as dimensões de composição.
- `k.mat(color,options={})` retorna um `MeshPhysicalMaterial` compartilhado por cor/opções, com textura procedural de plasticina, rugosidade e acabamento suave. `k.mesh(geometry,material,x=0,y=0,z=0,parent=k.group)` cria e adiciona um mesh. Não descarte manualmente uma geometria ou material compartilhado durante a animação.
- `k.groupAt(x=0,y=0,z=0)` e `k.add(object)` retornam o grupo/objeto adicionado.
- `k.tree(x,z,scale=1,kind='olive')` cria árvore animada; `kind='palm'` cria palmeira.
- `k.water(width,length,x=0,z=0,options={})` cria água deformável e corrente. Opções: `river`, `color`, `y`.
- `k.animal(kind,x,z,scale=1)` oferece leão, ovelha, jumento, peixe e ave. `k.dove(x,y,z)` cria ave articulada. Os modelos de massinha e seus movimentos ficam em `clay-animals.js`.
- `k.fire(x,y,z,scale=1)`, `k.cloud(x,y,z,scale=1)`, `k.lamp(x,y,z)` e `k.boat(x,z,scale=1)` criam elementos com movimento ambiente.
- `k.ray(x,y,z,height=5)` cria um feixe quente translúcido de bordas suaves; `k.stars()` cria pontos celestes determinísticos.
- `k.flag(x,y,z,color)`, `k.book(x,y,z)`, `k.plates(x,y,z)`, `k.basket(x,y,z)`, `k.vase(x,y,z)` e `k.table(x,y,z,width=4,depth=1.5)` criam os demais objetos compartilhados.

## Seleção, luz e câmera

`k.select(object,name,role,reference,summary)` registra uma seleção. Cada personagem já é selecionável. Use informações precisas para objetos específicos. `k.label(object,text)` registra o nome no modo de identificação.

`k.light` é a luz direcional principal; `k.fill`, o preenchimento hemisférico; `k.background`, a cor de fundo. A animação pode modificar essas propriedades. `AtmosphereController` restaura a luz autoral antes de avaliar cada instante e aplica o horário escolhido depois, preservando a escolha manual ao pausar, buscar ou repetir.

`k.config.night=true` ativa o ambiente noturno inicial. `k.config.ground='#hex'` define o terreno. `k.config.camera` e `k.config.target` aceitam vetores como arrays; `k.config.views=[{label,camera,target}, ...]` cria vistas próprias. `k.finish(config)` faz a mesclagem opcional. A câmera geral é afastada moderadamente, com campo de visão compensado, para reduzir a distorção da miniatura; vistas de detalhe conservam suas posições autorais.

Nas capturas e demais visualizadores fora da tela imersiva, a vista geral usa `camera-framing.js` para manter toda a base circular dentro de uma margem de 0,94 em coordenadas normalizadas. O cálculo considera somente a base de raio 6, entre `y=-0.55` e `y=0`, sem incluir estrelas, chuva ou efeitos distantes. Deriva da câmera e do alvo autorais, preservando o zoom manual posterior e as vistas de detalhe.

`clay-studio.js` acrescenta softboxes fria e quente, sombras suaves e uma composição leve de profundidade. A lente atua somente no canvas 3D. A interface HTML permanece nítida. A qualidade baixa e GPUs sem alvo HDR usam renderização direta; média/alta limitam a resolução do alvo e a quantidade de amostras. O visualizador libera recursos da lente, sombras e modelos ao trocar ou destruir a cena.

## Catálogo e conteúdo

Os arquivos `src/data/bible.js`, `mormon.js`, `dc.js` e `pearl.js` exportam as histórias. A forma principal é:

```js
{
 id:'B01', book:'bible', testament:'old',
 title, subtitle, reference, sources:[{label,url}], summary, theme, place,
 type:'relato', era, year, base:false,
 characters:[{name,role,description}],
 moments:[{at:0,title,caption},{at:8,title,caption},{at:16,title,caption},{at:24,title,caption}],
 artistic, accent:'#hex', duration:32
}
```

`book` aceita `bible`, `mormon`, `dc` ou `pearl`; `testament` só é necessário para a Bíblia. `type` distingue `relato`, `parábola`, `visão` e `doutrina`. Datas aproximadas devem ser identificadas como tais. Os 72 ensinamentos próprios e seus versículos de apoio ficam em `src/data/editorial/`, reunidos por `src/data/editorial.js`.

Verifique referências nas escrituras oficiais e registre decisões nos documentos `curation-*.md`. Preserve a distinção entre relato, interpretação artística e exposição doutrinária. Não é necessário reproduzir extensamente o texto das escrituras.
