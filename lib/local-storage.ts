import { UnifiedSearchParams } from './types';

const STORAGE_KEY_PREFIX = 'article-search-state-';

export interface CategoryState {
  sort: string;
  days: string;
  q: string;
  page?: string;
  lastUpdated: number;
}

export function getCategoryState(category: string): CategoryState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedState = localStorage.getItem(STORAGE_KEY_PREFIX + category);
    return storedState ? JSON.parse(storedState) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

export function setCategoryState(category: string, params: UnifiedSearchParams) {
  if (typeof window === 'undefined') return;
  
  try {
    const state: CategoryState = {
      sort: params.sort || 'relevance',
      days: params.days || '4',
      q: params.q || '',
      page: params.page,
      lastUpdated: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEY_PREFIX + category, JSON.stringify(state));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

export function constructCategoryUrl(category: string, defaultQuery: string): string {
  const state = getCategoryState(category);
  
  if (!state) {
    return `/${category}?q=${encodeURIComponent(defaultQuery)}`;
  }
  
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.sort) params.set('sort', state.sort);
  if (state.days) params.set('days', state.days);
  if (state.page && state.page !== '1') params.set('page', state.page);
  
  return `/${category}${params.toString() ? '?' + params.toString() : ''}`;
} 