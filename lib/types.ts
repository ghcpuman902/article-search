export type Article = {
    title: string
    link: string
    pubDate: string | number
    description: string
    image: string
    source: string
    distance: number | null
    embedding: number[] | null
    key: string
    hidden: boolean
  }

export interface Source {
  url: string;
  count: number;
}

export interface SuccessfulSourcesProps {
  locale: string;
  successfulSources: Source[];
  updateTime: Date;
}