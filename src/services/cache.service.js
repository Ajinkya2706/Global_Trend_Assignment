class CacheService {
  constructor(ttl = 300000, maxSize = 100) {
    this.cache = new Map();
    this.ttl = ttl;
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return item.value;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    return size;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(2) + '%' : '0%',
      ttl: this.ttl / 1000 + 's'
    };
  }
}

export default new CacheService();