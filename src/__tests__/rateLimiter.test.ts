import RateLimiter from '../rateLimiter';

describe('RateLimiter', () => {
  describe('tryConsume', () => {
    it('should allow consuming tokens when available', () => {
      const limiter = new RateLimiter(10, 2);
      expect(limiter.tryConsume(5)).toBe(true);
      expect(limiter.getAvailableTokens()).toBe(5);
    });

    it('should reject when not enough tokens', () => {
      const limiter = new RateLimiter(10, 2);
      limiter.tryConsume(8);
      expect(limiter.tryConsume(5)).toBe(false);
    });

    it('should allow consuming exactly available tokens', () => {
      const limiter = new RateLimiter(10, 2);
      expect(limiter.tryConsume(10)).toBe(true);
      expect(limiter.getAvailableTokens()).toBe(0);
    });
  });

  describe('refill', () => {
    it('should refill tokens over time', async () => {
      const limiter = new RateLimiter(10, 10); // 10 tokens per second
      limiter.tryConsume(10);
      expect(limiter.getAvailableTokens()).toBe(0);

      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 0.5 seconds
      expect(limiter.getAvailableTokens()).toBeGreaterThanOrEqual(4);
    });

    it('should not exceed max tokens', async () => {
      const limiter = new RateLimiter(10, 5);
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
      expect(limiter.getAvailableTokens()).toBe(10);
    });
  });

  describe('consume', () => {
    it('should wait and consume when tokens are not available', async () => {
      const limiter = new RateLimiter(5, 10); // 10 tokens per second
      limiter.tryConsume(5);

      const start = Date.now();
      await limiter.consume(3);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(200); // Should wait at least 0.2 seconds
    }, 10000);

    it('should consume immediately when tokens are available', async () => {
      const limiter = new RateLimiter(10, 5);
      const start = Date.now();
      await limiter.consume(5);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100); // Should be almost immediate
    });
  });

  describe('reset', () => {
    it('should reset tokens to max capacity', () => {
      const limiter = new RateLimiter(10, 2);
      limiter.tryConsume(8);
      expect(limiter.getAvailableTokens()).toBe(2);

      limiter.reset();
      expect(limiter.getAvailableTokens()).toBe(10);
    });
  });

  describe('getAvailableTokens', () => {
    it('should return current available tokens', () => {
      const limiter = new RateLimiter(10, 2);
      expect(limiter.getAvailableTokens()).toBe(10);

      limiter.tryConsume(3);
      expect(limiter.getAvailableTokens()).toBe(7);
    });

    it('should account for refilled tokens', async () => {
      const limiter = new RateLimiter(10, 10);
      limiter.tryConsume(10);
      expect(limiter.getAvailableTokens()).toBe(0);

      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(limiter.getAvailableTokens()).toBeGreaterThanOrEqual(4);
    });
  });
});
