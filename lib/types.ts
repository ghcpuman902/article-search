export type ImageData = {
  src: string;  // Must be a non-empty string
  alt?: string;
  width?: number;
  height?: number;
}

// Helper type guard
export function isValidImageData(image: ImageData | null): image is ImageData {
  try {
    return Boolean(
      image !== null && 
      typeof image.src === 'string' && 
      image.src.trim() !== '' &&
      (image.src.startsWith('http') || image.src.startsWith('/'))
    );
  } catch {
    return false;
  }
}

export interface Article {
    title: string;
    link: string;
    pubDate: number;
    description: string;
    image: ImageData | null;
    source: string;
    hidden: boolean;
    // Add these optional properties for when articles are processed with embeddings
    distance?: number;
    key?: string;
    embedding?: string | number[];
}

export type SuccessfulSource = {
  url: string;
  shown: number;
  hidden: number;
  maxAge: number;
  total: number;
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
  params: UnifiedSearchParams
}

export type SortOption = 'relevance' | 'date';

export const SORT_OPTIONS: Record<SortOption, string> = {
  'relevance': 'Relevance',
  'date': 'Date'
} as const;

export type DurationKey = 'one-month' | 'one-week' | 'four-days' | 'fourty-eight-hours';
export type FilterDaysOption = '30' | '7' | '4' | '2';

export const DURATION_MAPPING: Record<DurationKey, FilterDaysOption> = {
  'one-month': '30',
  'one-week': '7',
  'four-days': '4',
  'fourty-eight-hours': '2'
} as const;


export interface UnifiedSearchParams {
  q?: string;
  days?: FilterDaysOption;
  locale?: string;
  sort?: SortOption;
  page?: string;
}

export interface EmbeddingsData {
  queryEmbedding: Float64Array;
  articleEmbeddings: {
    key: string;
    embedding: Float64Array;
  }[];
}