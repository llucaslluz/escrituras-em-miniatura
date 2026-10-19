// Paráfrases autorais. Passagens conferidas na edição portuguesa oficial das
// escrituras em 19/10/2026; cada link destaca os versículos que sustentam o texto.
const source = (path, verses) => `https://www.churchofjesuschrist.org/study/scriptures/${path}?lang=por&id=${verses}#${verses.split('-')[0].split(',')[0]}`;

export const editorial = {
  B01: {
    title: 'Deus estabelece Seu convênio',
    text: 'Depois do dilúvio, Deus estabelece um convênio com Noé, seus descendentes e os seres viventes. O arco nas nuvens assinala Sua promessa de não voltar a destruir toda a vida pelas águas do dilúvio.',
    reference: 'Gênesis 9:8–16',
    url: source('ot/gen/9', 'p8-p16')
  },
  B02: {
    title: 'A prova e a provisão do Senhor',
    text: 'No monte, Abraão demonstra sua disposição de obedecer a Deus. O anjo o interrompe, Isaque é preservado e um carneiro é oferecido em seu lugar. A passagem une a prova da fé à provisão do Senhor.',
    reference: 'Gênesis 22:8–14',
    url: source('ot/gen/22', 'p8-p14')
  },
  B03: {
    title: 'O perdão se transforma em cuidado',
    text: 'José reconhece a ação de Deus na preservação de sua família e acolhe os irmãos que o venderam. A reconciliação ganha forma no abraço e na promessa de sustentá-los durante os anos de fome.',
    reference: 'Gênesis 45:4–11, 14–15',
    url: source('ot/gen/45', 'p4-p11,p14-p15')
  },
  B04: {
    title: 'Deus conhece as dores de Seu povo',
    text: 'Na sarça, o Senhor declara que vê a aflição de Israel e ouve seu clamor. Ao chamar Moisés para libertar o povo, promete estar com ele. A missão nasce do cuidado de Deus por quem sofre.',
    reference: 'Êxodo 3:7–12',
    url: source('ot/ex/3', 'p7-p12')
  },
  B05: {
    title: 'Confiar e seguir a orientação divina',
    text: 'Diante do mar, Moisés anuncia o livramento do Senhor, e o povo recebe a ordem de avançar. Deus abre a passagem; Israel a atravessa. Nesta libertação, confiar e agir acompanham a orientação recebida.',
    reference: 'Êxodo 14:13–16, 21–22',
    url: source('ot/ex/14', 'p13-p16,p21-p22')
  },
  B06: {
    title: 'A fidelidade orienta a vida diária',
    text: 'O Deus que libertou Israel ensina o povo a adorá-Lo e guardar Seus mandamentos. Honrar os pais, respeitar a vida e agir com honestidade fazem parte dessa responsabilidade diante de Deus e do próximo.',
    reference: 'Êxodo 20:2–17',
    url: source('ot/ex/20', 'p2-p17')
  },
  B07: {
    title: 'Obediência ao longo do caminho',
    text: 'Em Jericó, a orientação do Senhor exige marchar durante vários dias antes da queda da muralha. Josué e o povo seguem os passos recebidos. A sequência destaca uma obediência perseverante, dirigida por Deus.',
    reference: 'Josué 6:2–5, 20',
    url: source('ot/josh/6', 'p2-p5,p20')
  },
  B08: {
    title: 'Acolher também é viver a fé',
    text: 'Boaz acolhe Rute como estrangeira e reconhece seu cuidado por Noemi e sua confiança no Deus de Israel. Nos campos, a bondade se torna proteção, alimento e espaço para trabalhar com dignidade.',
    reference: 'Rute 2:8–12, 14–18',
    url: source('ot/ruth/2', 'p8-p12,p14-p18')
  },
  B09: {
    title: 'A confiança de Davi está no Senhor',
    text: 'Diante de Golias, Davi declara que vai em nome do Senhor, e não apoiado na superioridade das armas. Sua coragem testemunha que o poder de salvar pertence a Deus, a quem atribui o livramento.',
    reference: '1 Samuel 17:45–47',
    url: source('ot/1-sam/17', 'p45-p47')
  },
  B10: {
    title: 'Um coração que retorna a Deus',
    text: 'Elias ora para que o povo reconheça o Senhor e volte o coração a Ele. O fogo sobre o altar conduz os presentes à adoração. A manifestação aponta para Deus, a quem Elias serve e obedece.',
    reference: '1 Reis 18:36–39',
    url: source('ot/1-kgs/18', 'p36-p39')
  },
  B11: {
    title: 'Uma fidelidade cultivada em oração',
    text: 'Daniel mantém sua prática de orar mesmo sob ameaça. Preservado na cova, atribui seu livramento ao anjo enviado por Deus. Sua fidelidade aparece antes do milagre, na constância de sua relação com o Senhor.',
    reference: 'Daniel 6:10, 22–23',
    url: source('ot/dan/6', 'p10,p22-p23')
  },
  B12: {
    title: 'Fidelidade sem exigir o livramento',
    text: 'Sadraque, Mesaque e Abede-Nego sabem que Deus pode livrá-los, mas decidem não adorar a imagem mesmo se isso não acontecer. Sua lealdade ao Senhor não depende de obter o desfecho que desejam.',
    reference: 'Daniel 3:16–18',
    url: source('ot/dan/3', 'p16-p18')
  },
  B13: {
    title: 'Arrepender-se é mudar de direção',
    text: 'O Senhor chama Jonas novamente, e ele segue para Nínive. Seus habitantes creem e abandonam seus maus caminhos. A misericórdia divina acompanha um arrependimento que se manifesta em mudança de conduta.',
    reference: 'Jonas 3:1–3, 5, 8–10',
    url: source('ot/jonah/3', 'p1-p3,p5,p8-p10')
  },
  B14: {
    title: 'Maria acolhe a palavra do Senhor',
    text: 'Gabriel anuncia que o menino será chamado Filho de Deus. Maria escuta, pergunta e se dispõe a cumprir a palavra recebida. Sua resposta expressa fé no poder divino e disposição para servir ao Senhor.',
    reference: 'Lucas 1:31–38',
    url: source('nt/luke/1', 'p31-p38')
  },
  B15: {
    title: 'O Salvador veio para todo o povo',
    text: 'O nascimento na manjedoura é anunciado aos pastores como grande alegria para todo o povo: nasceu o Salvador. Eles procuram Jesus, testemunham o que receberam e voltam louvando a Deus.',
    reference: 'Lucas 2:10–20',
    url: source('nt/luke/2', 'p10-p20')
  },
  B16: {
    title: 'Crescer diante de Deus e das pessoas',
    text: 'No templo, Jesus demonstra consciência de Sua relação com o Pai. Depois retorna a Nazaré, sujeito a Maria e José. Seu crescimento em sabedoria, estatura e graça reúne propósito divino e vida familiar.',
    reference: 'Lucas 2:49–52',
    url: source('nt/luke/2', 'p49-p52')
  },
  B17: {
    title: 'O Filho obedece; o Pai testifica',
    text: 'Jesus recebe o batismo para cumprir toda a justiça. O Espírito desce como pomba, e o Pai testifica de Seu Filho amado. Nas águas do Jordão, vemos a atuação distinta do Pai, do Filho e do Espírito.',
    reference: 'Mateus 3:13–17',
    url: source('nt/matt/3', 'p13-p17')
  },
  B18: {
    title: 'Seguir Cristo muda o rumo da vida',
    text: 'Simão lança a rede por confiar na palavra de Jesus, apesar da noite sem peixes. Após a pesca, o convite é maior que a abundância recebida: deixar os barcos e seguir o Mestre em Sua obra.',
    reference: 'Lucas 5:5–11',
    url: source('nt/luke/5', 'p5-p11')
  },
  B19: {
    title: 'O sinal aponta para quem Jesus é',
    text: 'Os servos enchem as talhas e levam o que Jesus ordena ao mestre de cerimônias. A água transformada em vinho manifesta a glória de Cristo e fortalece a fé dos discípulos em quem realizou o sinal.',
    reference: 'João 2:5–11',
    url: source('nt/john/2', 'p5-p11')
  },
  B20: {
    title: 'Ouvir e praticar as palavras de Cristo',
    text: 'Ao concluir o sermão, Jesus compara quem ouve e pratica Seus ensinamentos a alguém que constrói sobre a rocha. A firmeza do discípulo está em viver o que recebeu, mesmo quando chegam as tempestades.',
    reference: 'Mateus 7:24–27',
    url: source('nt/matt/7', 'p24-p27')
  },
  B21: {
    title: 'A compaixão chama discípulos a servir',
    text: 'Movido de compaixão, Jesus acolhe a multidão e abençoa os pães. Os discípulos participam distribuindo o alimento. O milagre revela o cuidado do Salvador e inclui Seus seguidores no serviço aos que têm fome.',
    reference: 'Mateus 14:14–20',
    url: source('nt/matt/14', 'p14-p20')
  },
  B22: {
    title: 'Quem é Aquele a quem o mar obedece?',
    text: 'A ordem de Jesus aquieta o vento e o mar. Os discípulos passam do medo à pergunta sobre Sua identidade. O relato convida a reconhecer a autoridade do Salvador e a desenvolver fé Nele em meio ao temor.',
    reference: 'Marcos 4:37–41',
    url: source('nt/mark/4', 'p37-p41')
  },
  B23: {
    title: 'Cristo estende a mão a Pedro',
    text: 'Quando Pedro teme e começa a afundar, pede socorro; Jesus prontamente o segura. O auxílio vem acompanhado de um ensino sobre a fé. No barco, os discípulos reconhecem Jesus como o Filho de Deus.',
    reference: 'Mateus 14:28–33',
    url: source('nt/matt/14', 'p28-p33')
  },
  B24: {
    title: 'Amar o próximo exige aproximar-se',
    text: 'Na parábola, o samaritano se torna próximo ao tratar o ferido e assegurar a continuidade do cuidado. Jesus ensina a imitar essa misericórdia: amar atravessa diferenças e assume responsabilidade por quem precisa.',
    reference: 'Lucas 10:33–37',
    url: source('nt/luke/10', 'p33-p37')
  },
  B25: {
    title: 'A alegria de acolher quem retorna',
    text: 'Na parábola, o filho reconhece seu pecado e volta; o pai corre para recebê-lo. O irmão mais velho também é convidado à alegria. Jesus une o chamado ao arrependimento à misericórdia que acolhe o retorno.',
    reference: 'Lucas 15:17–24, 31–32',
    url: source('nt/luke/15', 'p17-p24,p31-p32')
  },
  B26: {
    title: 'Cristo é a ressurreição e a vida',
    text: 'Jesus chora com os que sofrem e chama Lázaro para fora do sepulcro. Seu poder sobre a morte acompanha Sua compaixão no luto. A esperança que oferece a Marta está centrada Nele, a ressurreição e a vida.',
    reference: 'João 11:25–26, 33–35, 43–44',
    url: source('nt/john/11', 'p25-p26,p33-p35,p43-p44')
  },
  B27: {
    title: 'O Rei vem com mansidão',
    text: 'A entrada de Jesus em Jerusalém cumpre a palavra sobre um Rei manso. Mantos, ramos e aclamações acompanham Sua passagem. A montaria simples destaca a humildade Daquele que a multidão saúda como Filho de Davi.',
    reference: 'Mateus 21:4–9',
    url: source('nt/matt/21', 'p4-p9')
  },
  B28: {
    title: 'Lembrar a entrega de Jesus Cristo',
    text: 'Ao repartir o pão e apresentar o cálice, Jesus ensina Seus apóstolos a lembrar Seu corpo e Seu sangue, entregues por eles. O sacramento dirige nossa adoração à pessoa do Salvador e ao Seu sacrifício.',
    reference: 'Lucas 22:19–20',
    url: source('nt/luke/22', 'p19-p20')
  },
  B29: {
    title: 'A vontade do Filho voltada ao Pai',
    text: 'Na agonia, Jesus ora e submete Sua vontade à do Pai. Um anjo O fortalece, e Ele continua a orar intensamente. Ao voltar aos discípulos, ensina que também precisam buscar a Deus para resistir à tentação.',
    reference: 'Lucas 22:40–46',
    url: source('nt/luke/22', 'p40-p46')
  },
  B30: {
    title: 'O cuidado de Cristo junto à cruz',
    text: 'Mesmo na cruz, Jesus cuida de Sua mãe e a confia ao discípulo amado. Ao concluir Sua missão, entrega o espírito. Seu sacrifício é contemplado junto dessa expressão concreta de amor e responsabilidade.',
    reference: 'João 19:25–30',
    url: source('nt/john/19', 'p25-p30')
  },
  B31: {
    title: 'O Ressuscitado chama Maria pelo nome',
    text: 'Maria Madalena reconhece Jesus quando Ele a chama pelo nome. Aquele que fora sepultado vive e a envia aos discípulos. Seu encontro no jardim se transforma em testemunho da realidade do Senhor ressuscitado.',
    reference: 'João 20:14–18',
    url: source('nt/john/20', 'p14-p18')
  },
  B32: {
    title: 'Testemunhar enquanto aguardamos Sua volta',
    text: 'Antes de ascender, Jesus promete o poder do Espírito Santo para que os apóstolos sejam Suas testemunhas. A promessa de Seu retorno acompanha uma missão presente: levar o testemunho de Cristo até os confins da terra.',
    reference: 'Atos 1:8–11',
    url: source('nt/acts/1', 'p8-p11')
  }
};
