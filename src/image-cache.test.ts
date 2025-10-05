import { beforeEach, describe, expect, test } from 'bun:test'
import { FileSystemImageCache, YgoApi } from '.'

describe('FileSystemImageCache', () => {
	let cache: FileSystemImageCache

	beforeEach(() => {
		cache = new FileSystemImageCache({
			cacheDir: '.cache/test/ygoapi/images',
			maxAge: 1000, // 1 second for testing
		})
	})

	test('should create cache with default options', () => {
		const defaultCache = new FileSystemImageCache()
		expect(defaultCache).toBeDefined()
	})

	test('should download and cache image from URL', async () => {
		const imageUrl =
			'https://images.ygoprodeck.com/images/cards_small/89631139.jpg'
		const key = '89631139:small'

		// Set should download and save
		await cache.set(key, imageUrl)

		// Get should return file path
		const cachedPath = await cache.get(key)
		expect(cachedPath).toBeTruthy()
		expect(cachedPath).toContain('89631139')
		expect(cachedPath).toContain('small.jpg')
	})

	test('should return null for non-existent cache key', async () => {
		const result = await cache.get('nonexistent:default')
		expect(result).toBeNull()
	})

	test('should delete cached image', async () => {
		const imageUrl =
			'https://images.ygoprodeck.com/images/cards_small/46986414.jpg'
		const key = '46986414:small'

		await cache.set(key, imageUrl)
		const cached = await cache.get(key)
		expect(cached).toBeTruthy()

		await cache.delete(key)
		const deleted = await cache.get(key)
		expect(deleted).toBeNull()
	})

	test('should handle invalid URLs gracefully', async () => {
		const key = 'invalid:default'
		const invalidUrl = 'https://example.com/nonexistent.jpg'

		// Should not throw
		await cache.set(key, invalidUrl)

		// Should return null since download failed
		const result = await cache.get(key)
		expect(result).toBeNull()
	})

	test('should organize files by card ID', async () => {
		const cardId = '89631139'
		const defaultUrl = `https://images.ygoprodeck.com/images/cards/${cardId}.jpg`
		const smallUrl = `https://images.ygoprodeck.com/images/cards_small/${cardId}.jpg`

		await cache.set(`${cardId}:default`, defaultUrl)
		await cache.set(`${cardId}:small`, smallUrl)

		const defaultPath = await cache.get(`${cardId}:default`)
		const smallPath = await cache.get(`${cardId}:small`)

		expect(defaultPath).toBeTruthy()
		expect(smallPath).toBeTruthy()

		if (defaultPath) {
			expect(defaultPath.includes(cardId)).toBe(true)
			expect(defaultPath.includes('default.jpg')).toBe(true)
		}

		if (smallPath) {
			expect(smallPath.includes(cardId)).toBe(true)
			expect(smallPath.includes('small.jpg')).toBe(true)
		}
	})

	test('should cleanup old files', async () => {
		const imageUrl =
			'https://images.ygoprodeck.com/images/cards_small/89631139.jpg'
		const key = '89631139:small'

		await cache.set(key, imageUrl)
		expect(await cache.get(key)).toBeTruthy()

		// Wait for file to expire
		await new Promise((resolve) => setTimeout(resolve, 1100))

		// Cleanup should remove expired files
		await cache.cleanup()

		const result = await cache.get(key)
		expect(result).toBeNull()
	})
})

describe('YgoApi Image Caching Integration', () => {
	let api: YgoApi

	beforeEach(() => {
		api = new YgoApi({
			imageCacheEnabled: true,
			imageCache: {
				cacheDir: '.cache/test/ygoapi/integration',
			},
		})
	})

	test('should initialize with image cache enabled', () => {
		expect(api).toBeDefined()
	})

	test('should cache images when fetching cards', async () => {
		const card = await api.getCardByName('Dark Magician')
		expect(card).toBeTruthy()

		// Give it a moment to cache images in background
		await new Promise((resolve) => setTimeout(resolve, 2000))

		// Check if image was cached
		if (card) {
			const imagePath = await api.getLocalImagePath(card, 'small')
			expect(imagePath).toBeTruthy()
			expect(imagePath).toContain(String(card.card_images[0].id))
		}
	})

	test('should work without image cache enabled', async () => {
		const apiNoCache = new YgoApi({
			imageCacheEnabled: false,
		})

		const card = await apiNoCache.getCardByName('Blue-Eyes White Dragon')
		expect(card).toBeTruthy()

		if (card) {
			const imagePath = await apiNoCache.getLocalImagePath(card)
			expect(imagePath).toBeNull()
		}
	})

	test('should get local image paths for different sizes', async () => {
		const card = await api.getCardByName('Red-Eyes Black Dragon')
		expect(card).toBeTruthy()

		// Wait for background caching
		await new Promise((resolve) => setTimeout(resolve, 2000))

		if (card) {
			const defaultPath = await api.getLocalImagePath(card, 'default')
			const smallPath = await api.getLocalImagePath(card, 'small')
			const croppedPath = await api.getLocalImagePath(card, 'cropped')

			expect(defaultPath).toBeTruthy()
			expect(smallPath).toBeTruthy()
			expect(croppedPath).toBeTruthy()

			expect(defaultPath).toContain('default.jpg')
			expect(smallPath).toContain('small.jpg')
			expect(croppedPath).toContain('cropped.jpg')
		}
	})

	test('should cache multiple cards from search results', async () => {
		const results = await api.searchCards('Dragon', { num: 3, offset: 0 })
		expect(results.data.length).toBeGreaterThan(0)

		// Wait for background caching
		await new Promise((resolve) => setTimeout(resolve, 3000))

		// Check if first card's image was cached
		const firstCard = results.data[0]
		const imagePath = await api.getLocalImagePath(firstCard, 'small')
		expect(imagePath).toBeTruthy()
	})

	test('should handle cleanup of image cache', async () => {
		await api.cleanupImageCache()
		// Should not throw
		expect(true).toBe(true)
	})

	test('should use custom KVStore for image cache', async () => {
		class CustomImageCache {
			private store = new Map<string, string>()

			async get(key: string): Promise<string | null> {
				return this.store.get(key) || null
			}

			async set(key: string, _value: string): Promise<void> {
				// Simulate storing file path
				this.store.set(key, `/custom/path/${key.replace(':', '/')}.jpg`)
			}

			async delete(key: string): Promise<void> {
				this.store.delete(key)
			}
		}

		const customApi = new YgoApi({
			imageCacheEnabled: true,
			imageCache: new CustomImageCache(),
		})

		const card = await customApi.getCardByName('Exodia the Forbidden One')
		expect(card).toBeTruthy()

		// Wait for caching
		await new Promise((resolve) => setTimeout(resolve, 1000))

		if (card) {
			const imagePath = await customApi.getLocalImagePath(card)
			expect(imagePath).toBeTruthy()
			expect(imagePath).toContain('/custom/path/')
		}
	})
})
