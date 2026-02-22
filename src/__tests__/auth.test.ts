import MediumAuth from '../auth';

describe('MediumAuth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should throw error when MEDIUM_CLIENT_ID is missing', () => {
      delete process.env.MEDIUM_CLIENT_ID;
      process.env.MEDIUM_CLIENT_SECRET = 'test-secret';

      expect(() => new MediumAuth()).toThrow('MEDIUM_CLIENT_ID');
    });

    it('should throw error when MEDIUM_CLIENT_SECRET is missing', () => {
      process.env.MEDIUM_CLIENT_ID = 'test-id';
      delete process.env.MEDIUM_CLIENT_SECRET;

      expect(() => new MediumAuth()).toThrow('MEDIUM_CLIENT_SECRET');
    });

    it('should create instance with valid credentials', () => {
      process.env.MEDIUM_CLIENT_ID = 'test-id';
      process.env.MEDIUM_CLIENT_SECRET = 'test-secret';

      expect(() => new MediumAuth()).not.toThrow();
    });
  });

  describe('authenticate', () => {
    beforeEach(() => {
      process.env.MEDIUM_CLIENT_ID = 'test-id';
      process.env.MEDIUM_CLIENT_SECRET = 'test-secret';
    });

    it('should successfully authenticate', async () => {
      const auth = new MediumAuth();
      await expect(auth.authenticate()).resolves.not.toThrow();
    });

    it('should set access token after authentication', async () => {
      const auth = new MediumAuth();
      await auth.authenticate();
      expect(auth.getAccessToken()).toBeTruthy();
    });
  });

  describe('getAccessToken', () => {
    beforeEach(() => {
      process.env.MEDIUM_CLIENT_ID = 'test-id';
      process.env.MEDIUM_CLIENT_SECRET = 'test-secret';
    });

    it('should throw error when not authenticated', () => {
      const auth = new MediumAuth();
      expect(() => auth.getAccessToken()).toThrow('需要驗證');
    });

    it('should return access token after authentication', async () => {
      const auth = new MediumAuth();
      await auth.authenticate();
      const token = auth.getAccessToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });
});
