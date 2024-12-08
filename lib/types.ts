export interface Article {
    title: string;
    link: string;
    pubDate: number;
    description: string;
    image: string;
    source: string;
    hidden: boolean;
    // Add these optional properties for when articles are processed with embeddings
    distance?: number;
    key?: string;
    embedding?: string | number[];
}

export type SuccessfulSource = {
  url: string
  count: number
}

export type FetchResult = {
  articles: Article[]
  successfulSources: SuccessfulSource[]
  updateTime: Date
}

export type MediaItem = {
  url?: string
  title?: string
  width?: number
  height?: number
}

export type SuccessfulSourcesProps = {
  category: string
  successfulSources: SuccessfulSource[]
  articles: Article[]
  updateTime: Date
}