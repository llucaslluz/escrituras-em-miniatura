# Dependências e recursos externos

## Produção

| Recurso | Versão/origem | Licença | Uso |
| --- | --- | --- | --- |
| Three.js | 0.186.1, npm `three` | MIT | WebGL, materiais, geometrias, luzes e OrbitControls |
| Arte procedural | `src/engine/kit.js` e `src/scenes/` | MIT do projeto | Modelos, fibras de feltro, costuras, cenários, água, fogo e animação |
| Ícones | `src/icons.js`, originais em SVG | MIT do projeto | Interface |
| Miniaturas | Capturas dos 72 dioramas, incluídas localmente | MIT do projeto | Biblioteca |
| Tipografia | Georgia, Segoe UI, fontes do sistema | Licença do sistema operacional | Texto, sem downloads de fontes |

## Desenvolvimento

Vite 8.3.4 (MIT), com dependências transitivas e suas versões registradas em `package-lock.json`. Node.js 22.12+ e npm. Os testes usam `node:test` e `node:assert`, sem framework externo. Python 3.10+ (biblioteca padrão) é opcional para exportar ZIP. Pillow é opcional apenas para recomprimir novas capturas; os JPGs finais já estão incluídos e não exigem Python/Pillow na instalação, construção ou execução.

Licenças de terceiros distribuídas em `docs/licenses/` a partir das cópias instaladas do Three.js e Vite. O lockfile permite inspecionar dependências transitivas.

## Rede

- `npm ci` acessa o registro npm durante a primeira instalação (ou utiliza o cache local).
- A aplicação construída carrega seus scripts, imagens e estilos somente da própria hospedagem. Não depende de APIs, CDNs, serviços privados da plataforma ou contas.
- Os botões de fontes abrem as passagens oficiais em `www.churchofjesuschrist.org`, em outra aba, com `noopener noreferrer`. A internet é necessária apenas para consultar esses textos externos.
- A hospedagem Sites é independente da execução local. O ZIP pode ser publicado em outro servidor estático.
- Favoritos/histórico/preferências ficam no navegador; não são enviados a um backend.

Projeto independente; não é publicação oficial de A Igreja de Jesus Cristo dos Santos dos Últimos Dias. Os resumos são próprios. O texto integral das escrituras não está redistribuído.
