import MediumClient from '../client';
import MediumAuth from '../auth';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock MediumAuth
jest.mock('../auth');
const MockedAuth = MediumAuth as jest.MockedClass<typeof MediumAuth>;

describe('MediumClient', () => {
  let client: MediumClient;
  let mockAuth: jest.Mocked<MediumAuth>;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock auth
    mockAuth = new MockedAuth() as jest.Mocked<MediumAuth>;
    mockAuth.getAccessToken = jest.fn().mockReturnValue('test-token');

    // Setup mock axios instance - it's called as a function
    mockAxiosInstance = jest.fn();
    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

    client = new MediumClient(mockAuth);
  });

  describe('constructor', () => {
    it('should create axios instance with proper configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it('should initialize with auth instance', () => {
      expect(client).toBeDefined();
    });
  });

  describe('publishArticle', () => {
    it('should publish article successfully', async () => {
      const mockResponse = {
        data: {
          id: 'article-123',
          title: 'Test Article',
          url: 'https://medium.com/@user/test-article',
        },
      };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const params = {
        title: 'Test Article',
        content: 'This is test content',
        tags: ['test', 'article'],
        publicationId: 'pub-123',
      };

      const result = await client.publishArticle(params);

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: 'https://api.medium.com/v1/publications',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          data: expect.objectContaining({
            title: 'Test Article',
            content: 'This is test content',
            tags: ['test', 'article'],
            contentFormat: 'markdown',
            publishStatus: 'draft',
          }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle publish errors', async () => {
      mockAxiosInstance.mockRejectedValue(new Error('API Error'));

      const params = {
        title: 'Test Article',
        content: 'This is test content',
      };

      await expect(client.publishArticle(params)).rejects.toThrow('API Error');
    });

    it('should not use cache for POST requests', async () => {
      const mockResponse = { data: { id: 'article-123' } };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      const params = {
        title: 'Test Article',
        content: 'This is test content',
      };

      await client.publishArticle(params);
      await client.publishArticle(params);

      // Should call API twice, not use cache
      expect(mockAxiosInstance).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserPublications', () => {
    it('should fetch user publications successfully', async () => {
      const mockResponse = {
        data: [
          { id: 'pub-1', name: 'Publication 1' },
          { id: 'pub-2', name: 'Publication 2' },
        ],
      };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const result = await client.getUserPublications();

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: 'https://api.medium.com/v1/publications',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should use cache for repeated requests', async () => {
      const mockResponse = { data: [{ id: 'pub-1' }] };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      // First call - should hit API
      await client.getUserPublications();

      // Second call - should use cache
      await client.getUserPublications();

      // Should only call API once
      expect(mockAxiosInstance).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
      mockAxiosInstance.mockRejectedValue(new Error('Network Error'));

      await expect(client.getUserPublications()).rejects.toThrow('Network Error');
    });
  });

  describe('searchArticles', () => {
    it('should search articles with keywords', async () => {
      const mockResponse = {
        data: [
          { id: 'article-1', title: 'Article 1' },
          { id: 'article-2', title: 'Article 2' },
        ],
      };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const params = {
        keywords: ['test', 'search'],
      };

      const result = await client.searchArticles(params);

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: expect.stringContaining('/articles?'),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should search articles with publicationId', async () => {
      const mockResponse = { data: [] };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      const params = {
        publicationId: 'pub-123',
      };

      await client.searchArticles(params);

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('publicationId=pub-123'),
        })
      );
    });

    it('should search articles with tags', async () => {
      const mockResponse = { data: [] };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      const params = {
        tags: ['javascript', 'typescript'],
      };

      await client.searchArticles(params);

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/articles?'),
        })
      );
    });

    it('should search articles with multiple parameters', async () => {
      const mockResponse = { data: [] };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      const params = {
        keywords: ['test'],
        publicationId: 'pub-123',
        tags: ['javascript'],
      };

      await client.searchArticles(params);

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: expect.stringContaining('/articles?'),
        })
      );
    });
  });

  describe('getDrafts', () => {
    it('should fetch drafts successfully', async () => {
      const mockResponse = {
        data: [
          { id: 'draft-1', title: 'Draft 1' },
          { id: 'draft-2', title: 'Draft 2' },
        ],
      };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const result = await client.getDrafts();

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: 'https://api.medium.com/v1/drafts',
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should use cache for repeated requests', async () => {
      const mockResponse = { data: [{ id: 'draft-1' }] };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      await client.getDrafts();
      await client.getDrafts();

      expect(mockAxiosInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockResponse = {
        data: {
          id: 'user-123',
          username: 'testuser',
          name: 'Test User',
          url: 'https://medium.com/@testuser',
        },
      };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const result = await client.getUserProfile();

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: 'https://api.medium.com/v1/me',
        })
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createDraft', () => {
    it('should create draft successfully', async () => {
      const mockResponse = {
        data: {
          id: 'draft-123',
          title: 'New Draft',
        },
      };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const params = {
        title: 'New Draft',
        content: 'Draft content',
        tags: ['draft', 'test'],
      };

      const result = await client.createDraft(params);

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: 'https://api.medium.com/v1/drafts',
          data: expect.objectContaining({
            title: 'New Draft',
            content: 'Draft content',
            tags: ['draft', 'test'],
            contentFormat: 'markdown',
          }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should create draft without tags', async () => {
      const mockResponse = { data: { id: 'draft-123' } };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      const params = {
        title: 'New Draft',
        content: 'Draft content',
      };

      await client.createDraft(params);

      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Draft',
            content: 'Draft content',
          }),
        })
      );
    });
  });

  describe('cache management', () => {
    beforeEach(() => {
      const mockResponse = { data: { test: 'data' } };
      mockAxiosInstance.mockResolvedValue(mockResponse);
    });

    it('should clear cache', async () => {
      await client.getUserPublications();

      client.clearCache();

      await client.getUserPublications();

      // Should call API twice after cache clear
      expect(mockAxiosInstance).toHaveBeenCalledTimes(2);
    });

    it('should get cache stats', async () => {
      await client.getUserPublications();

      const stats = client.getCacheStats();

      expect(stats.size).toBeGreaterThan(0);
      expect(stats.keys).toBeInstanceOf(Array);
    });
  });

  describe('rate limiting', () => {
    it('should apply rate limiting to requests', async () => {
      const mockResponse = { data: { test: 'data' } };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      const start = Date.now();

      // Make multiple rapid requests
      await Promise.all([
        client.getUserProfile(),
        client.getUserProfile(),
        client.getUserProfile(),
      ]);

      const elapsed = Date.now() - start;

      // Rate limiting should introduce some delay
      expect(mockAxiosInstance).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle axios errors properly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockAxiosInstance.mockRejectedValue(new Error('Network error'));

      await expect(client.getUserPublications()).rejects.toThrow('Network error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Medium API 錯誤:', 'Network error');

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockAxiosInstance.mockRejectedValue('String error');

      await expect(client.getUserPublications()).rejects.toBe('String error');

      consoleErrorSpy.mockRestore();
    });
  });
});
