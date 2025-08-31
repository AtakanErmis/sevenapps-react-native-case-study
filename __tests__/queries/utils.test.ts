import { simulateNetworkLatency, generateTempId, isTempId } from '@/queries/utils';

describe('queries/utils', () => {
  describe('simulateNetworkLatency', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve after a random delay between 300-1200ms', async () => {
      const mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const promise = simulateNetworkLatency();

      // Fast-forward timers
      jest.advanceTimersByTime(750); // 300 + (0.5 * 900) = 750ms

      await expect(promise).resolves.toBeUndefined();

      mockMathRandom.mockRestore();
    });

    it('should use Math.random for delay calculation', async () => {
      const mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0);
      const promise = simulateNetworkLatency();

      jest.advanceTimersByTime(300); // minimum delay

      await expect(promise).resolves.toBeUndefined();

      mockMathRandom.mockRestore();
    });

    it('should handle maximum delay', async () => {
      const mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(1);
      const promise = simulateNetworkLatency();

      jest.runAllTimers(); // Run all pending timers

      await promise;

      mockMathRandom.mockRestore();
    });
  });

  describe('generateTempId', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should generate temp ID with default prefix', () => {
      const result = generateTempId();
      expect(result).toBe('temp_1672531200000');
    });

    it('should generate temp ID with custom prefix', () => {
      const result = generateTempId('custom');
      expect(result).toBe('custom_1672531200000');
    });

    it('should generate unique IDs when called at different times', () => {
      const id1 = generateTempId();

      jest.advanceTimersByTime(1);

      const id2 = generateTempId();

      expect(id1).not.toBe(id2);
      expect(id1).toBe('temp_1672531200000');
      expect(id2).toBe('temp_1672531200001');
    });

    it('should handle empty string prefix', () => {
      const result = generateTempId('');
      expect(result).toBe('_1672531200000');
    });
  });

  describe('isTempId', () => {
    it('should return true for string IDs starting with temp_', () => {
      expect(isTempId('temp_123')).toBe(true);
      expect(isTempId('temp_1672531200000')).toBe(true);
      expect(isTempId('temp_abc')).toBe(true);
    });

    it('should return false for string IDs not starting with temp_', () => {
      expect(isTempId('temp')).toBe(false);
      expect(isTempId('temporary_123')).toBe(false);
      expect(isTempId('123_temp')).toBe(false);
      expect(isTempId('regular_id')).toBe(false);
      expect(isTempId('')).toBe(false);
    });

    it('should return false for number IDs', () => {
      expect(isTempId(123)).toBe(false);
      expect(isTempId(0)).toBe(false);
      expect(isTempId(-1)).toBe(false);
    });

    it('should return false for custom prefix temp IDs', () => {
      expect(isTempId('custom_123')).toBe(false);
      expect(isTempId('prefix_temp_123')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isTempId('temp_')).toBe(true); // starts with temp_
      expect(isTempId('temp_temp_123')).toBe(true); // multiple temp_ is still valid
    });
  });
});
