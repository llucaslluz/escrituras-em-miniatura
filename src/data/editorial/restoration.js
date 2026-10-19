const dc = (chapter, verses) => `https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/${chapter}?lang=por&id=${verses}#${verses.split(/[,-]/)[0]}`;
const pgp = (book, chapter, verses) => `https://www.churchofjesuschrist.org/study/scriptures/pgp/${book}/${chapter}?lang=por&id=${verses}#${verses.split(/[,-]/)[0]}`;

// Original summaries of the cited passages, written for each individual scene.
export const editorial = {
  D01: {
    title: 'Autoridade para o arrependimento',
    text: 'João Batista confere autoridade para servir em nome do Messias. O Sacerdócio Aarônico possui chaves ligadas ao ministério de anjos, ao arrependimento e ao batismo por imersão para remissão dos pecados.',
    reference: 'D&C 13:1',
    url: dc(13, 'p1'),
  },
  D02: {
    title: 'Testemunhas chamadas por Deus',
    text: 'A fé precede a manifestação às Três Testemunhas. Depois de verem as placas, recebem a responsabilidade de declarar o que Deus lhes mostrou, confirmando ao mundo a veracidade do Livro de Mórmon.',
    reference: 'D&C 17:1–6',
    url: dc(17, 'p1-p6'),
  },
  D03: {
    title: 'Uma Igreja reunida em convênio',
    text: 'A Igreja recebe pelo batismo os que se arrependem e desejam seguir Jesus Cristo. Reunir-se para o sacramento expressa o compromisso de lembrar o Salvador, guardar Seus mandamentos e buscar Seu Espírito.',
    reference: 'D&C 20:37, 75–79',
    url: dc(20, 'p37,p75-p79'),
  },
  D04: {
    title: 'O canto também pode ser oração',
    text: 'Ao chamar Emma para selecionar hinos, o Senhor ensina que a adoração musical nasce do coração. O canto dos justos é recebido como oração, ligado à alegria e à fidelidade aos convênios.',
    reference: 'D&C 25:11–13',
    url: dc(25, 'p11-p13'),
  },
  D05: {
    title: 'O Filho vive e redime o mundo',
    text: 'Joseph e Sidney testemunham que Jesus Cristo vive à direita do Pai. A visão revela o Filho como Criador dos mundos e Redentor: Seu sacrifício torna possível purificar a humanidade do pecado.',
    reference: 'D&C 76:22–24, 40–42',
    url: dc(76, 'p22-p24,p40-p42'),
  },
  D06: {
    title: 'Aprender e adorar na casa do Senhor',
    text: 'Na dedicação, o povo consagra a casa a Deus e pede Sua presença. O templo reúne oração, fé e aprendizado; buscar sabedoria pelo estudo e pela fé faz parte dessa adoração.',
    reference: 'D&C 109:7–15',
    url: dc(109, 'p7-p15'),
  },
  D07: {
    title: 'O Salvador aceita Sua casa',
    text: 'O Cristo ressuscitado Se apresenta como Advogado junto ao Pai, anuncia perdão e aceita o templo. Sua promessa de manifestação está ligada à obediência e ao respeito pela santidade da casa.',
    reference: 'D&C 110:4–8',
    url: dc(110, 'p4-p8'),
  },
  D08: {
    title: 'Autoridade exercida com amor',
    text: 'Na cadeia, Joseph recebe um ensino sobre autoridade: o sacerdócio deve influenciar com paciência, bondade e amor sincero. O domínio injusto afasta o Espírito e não expressa o poder de Deus.',
    reference: 'D&C 121:36–42',
    url: dc(121, 'p36-p42'),
  },
  D09: {
    title: 'A salvação tem Jesus Cristo no centro',
    text: 'Todo o percurso aponta para Jesus Cristo. Seu sacrifício redime o mundo; por Ele, os que recebem Seu evangelho podem ser purificados e alcançar a salvação, conforme a visão das glórias.',
    reference: 'D&C 76:40–43, 50–53',
    url: dc(76, 'p40-p43,p50-p53'),
  },
  D10: {
    title: 'O evangelho é ensinado aos mortos',
    text: 'No mundo espiritual, Cristo organiza mensageiros para ensinar o evangelho aos mortos. A redenção vem de Seu sacrifício e é oferecida com fé, arrependimento e ordenanças realizadas em favor deles.',
    reference: 'D&C 138:30–35',
    url: dc(138, 'p30-p35'),
  },
  P01: {
    title: 'Criação a serviço da vida eterna',
    text: 'Ao contemplar mundos incontáveis, Moisés aprende que a grandeza de Deus tem um propósito pessoal. Suas obras, realizadas por meio do Filho, visam à imortalidade e à vida eterna da humanidade.',
    reference: 'Moisés 1:32–39',
    url: pgp('moses', 1, 'p32-p39'),
  },
  P02: {
    title: 'Homem e mulher à imagem de Deus',
    text: 'Deus cria a Terra por meio de Seu Unigênito e declara boa a Sua obra. Homem e mulher recebem vida à Sua imagem e são abençoados para formar família e habitar a criação.',
    reference: 'Moisés 2:1, 26–31',
    url: pgp('moses', 2, 'p1,p26-p31'),
  },
  P03: {
    title: 'Arbítrio no plano do Pai',
    text: 'Antes da mortalidade, o Filho Amado escolhe cumprir a vontade do Pai e dar-Lhe a glória. O plano preserva o arbítrio humano, que Satanás procurava destruir ao exigir para si o poder divino.',
    reference: 'Moisés 4:1–4',
    url: pgp('moses', 4, 'p1-p4'),
  },
  P04: {
    title: 'A Queda e a vida mortal',
    text: 'Após a transgressão, Adão e Eva conhecem o bem e o mal e deixam o Éden. Trabalho, dor e morte passam a integrar sua experiência, mostrando as consequências reais de suas escolhas.',
    reference: 'Moisés 4:22–31',
    url: pgp('moses', 4, 'p22-p31'),
  },
  P05: {
    title: 'Uma oferta que anuncia o Redentor',
    text: 'O anjo explica que a oferta de Adão simboliza o sacrifício do Unigênito. O ensino conduz ao arrependimento e à oração em nome de Cristo; Adão e Eva reconhecem com alegria a promessa de redenção.',
    reference: 'Moisés 5:6–12',
    url: pgp('moses', 5, 'p6-p12'),
  },
  P06: {
    title: 'Sião cuida de todos os seus moradores',
    text: 'O Senhor chama de Sião um povo unido em coração e vontade, vivendo em retidão e sem pobres entre si. A santidade dessa comunidade aparece tanto na adoração quanto no cuidado mútuo.',
    reference: 'Moisés 7:16–21',
    url: pgp('moses', 7, 'p16-p21'),
  },
  P07: {
    title: 'O convênio alcança todas as famílias',
    text: 'A promessa feita a Abraão inclui levar o evangelho e o sacerdócio às nações. Quem recebe o evangelho é contado como sua descendência; as bênçãos prometidas alcançam as famílias da Terra.',
    reference: 'Abraão 2:9–11',
    url: pgp('abr', 2, 'p9-p11'),
  },
  P08: {
    title: 'A sabedoria do Senhor supera todas',
    text: 'Ao ensinar Abraão sobre estrelas e espíritos, o Senhor revela Sua sabedoria superior. A ordem contemplada nos céus aponta para Aquele que conhece Suas obras e governa com sabedoria a Terra e os céus.',
    reference: 'Abraão 3:16–21',
    url: pgp('abr', 3, 'p16-p21'),
  },
  P09: {
    title: 'O Pai apresenta Seu Filho Amado',
    text: 'Em resposta à oração de Joseph, o Pai e o Filho aparecem como dois Personagens distintos. O Pai apresenta Jesus Cristo e orienta Joseph a ouvi-Lo: o Salvador é o centro da revelação.',
    reference: 'Joseph Smith—História 1:14–20',
    url: pgp('js-h', 1, 'p14-p20'),
  },
  P10: {
    title: 'Registros sagrados, propósito divino',
    text: 'Morôni ensina que as placas devem servir à glória de Deus, sem busca de riqueza. Anos de instrução preparam Joseph para receber e guardar o registro destinado a anunciar o evangelho de Cristo.',
    reference: 'Joseph Smith—História 1:34, 46, 53–54, 59',
    url: pgp('js-h', 1, 'p34,p46,p53-p54,p59'),
  },
};
