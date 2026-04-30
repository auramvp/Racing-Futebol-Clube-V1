export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  imageUrl: string;
  category: string;
}

export interface Match {
  id: string;
  opponent: string;
  opponentLogo: string;
  date: string;
  time: string;
  competition: string;
  venue: string;
  isHome: boolean;
  score?: {
    home: number;
    away: number;
  };
  status: 'upcoming' | 'finished' | 'live';
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  age: number;
  position: string;
  imageUrl: string;
  category: string;
  number?: number;
}

export interface TransparencyReport {
  id: string;
  year: string;
  title: string;
  summary: string;
  content: string;
  datePublished: string;
  attachments: {
    name: string;
    type: 'pdf' | 'image';
    url: string;
  }[];
}
