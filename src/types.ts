// Medium API Types
export interface MediumUser {
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}

export interface MediumArticle {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  publishedAt: Date;
  url: string;
  claps?: number;
  views?: number;
}

export interface MediumPublication {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
  };
}

export interface PublishArticleParams {
  title: string;
  content: string;
  tags?: string[];
  publicationId?: string;
}

export interface SearchArticlesParams {
  keywords?: string[];
  publicationId?: string;
  tags?: string[];
}

export interface CacheEntry<T> {
  data: T;
  expiry: number;
}
