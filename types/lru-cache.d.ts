declare module "lru-cache" {
  export interface LRUCacheOptions<K, V> {
    max?: number
    ttl?: number
    maxSize?: number
    sizeCalculation?: (value: V, key: K) => number
    allowStale?: boolean
    noDeleteOnFetchRejection?: boolean
    noDeleteOnStaleGet?: boolean
    updateAgeOnGet?: boolean
    updateAgeOnHas?: boolean
  }

  export class LRUCache<K = string, V = unknown> {
    constructor(options?: LRUCacheOptions<K, V>)
    get(key: K): V | undefined
    set(key: K, value: V): void
    delete(key: K): boolean
    clear(): void
    has(key: K): boolean
    get size(): number
  }

  export default LRUCache
}
