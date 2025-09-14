import { beforeEach, describe, expect, test } from 'bun:test'
import {
	type Attribute,
	type CardRace,
	type CardType,
	type KVStore,
	YgoApi,
} from '.'

// Simple in-memory KV store implementation for testing
class TestKVStore implements KVStore {
	private store = new Map<string, { value: string; expires?: number }>()

	get(key: string): string | null {
		const item = this.store.get(key)
		if (!item) return null

		if (item.expires && Date.now() > item.expires) {
			this.store.delete(key)
			return null
		}

		return item.value
	}

	set(key: string, value: string, ttl?: number): void {
		const expires = ttl ? Date.now() + ttl : undefined
		this.store.set(key, { value, expires })
	}

	delete(key: string): void {
		this.store.delete(key)
	}

	// Test utilities
	clear(): void {
		this.store.clear()
	}

	size(): number {
		return this.store.size
	}

	hasKey(key: string): boolean {
		return this.store.has(key)
	}
}

describe('Cache Functionality', () => {
	let cache: TestKVStore
	let api: YgoApi

	beforeEach(() => {
		cache = new TestKVStore()
		api = new YgoApi({
			cache,
			cacheTtl: 5000, // 5 seconds for testing
		})
	})

	test('should cache successful API responses', async () => {
		// First request should hit the API and cache the result
		const result1 = await api.getCardByName('Dark Magician')
		expect(result1).toBeTruthy()
		expect(cache.size()).toBe(1)

		// Second request should come from cache
		const result2 = await api.getCardByName('Dark Magician')
		expect(result2).toEqual(result1)
		expect(cache.size()).toBe(1) // Still only one cache entry
	})

	test('should generate consistent cache keys for same requests', async () => {
		await api.getCardByName('Blue-Eyes White Dragon')
		expect(cache.size()).toBe(1)

		// Same request should use same cache key
		await api.getCardByName('Blue-Eyes White Dragon')
		expect(cache.size()).toBe(1)
	})

	test('should generate different cache keys for different requests', async () => {
		await api.getCardByName('Dark Magician')
		expect(cache.size()).toBe(1)

		await api.getCardByName('Blue-Eyes White Dragon')
		expect(cache.size()).toBe(2)

		await api.getCardById('89631139')
		expect(cache.size()).toBe(3)
	})

	test('should cache search results with parameters', async () => {
		const _params = { fname: 'Magician', num: 3, offset: 0 }

		const result1 = await api.searchCards('Magician', { num: 3, offset: 0 })
		expect(cache.size()).toBe(1)

		const result2 = await api.searchCards('Magician', { num: 3, offset: 0 })
		expect(result2).toEqual(result1)
		expect(cache.size()).toBe(1)
	})

	test('should create different cache entries for different parameters', async () => {
		await api.searchCards('Magician', { num: 3, offset: 0 })
		expect(cache.size()).toBe(1)

		await api.searchCards('Magician', { num: 5, offset: 0 })
		expect(cache.size()).toBe(2)

		await api.searchCards('Magician', { num: 3, offset: 10 })
		expect(cache.size()).toBe(3)
	})

	test('should generate consistent cache keys regardless of parameter order', async () => {
		// These should generate the same cache key
		await api.getCardInfo({ name: 'Dark Magician', type: 'Normal Monster' })
		expect(cache.size()).toBe(1)

		await api.getCardInfo({ type: 'Normal Monster', name: 'Dark Magician' })
		expect(cache.size()).toBe(1) // Same cache entry
	})

	test('should cache complex queries with multiple parameters', async () => {
		const params = {
			attribute: 'DARK' as Attribute,
			type: 'Effect Monster' as CardType,
			atk: 'gte2000' as const,
			num: 5,
			offset: 0,
		}

		const result1 = await api.getCardInfo(params)
		expect(cache.size()).toBe(1)

		const result2 = await api.getCardInfo(params)
		expect(result2).toEqual(result1)
		expect(cache.size()).toBe(1)
	})

	test('should cache array parameters correctly', async () => {
		const params = {
			attribute: ['DARK', 'LIGHT'] as Attribute[],
			race: ['Spellcaster', 'Warrior'] as CardRace[],
			num: 3,
			offset: 0,
		}

		await api.getCardInfo(params)
		expect(cache.size()).toBe(1)

		// Same array values should use same cache
		await api.getCardInfo(params)
		expect(cache.size()).toBe(1)
	})

	test('should not cache when no cache is provided', async () => {
		const apiWithoutCache = new YgoApi()

		// This should work but not use caching
		const result = await apiWithoutCache.getCardByName('Dark Magician')
		expect(result).toBeTruthy()
		expect(cache.size()).toBe(0) // Our test cache should be empty
	})

	test('should handle cache get failures gracefully', async () => {
		// Override get method to throw error
		const originalGet = cache.get
		cache.get = () => {
			throw new Error('Cache read failed')
		}

		// Should still work by hitting the API
		const result = await api.getCardByName('Dark Magician')
		expect(result).toBeTruthy()

		// Restore original method
		cache.get = originalGet
	})

	test('should handle cache set failures gracefully', async () => {
		// Override set method to throw error
		const originalSet = cache.set
		cache.set = () => {
			throw new Error('Cache write failed')
		}

		// Should still work by hitting the API
		const result = await api.getCardByName('Dark Magician')
		expect(result).toBeTruthy()
		expect(cache.size()).toBe(0) // Cache should be empty due to failed write

		// Restore original method
		cache.set = originalSet
	})

	test('should handle malformed cached data gracefully', async () => {
		// Manually insert invalid JSON into cache
		const cacheKey = 'ygoapi:/cardinfo.php:{"name":"Dark Magician"}'
		cache.set(cacheKey, 'invalid json')

		// Should fall back to API when cache contains invalid data
		const result = await api.getCardByName('Dark Magician')
		expect(result).toBeTruthy()
	})

	test('should not cache error responses', async () => {
		// getCardByName catches 400 errors and returns null, but the underlying
		// request doesn't cache the error response
		const result1 = await api.getCardByName('Non Existent Card 12345')
		expect(result1).toBeNull()
		expect(cache.size()).toBe(0) // No cache entry for errors

		// Second call should also hit the API (not cached)
		const result2 = await api.getCardByName('Non Existent Card 12345')
		expect(result2).toBeNull()
		expect(cache.size()).toBe(0)
	})

	test('should cache convenience method results', async () => {
		await api.getCardsByType('Spell Card', { num: 3, offset: 0 })
		expect(cache.size()).toBe(1)

		await api.getCardsByAttribute('FIRE', { num: 3, offset: 0 })
		expect(cache.size()).toBe(2)

		await api.getCardsByRace('Dragon', { num: 3, offset: 0 })
		expect(cache.size()).toBe(3)
	})

	test('should cache archetype and set queries', async () => {
		await api.getCardsByArchetype('Blue-Eyes', { num: 3, offset: 0 })
		expect(cache.size()).toBe(1)

		await api.getCardsBySet('Legend of Blue Eyes White Dragon', {
			num: 3,
			offset: 0,
		})
		expect(cache.size()).toBe(2)

		await api.getStapleCards({ num: 3, offset: 0 })
		expect(cache.size()).toBe(3)
	})

	test('should cache random card endpoint', async () => {
		const result1 = await api.getRandomCard()
		expect(cache.size()).toBe(1)

		// Note: Random card will likely be different each time from API,
		// but cache should return the same result
		const result2 = await api.getRandomCard()
		expect(result2).toEqual(result1)
		expect(cache.size()).toBe(1)
	})

	test('should cache metadata endpoints', async () => {
		await api.getAllCardSets()
		expect(cache.size()).toBe(1)

		await api.getAllArchetypes()
		expect(cache.size()).toBe(2)

		await api.checkDatabaseVersion()
		expect(cache.size()).toBe(3)
	})

	test('should cache card set info queries', async () => {
		await api.getCardSetInfo('LOB-005')
		expect(cache.size()).toBe(1)

		// Second call should use cache
		await api.getCardSetInfo('LOB-005')
		expect(cache.size()).toBe(1)

		// Different set code should create new cache entry
		await api.getCardSetInfo('MRD-142')
		expect(cache.size()).toBe(2)
	})

	test('should cache banlist and format queries', async () => {
		await api.getBanlistCards('TCG', { num: 3, offset: 0 })
		expect(cache.size()).toBe(1)

		await api.getCardsByFormat('tcg', { num: 3, offset: 0 })
		expect(cache.size()).toBe(2)

		await api.getCardsWithPagination(5, 0, { sort: 'name' })
		expect(cache.size()).toBe(3)
	})
})

describe('Cache TTL and Expiration', () => {
	let cache: TestKVStore
	let api: YgoApi

	beforeEach(() => {
		cache = new TestKVStore()
		api = new YgoApi({
			cache,
			cacheTtl: 100, // Very short TTL for testing (100ms)
		})
	})

	test('should expire cache entries after TTL', async () => {
		const result1 = await api.getCardByName('Dark Magician')
		expect(cache.size()).toBe(1)

		// Wait for cache to expire
		await new Promise((resolve) => setTimeout(resolve, 150))

		// This should result in a new API call
		const result2 = await api.getCardByName('Dark Magician')
		expect(result2).toEqual(result1) // Same data
		expect(cache.size()).toBe(1) // But refreshed cache entry
	})

	test('should return fresh data before TTL expires', async () => {
		const result1 = await api.getCardByName('Dark Magician')
		expect(cache.size()).toBe(1)

		// Wait less than TTL
		await new Promise((resolve) => setTimeout(resolve, 50))

		// Should still use cache
		const result2 = await api.getCardByName('Dark Magician')
		expect(result2).toEqual(result1)
		expect(cache.size()).toBe(1)
	})

	test('should handle different TTL values', async () => {
		// Test with longer TTL
		const apiLongTtl = new YgoApi({
			cache,
			cacheTtl: 1000, // 1 second
		})

		const result = await apiLongTtl.getCardByName('Blue-Eyes White Dragon')
		expect(cache.size()).toBe(1)

		// Should still be cached after 100ms
		await new Promise((resolve) => setTimeout(resolve, 100))

		const result2 = await apiLongTtl.getCardByName('Blue-Eyes White Dragon')
		expect(result2).toEqual(result)
		expect(cache.size()).toBe(1)
	})
})

describe('Cache Performance', () => {
	let cache: TestKVStore
	let api: YgoApi

	beforeEach(() => {
		cache = new TestKVStore()
		api = new YgoApi({
			cache,
			cacheTtl: 10000, // 10 seconds
		})
	})

	test('should be faster on cache hits', async () => {
		// First call (cache miss)
		const start1 = Date.now()
		await api.getCardByName('Dark Magician')
		const time1 = Date.now() - start1

		// Second call (cache hit)
		const start2 = Date.now()
		await api.getCardByName('Dark Magician')
		const time2 = Date.now() - start2

		// Cache hit should be significantly faster (allowing for some variance)
		expect(time2).toBeLessThan(time1 / 2)
	})

	test('should handle many cache entries efficiently', async () => {
		// Create cache entries using different search parameters that will succeed
		const queries = [
			{ name: 'Dark Magician' },
			{ name: 'Blue-Eyes White Dragon' },
			{ type: 'Spell Card' as CardType, num: 1, offset: 0 },
			{ type: 'Trap Card' as CardType, num: 1, offset: 0 },
			{ attribute: 'DARK' as Attribute, num: 1, offset: 0 },
			{ attribute: 'LIGHT' as Attribute, num: 1, offset: 0 },
			{ race: 'Dragon' as CardRace, num: 1, offset: 0 },
			{ race: 'Spellcaster' as CardRace, num: 1, offset: 0 },
			{ level: 4, num: 1, offset: 0 },
			{ level: 7, num: 1, offset: 0 },
		]

		const promises = queries.map((query) => api.getCardInfo(query))
		await Promise.all(promises)
		expect(cache.size()).toBe(10)

		// Accessing any cached entry should still be fast
		const start = Date.now()
		await api.getCardInfo({ name: 'Dark Magician' })
		const time = Date.now() - start

		expect(time).toBeLessThan(10) // Should be very fast
	})
})
