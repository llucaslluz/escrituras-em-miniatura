# Correções — versão 1.2.0

## Textos da experiência imersiva

O título, a descrição e o convite dos personagens agora compartilham a mesma coluna, em fluxo vertical. O tamanho do título considera o texto realmente quebrado e a altura disponível. A nota decorativa e, quando necessário, o convite secundário cedem espaço ao título e à descrição. Em espaços extremos, a coluna admite rolagem e foco pelo teclado. Os textos completos permanecem em “Sobre a cena”. O espaço vazio da coluna continua permitindo arrastar o diorama.

O ajuste acompanha redimensionamento e preferências de texto. Observadores e quadros pendentes são liberados ao navegar para outra história.

## Repetição contínua

Todas as 72 cenas têm loop ativado por padrão. O fim da narrativa volta ao início, conservando a fração restante do quadro. O painel “Seu olhar” inclui “Repetir em loop”; a escolha é salva neste navegador e acompanha mudanças de história e recarregamentos. Ao desligar, a narrativa termina e o ambiente continua até a pausa geral. Pausa, velocidade, busca, rever e horário manual permanecem funcionais. Movimento reduzido mantém a reprodução inicialmente pausada.

## Verificação

- `npm test`: 94 testes aprovados, zero falhas. Oito novos testes cobrem limite exato, fração restante, velocidade, múltiplos ciclos, pausa, desligamento, busca, rever e preferências. As 72 cenas reais retornaram às transformações e luz iniciais, sem estado residual do ciclo anterior; o horário manual foi preservado.
- `npm run verify`: 72 histórias, contagens 32/20/10/10, nenhuma inconsistência.
- `npm run build`: construção concluída; permanece o aviso de tamanho do pacote principal Three.js.
- Navegador: todos os 72 títulos em 1440×900, sem colisão entre apresentação e personagens nem rolagem do texto. Mais 32 casos com B01/B03/B04/B07/B12/B17/B30/B31 em 1280×720, 1024×768, 390×844 e 320×740, também sem colisão.
- Texto extra grande: B01/B04/B12/B31 em 1920×827, 1280×720, 1024×768, 390×844, 320×740 e 740×390. Conferência adicional após reservar espaço para as descendentes em itálico.
- Interface real: loop desligado manteve tempo acima de 32 s e estado “O ambiente permanece”; trocar história e recarregar manteve a opção desligada. Com loop ligado, iniciar de 32 s reiniciou em 0,354 s. Pausa conservou 32,000 s; movimento reduzido indicou reprodução pausada.

Validação móvel por viewport no computador; sem nova medição de desempenho ou ensaio em dispositivo físico. Catálogo, cenas e dependências preservados nesta correção.
