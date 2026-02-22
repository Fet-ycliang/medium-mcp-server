import axios from 'axios';
import MediumAuth from './auth';

// 發布文章參數介面
interface PublishArticleParams {
  title: string;
  content: string;
  tags?: string[];
  publicationId?: string;
}

// 搜尋文章參數介面
interface SearchArticlesParams {
  keywords?: string[];
  publicationId?: string;
  tags?: string[];
}

class MediumClient {
  private auth: MediumAuth;
  private baseUrl = 'https://api.medium.com/v1';

  constructor(auth: MediumAuth) {
    this.auth = auth;
  }

  // 發送 API 請求的私有方法
  private async makeRequest(method: 'get' | 'post', endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.auth.getAccessToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error: any) {
      console.error('Medium API 錯誤:', error.response?.data || error.message);
      throw error;
    }
  }

  // 發布文章
  async publishArticle(params: PublishArticleParams) {
    return this.makeRequest('post', '/publications', {
      title: params.title,
      contentFormat: 'markdown',
      content: params.content,
      tags: params.tags,
      publishStatus: 'draft'
    });
  }

  // 取得使用者的出版物
  async getUserPublications() {
    return this.makeRequest('get', '/publications');
  }

  // 搜尋文章
  async searchArticles(params: SearchArticlesParams) {
    const queryParams = new URLSearchParams();
    
    if (params.keywords) {
      params.keywords.forEach(keyword => 
        queryParams.append('q', keyword)
      );
    }

    if (params.publicationId) {
      queryParams.append('publicationId', params.publicationId);
    }

    if (params.tags) {
      params.tags.forEach(tag => 
        queryParams.append('tag', tag)
      );
    }

    return this.makeRequest('get', `/articles?${queryParams.toString()}`);
  }

  // 取得草稿
  async getDrafts() {
    return this.makeRequest('get', '/drafts');
  }

  // 取得使用者個人資料
  async getUserProfile() {
    return this.makeRequest('get', '/me');
  }

  // 建立草稿
  async createDraft(params: { 
    title: string, 
    content: string, 
    tags?: string[] 
  }) {
    return this.makeRequest('post', '/drafts', {
      title: params.title,
      contentFormat: 'markdown',
      content: params.content,
      tags: params.tags
    });
  }
}

export default MediumClient;
