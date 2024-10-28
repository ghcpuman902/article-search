'use client';
const pV = ['', '23102101', '23102102'];
const thisV = '23102723';
const ARTICLES = 'articles';
const TIME = 'update-time';
const LOCALE = 'locale';
const QUERYEMBEDDINGS = 'query-embeddings';
const ARTICLEEMBEDDINGS = 'article-embeddings';

// Check if caches is available
const cacheAvailable = (typeof window !== "undefined") ? ('caches' in self) : false;

let cacheStorage;

export const initializeCache = async () => {
  if (cacheAvailable) {
    cacheStorage = await caches.open('article-search');
    clearPrevData();
  }
}

// Retrieve articles data from cache
export const getCacheArticles = async () => {
  if (cacheAvailable && cacheStorage) {
    try {
      const articles = await cacheStorage.match(ARTICLES + thisV);
      const updateTime = await cacheStorage.match(TIME + thisV);
      const localeLang = await cacheStorage.match(LOCALE + thisV);

      const parsedArticles = articles ? await articles.json() : null;
      const parsedUpdateTime = updateTime ? await updateTime.json() : null;
      const parsedLocale = localeLang ? await localeLang.json() : null;

      if (!parsedArticles ||
        parsedArticles.length === 0 ||
        !parsedArticles[0] ||
        !parsedArticles[0].embedding ||
        parsedArticles[0].embedding.length === 0) {
        // Return or take action: parsedArticles is null, empty, its first element is null or undefined, 
        // or the first element's embedding property is null, undefined, or an empty array
        // invalidate the cache
        return [null, null, null];
      }
      return [parsedArticles, parsedUpdateTime, parsedLocale];
    } catch (error) {
      console.error("Error reading articles from cache:", error);
      clearAllData();
      return [null, null, null];
    }
  }
  // In case caches is not available
  return [null, null, null];
}

// Update the articles data in cache
export const updateCacheArticles = async ({ articles, updateTime, locale }) => {
  if (cacheAvailable && cacheStorage) {
    try {
      await cacheStorage.put(ARTICLES + thisV, new Response(JSON.stringify(articles)));
      await cacheStorage.put(TIME + thisV, new Response(JSON.stringify(updateTime)));
      await cacheStorage.put(LOCALE + thisV, new Response(JSON.stringify(locale)));
      return { articles, updateTime, locale };
    } catch (error) {
      console.error("Error setting articles to cache:", error);
      clearAllData();
      return {};
    }
  }
  // In case caches is not available
  return {};
}

// Retrieve embedding of a query from cache
export const searchCacheQueryEmbedding = async (query) => {
  if (cacheAvailable && cacheStorage) {
    try {
      const queryEmbeddingsResponse = await cacheStorage.match(QUERYEMBEDDINGS);
      if (!queryEmbeddingsResponse) {
        return null;
      }
      const queryEmbeddings = await queryEmbeddingsResponse.json();
      return queryEmbeddings[query] || null;
    } catch (error) {
      console.error("Error reading from query cache:", error);
      clearAllData();
      return null;
    }
  }
  // In case caches is not available
  return null;
}

export const appendCacheQueryEmbedding = async ({ query, embedding }) => {
  if (cacheAvailable && cacheStorage) {
    try {
      let queryEmbeddingsResponse = await cacheStorage.match(QUERYEMBEDDINGS);

      let queryEmbeddings = queryEmbeddingsResponse ? await queryEmbeddingsResponse.json() : {};

      queryEmbeddings[query] = embedding;

      await cacheStorage.put(QUERYEMBEDDINGS, new Response(JSON.stringify(queryEmbeddings)));
      return { [query]: embedding };
    } catch (error) {
      console.error("Error setting query cache:", error);
      clearAllData();
      return {};
    }
  }
  // In case caches is not available
  return {};
}


export const borrowCacheEmbeddings = async () => {
  if (cacheAvailable && cacheStorage) {
    try {
      let queryEmbeddingsResponse = await cacheStorage.match(ARTICLEEMBEDDINGS);
      let cacheEmbeddings = queryEmbeddingsResponse ? await queryEmbeddingsResponse.json() : {};

      return cacheEmbeddings;
    } catch (error) {
      console.error("Error borrow Cache Embeddings:", error);
      clearAllData();
      return {};
    }
  } else {
    return {};
  }
}

export const returnCacheEmbeddings = async (cacheEmbeddings) => {
  if (cacheAvailable && cacheStorage) {
    try {
      return cacheStorage.put(ARTICLEEMBEDDINGS, new Response(JSON.stringify(cacheEmbeddings)));
    } catch (error) {
      console.error("Error return Cache Embeddings:", error);
      clearAllData();
      return {};
    }
  } else {
    return {};
  }
}

export const clearAllData = async () => {
  if (typeof window !== "undefined") {
    localStorage.clear();
    console.log('localStorage cleared');
  }

  if (cacheAvailable) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cache => caches.delete(cache)));
      console.log('cache cleared');
    } catch (error) {
      console.error("Error clearing cache:", error);
      clearAllData();
      return;
    }
  }
  return;
}

export const clearPrevData = async () => {
  if (cacheAvailable) {
    try {
      let cacheNames = ['succesful-sources'];
      pV.map(name => cacheNames = cacheNames.concat([ARTICLES + name, TIME + name, LOCALE + name]));
      await Promise.all(cacheNames.map(cache => caches.delete(cache)));
      console.log('previous cache cleared');
    } catch (error) {
      console.error("Error clearing prev cache:", error);
      clearAllData();
      return;
    }
  }
  return;
}