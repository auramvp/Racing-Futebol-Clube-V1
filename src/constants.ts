import { NewsItem, Match, Player, TransparencyReport } from './types';

export const TRANSPARENCY_REPORTS: TransparencyReport[] = [
  {
    id: 'tr-2023',
    year: '2023',
    title: 'Relatório Anual de Sustentabilidade e Finanças',
    summary: 'Demonstrativo detalhado das receitas, despesas e investimentos realizados durante o exercício de 2023.',
    content: 'O exercício de 2023 foi marcado pela reestruturação financeira do Racing FC. Com um aumento de 15% nas receitas de patrocínio e uma gestão rigorosa dos custos operacionais, conseguimos atingir o equilíbrio fiscal. Os investimentos foram focados nas categorias de base e na manutenção da Arena Racing.',
    datePublished: '2024-03-20',
    attachments: [
      { name: 'Balanço Patrimonial 2023.pdf', type: 'pdf', url: '#' },
      { name: 'Demonstrativo de Resultados.pdf', type: 'pdf', url: '#' },
      { name: 'Certidão Negativa.jpg', type: 'image', url: '#' }
    ]
  },
  {
    id: 'tr-2022',
    year: '2022',
    title: 'Prestação de Contas - Gestão Esportiva',
    summary: 'Análise financeira do ano de 2022, com foco nos investimentos do departamento de futebol.',
    content: 'Em 2022, o clube priorizou o pagamento de dívidas históricas e a modernização do centro de treinamento. O relatório apresenta o fluxo de caixa detalhado e as fontes de financiamento utilizadas para as melhorias estruturais.',
    datePublished: '2023-04-15',
    attachments: [
      { name: 'Relatório Gestão 2022.pdf', type: 'pdf', url: '#' },
      { name: 'Auditoria Externa.pdf', type: 'pdf', url: '#' }
    ]
  }
];

export const TROPHIES = [
  {
    id: 't1',
    title: 'Campeonato Capixaba',
    year: '1960',
    description: 'A conquista histórica que marcou uma era de ouro para o Racing na capital.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 't2',
    title: 'Taça Cidade de Vitória',
    year: '1955',
    description: 'O primeiro grande troféu levantado pelo clube logo após sua fundação.',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 't3',
    title: 'Torneio Início',
    year: '1962',
    description: 'A demonstração de força e técnica que consolidou o Racing como gigante.',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop'
  }
];

export const NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Racing FC anuncia novo reforço para o meio-campo',
    summary: 'O experiente jogador chega para fortalecer o elenco na disputa do campeonato nacional.',
    date: '2024-05-15',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
    category: 'Futebol Masculino'
  },
  {
    id: '2',
    title: 'Preparação intensa para o clássico de domingo',
    summary: 'A equipe realizou o último treino tático antes de enfrentar o maior rival.',
    date: '2024-05-14',
    imageUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=800&auto=format&fit=crop',
    category: 'Treino'
  },
  {
    id: '3',
    title: 'Racing FC abre nova escolinha de futebol',
    summary: 'Projeto visa descobrir novos talentos na região metropolitana.',
    date: '2024-05-13',
    imageUrl: 'https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=800&auto=format&fit=crop',
    category: 'Institucional'
  },
  {
    id: '4',
    title: 'Vitória heróica nos acréscimos garante liderança',
    summary: 'Com dois gols no final, o Racing virou o jogo e segue isolado no topo.',
    date: '2024-05-12',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
    category: 'Partida'
  }
];

export const MATCHES: Match[] = [
  {
    id: 'm1',
    opponent: 'União Galáctica',
    opponentLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Uniao',
    date: '2024-05-19',
    time: '16:00',
    competition: 'Campeonato Nacional',
    venue: 'Arena Racing',
    isHome: true,
    status: 'upcoming'
  },
  {
    id: 'm2',
    opponent: 'Real Metrópole',
    opponentLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Real',
    date: '2024-05-12',
    time: '18:30',
    competition: 'Campeonato Nacional',
    venue: 'Estádio Municipal',
    isHome: false,
    score: { home: 1, away: 2 },
    status: 'finished'
  }
];

export const PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Ricardo "Muralha"',
    number: 1,
    position: 'Goleiro',
    imageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=400&auto=format&fit=crop',
    nationality: 'Brasil'
  },
  {
    id: 'p2',
    name: 'Gabriel Silva',
    number: 10,
    position: 'Meio-campo',
    imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=400&auto=format&fit=crop',
    nationality: 'Brasil'
  },
  {
    id: 'p3',
    name: 'Lucas "Artilheiro"',
    number: 9,
    position: 'Atacante',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    nationality: 'Brasil'
  }
];
