import axios, { AxiosInstance } from 'axios';
import { Agent } from 'https';
import MediumAuth from './auth';
import CacheManager from './cache';
import RateLimiter from './rateLimiter';
import { PublishArticleParams, SearchArticlesParams } from './types';

class MediumClient {
  private auth: MediumAuth;
  private baseUrl = 'https://api.medium.com/v1';
  private cache: CacheManager;
  private rateLimiter: RateLimiter;
  private axiosInstance: AxiosInstance;

  constructor(auth: MediumAuth) {
    this.auth = auth;
    this.cache = new CacheManager();
    this.rateLimiter = new RateLimiter(10, 2); // 10 tokens max, refill 2 per second

    // Create axios instance with connection pooling
    const httpsAgent = new Agent({
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 60000,
    });

    this.axiosInstance = axios.create({
      httpsAgent,
      timeout: 30000,
    });
  }

  // 發送 API 請求的私有方法
  private async makeRequest(
    method: 'get' | 'post',
    endpoint: string,
    data?: unknown,
    useCache = true
  ): Promise<unknown> {
    // Apply rate limiting
    await this.rateLimiter.consume();

    // Check cache for GET requests
    if (method === 'get' && useCache) {
      const cacheKey = `${method}:${endpoint}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.axiosInstance({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.auth.getAccessToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data,
      });

      // Cache GET requests
      if (method === 'get' && useCache) {
        const cacheKey = `${method}:${endpoint}`;
        this.cache.set(cacheKey, response.data);
      }

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Medium API 錯誤:', error.message);
      }
      throw error;
    }
  }

  // 發布文章
  async publishArticle(params: PublishArticleParams): Promise<unknown> {
    return this.makeRequest(
      'post',
      '/publications',
      {
        title: params.title,
        contentFormat: 'markdown',
        content: params.content,
        tags: params.tags,
        publishStatus: 'draft',
      },
      false
    );
  }

  // 取得使用者的出版物
  async getUserPublications(): Promise<unknown> {
    return this.makeRequest('get', '/publications');
  }

  // 搜尋文章
  async searchArticles(params: SearchArticlesParams): Promise<unknown> {
    const queryParams = new URLSearchParams();

    if (params.keywords) {
      params.keywords.forEach((keyword) => queryParams.append('q', keyword));
    }

    if (params.publicationId) {
      queryParams.append('publicationId', params.publicationId);
    }

    if (params.tags) {
      params.tags.forEach((tag) => queryParams.append('tag', tag));
    }

    return this.makeRequest('get', `/articles?${queryParams.toString()}`);
  }

  // 取得草稿
  async getDrafts(): Promise<unknown> {
    return this.makeRequest('get', '/drafts');
  }

  // 取得使用者個人資料
  async getUserProfile(): Promise<unknown> {
    return this.makeRequest('get', '/me');
  }

  // 建立草稿
  async createDraft(params: { title: string; content: string; tags?: string[] }): Promise<unknown> {
    return this.makeRequest(
      'post',
      '/drafts',
      {
        title: params.title,
        contentFormat: 'markdown',
        content: params.content,
        tags: params.tags,
      },
      false
    );
  }

  // 清除快取
  clearCache(): void {
    this.cache.clear();
  }

  // 取得快取統計資訊
  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.getStats();
  }
}

export default MediumClient;
