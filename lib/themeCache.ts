interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ThemeCache {
  private static readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  static set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: this.TTL
    };
    localStorage.setItem(`theme_cache_${key}`, JSON.stringify(entry));
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`theme_cache_${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`theme_cache_${key}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      localStorage.removeItem(`theme_cache_${key}`);
      return null;
    }
  }

  static clear(key: string): void {
    localStorage.removeItem(`theme_cache_${key}`);
  }

  static clearAll(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith('theme_cache_'))
      .forEach(key => localStorage.removeItem(key));
  }

  static isExpired(key: string): boolean {
    try {
      const cached = localStorage.getItem(`theme_cache_${key}`);
      if (!cached) return true;

      const entry: CacheEntry<any> = JSON.parse(cached);
      return Date.now() - entry.timestamp > entry.ttl;
    } catch {
      return true;
    }
  }
}
