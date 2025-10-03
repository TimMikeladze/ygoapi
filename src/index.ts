// ============================================
// Type Definitions
// ============================================

// Card Types
export type CardType =
	| 'Effect Monster'
	| 'Flip Effect Monster'
	| 'Flip Tuner Effect Monster'
	| 'Gemini Monster'
	| 'Normal Monster'
	| 'Normal Tuner Monster'
	| 'Pendulum Effect Monster'
	| 'Pendulum Effect Ritual Monster'
	| 'Pendulum Flip Effect Monster'
	| 'Pendulum Normal Monster'
	| 'Pendulum Tuner Effect Monster'
	| 'Ritual Effect Monster'
	| 'Ritual Monster'
	| 'Spell Card'
	| 'Spirit Monster'
	| 'Toon Monster'
	| 'Trap Card'
	| 'Tuner Monster'
	| 'Union Effect Monster'
	| 'Fusion Monster'
	| 'Link Monster'
	| 'Pendulum Effect Fusion Monster'
	| 'Synchro Monster'
	| 'Synchro Pendulum Effect Monster'
	| 'Synchro Tuner Monster'
	| 'XYZ Monster'
	| 'XYZ Pendulum Effect Monster'
	| 'Skill Card'
	| 'Token'

// Frame Types
export type FrameType =
	| 'normal'
	| 'effect'
	| 'ritual'
	| 'fusion'
	| 'synchro'
	| 'xyz'
	| 'link'
	| 'normal_pendulum'
	| 'effect_pendulum'
	| 'ritual_pendulum'
	| 'fusion_pendulum'
	| 'synchro_pendulum'
	| 'xyz_pendulum'
	| 'spell'
	| 'trap'
	| 'token'
	| 'skill'

// Monster Races
export type MonsterRace =
	| 'Aqua'
	| 'Beast'
	| 'Beast-Warrior'
	| 'Creator-God'
	| 'Cyberse'
	| 'Dinosaur'
	| 'Divine-Beast'
	| 'Dragon'
	| 'Fairy'
	| 'Fiend'
	| 'Fish'
	| 'Insect'
	| 'Machine'
	| 'Plant'
	| 'Psychic'
	| 'Pyro'
	| 'Reptile'
	| 'Rock'
	| 'Sea Serpent'
	| 'Spellcaster'
	| 'Thunder'
	| 'Warrior'
	| 'Winged Beast'
	| 'Wyrm'
	| 'Zombie'

// Spell Races
export type SpellRace =
	| 'Normal'
	| 'Field'
	| 'Equip'
	| 'Continuous'
	| 'Quick-Play'
	| 'Ritual'

// Trap Races
export type TrapRace = 'Normal' | 'Continuous' | 'Counter'

export type CardRace = MonsterRace | SpellRace | TrapRace

// Attributes
export type Attribute =
	| 'DARK'
	| 'DIVINE'
	| 'EARTH'
	| 'FIRE'
	| 'LIGHT'
	| 'WATER'
	| 'WIND'

// Link Markers
export type LinkMarker =
	| 'Top'
	| 'Bottom'
	| 'Left'
	| 'Right'
	| 'Bottom-Left'
	| 'Bottom-Right'
	| 'Top-Left'
	| 'Top-Right'

// Formats
export type Format =
	| 'tcg'
	| 'goat'
	| 'ocg goat'
	| 'speed duel'
	| 'master duel'
	| 'rush duel'
	| 'duel links'
	| 'genesys'

// Banlist Types
export type BanlistType = 'TCG' | 'OCG' | 'Goat'

// Sort Options
export type SortOption =
	| 'atk'
	| 'def'
	| 'name'
	| 'type'
	| 'level'
	| 'id'
	| 'new'

// Comparison Operators
export type ComparisonOperator = 'lt' | 'lte' | 'gt' | 'gte'

// Languages
export type Language = 'fr' | 'de' | 'it' | 'pt'

// Date Region
export type DateRegion = 'tcg' | 'ocg'

// ============================================
// Response Interfaces
// ============================================

export interface CardSet {
	set_name: string
	set_code: string
	set_rarity: string
	set_rarity_code: string
	set_price: string
	set_edition?: string // When using tcgplayer_data
	set_url?: string // When using tcgplayer_data
}

export interface CardImage {
	id: number
	image_url: string
	image_url_small: string
	image_url_cropped: string
}

export interface CardPrice {
	cardmarket_price: string
	tcgplayer_price: string
	ebay_price: string
	amazon_price: string
	coolstuffinc_price: string
}

export interface BanlistInfo {
	ban_tcg?: string
	ban_ocg?: string
	ban_goat?: string
}

export interface Card {
	id: number
	name: string
	type: CardType
	frameType: FrameType
	desc: string
	ygoprodeck_url: string

	// Monster specific
	atk?: number
	def?: number
	level?: number
	race: CardRace
	attribute?: Attribute

	// Pendulum specific
	scale?: number

	// Link specific
	linkval?: number
	linkmarkers?: LinkMarker[]

	// Arrays
	card_sets?: CardSet[]
	card_images: CardImage[]
	card_prices: CardPrice[]
	banlist_info?: BanlistInfo

	// Archetype
	archetype?: string

	// Misc info (when misc=yes)
	misc_info?: Array<{
		beta_name?: string
		views?: number
		viewsweek?: number
		upvotes?: number
		downvotes?: number
		formats?: Format[]
		treated_as?: string
		tcg_date?: string
		ocg_date?: string
		konami_id?: string
		md_rarity?: string
		has_effect?: 0 | 1
		genesys_points?: number
	}>
}

export interface CardInfoResponse {
	data: Card[]
	meta?: PaginationMeta
}

export interface PaginationMeta {
	current_rows: number
	total_rows: number
	rows_remaining: number
	total_pages: number
	pages_remaining: number
	next_page: string
	next_page_offset: number
}

export interface CardSetInfo {
	set_name: string
	set_code: string
	num_of_cards: number
	tcg_date?: string
}

export interface CardSetDetails {
	id: number
	name: string
	set_name: string
	set_code: string
	set_rarity: string
	set_price: string
}

export interface Archetype {
	archetype_name: string
}

export interface DatabaseVersion {
	database_version: string
	last_update: string
}

// ============================================
// Request Parameters
// ============================================

export interface CardInfoParams {
	// Card identification
	name?: string
	fname?: string
	id?: string | number
	konami_id?: string | number

	// Card properties
	type?: CardType
	atk?: number | `${ComparisonOperator}${number}`
	def?: number | `${ComparisonOperator}${number}`
	level?: number | `${ComparisonOperator}${number}`
	race?: CardRace | CardRace[]
	attribute?: Attribute | Attribute[]

	// Link specific
	link?: number
	linkmarker?: LinkMarker | LinkMarker[]

	// Pendulum specific
	scale?: number

	// Set/Archetype
	cardset?: string
	archetype?: string

	// Format/Banlist
	banlist?: BanlistType
	format?: Format

	// Filters
	staple?: 'yes'
	has_effect?: boolean

	// Date filters
	startdate?: string // YYYY-MM-DD
	enddate?: string // YYYY-MM-DD
	dateregion?: DateRegion

	// Sorting/Pagination
	sort?: SortOption
	num?: number
	offset?: number

	// Additional options
	misc?: 'yes'
	tcgplayer_data?: boolean

	// Language
	language?: Language
}

// ============================================
// KV Store Interface
// ============================================

export interface KVStore {
	get(key: string): Promise<string | null> | string | null
	set(key: string, value: string, ttl?: number): Promise<void> | void
	delete?(key: string): Promise<void> | void
}

// ============================================
// Time Queue Interface
// ============================================

export interface TimeQueue {
	enqueue<T>(task: () => Promise<T>, signal: AbortSignal): Promise<T>
}

// ============================================
// Filesystem Cache Options
// ============================================

export interface FileSystemCacheOptions {
	cacheDir?: string // Default: '.cache/ygoapi/images' for images, '.cache/ygoapi/data' for API responses
	maxAge?: number // Max file age in ms (for cleanup)
}

// ============================================
// Filesystem KV Store (for API responses)
// ============================================

export class FileSystemKVStore implements KVStore {
	private cacheDir: string
	private maxAge: number
	private ttlMap: Map<string, number> = new Map()

	constructor(options: FileSystemCacheOptions = {}) {
		this.cacheDir = options.cacheDir || '.cache/ygoapi/data'
		this.maxAge = options.maxAge || 5 * 60 * 1000 // 5 minutes default
	}

	/**
	 * Get cached data
	 * @param key - Cache key
	 * @returns Cached value if exists and not expired, null otherwise
	 */
	async get(key: string): Promise<string | null> {
		const filePath = this.keyToPath(key)

		try {
			const { access, readFile, stat } = await import('node:fs/promises')

			// Check if file exists
			await access(filePath)

			// Check if expired
			const stats = await stat(filePath)
			const now = Date.now()

			// Use TTL from map if available, otherwise use maxAge
			const ttl = this.ttlMap.get(key) || this.maxAge

			if (now - stats.mtimeMs > ttl) {
				// File is expired, delete it
				await this.delete(key)
				this.ttlMap.delete(key)
				return null
			}

			// Read and return data
			const data = await readFile(filePath, 'utf-8')
			return data
		} catch {
			return null
		}
	}

	/**
	 * Set cached data
	 * @param key - Cache key
	 * @param value - Value to cache
	 * @param ttl - Time to live in milliseconds (optional, uses maxAge if not provided)
	 */
	async set(key: string, value: string, ttl?: number): Promise<void> {
		const filePath = this.keyToPath(key)

		try {
			const { mkdir, writeFile } = await import('node:fs/promises')
			const { dirname } = await import('node:path')

			// Ensure directory exists
			await mkdir(dirname(filePath), { recursive: true })

			// Write data
			await writeFile(filePath, value, 'utf-8')

			// Store TTL for this key if provided
			if (ttl !== undefined) {
				this.ttlMap.set(key, ttl)
			}
		} catch {
			// Silent fail
		}
	}

	/**
	 * Delete cached data
	 * @param key - Cache key
	 */
	async delete(key: string): Promise<void> {
		const filePath = this.keyToPath(key)

		try {
			const { unlink } = await import('node:fs/promises')
			await unlink(filePath)
			this.ttlMap.delete(key)
		} catch {
			// Silent fail
		}
	}

	/**
	 * Convert cache key to file path
	 * @param key - Cache key (e.g., "ygoapi:/cardinfo.php:{params}")
	 * @returns Full file path
	 */
	private keyToPath(key: string): string {
		// Hash the key to create a safe filename
		const crypto = require('node:crypto')
		const hash = crypto.createHash('sha256').update(key).digest('hex')

		const pathModule = require('node:path')
		return pathModule.join(this.cacheDir, `${hash}.json`)
	}

	/**
	 * Clean up old cached files
	 * Removes files older than maxAge
	 */
	async cleanup(): Promise<void> {
		const now = Date.now()

		const walk = async (dir: string): Promise<void> => {
			try {
				const { readdir, stat, unlink } = await import('node:fs/promises')

				const entries = await readdir(dir, { withFileTypes: true })

				for (const entry of entries) {
					const { join } = await import('node:path')
					const fullPath = join(dir, entry.name)

					if (entry.isDirectory()) {
						await walk(fullPath)
					} else if (entry.name.endsWith('.json')) {
						const stats = await stat(fullPath)
						if (now - stats.mtimeMs > this.maxAge) {
							await unlink(fullPath)
						}
					}
				}
			} catch {
				// Silent fail
			}
		}

		await walk(this.cacheDir)
	}
}

// ============================================
// Filesystem Image Cache
// ============================================

export class FileSystemImageCache implements KVStore {
	private cacheDir: string
	private maxAge: number

	constructor(options: FileSystemCacheOptions = {}) {
		this.cacheDir = options.cacheDir || '.cache/ygoapi/images'
		this.maxAge = options.maxAge || 30 * 24 * 60 * 60 * 1000 // 30 days default
	}

	/**
	 * Get cached image path
	 * @param key - Format: "cardId:size" (e.g., "89631139:default")
	 * @returns File path if exists, null otherwise
	 */
	async get(key: string): Promise<string | null> {
		const filePath = this.keyToPath(key)

		try {
			const { access } = await import('node:fs/promises')
			await access(filePath)
			return filePath
		} catch {
			return null
		}
	}

	/**
	 * Download and cache image from URL
	 * @param key - Format: "cardId:size"
	 * @param value - Source URL to download from
	 */
	async set(key: string, value: string, _ttl?: number): Promise<void> {
		const filePath = this.keyToPath(key)

		try {
			const { mkdir, writeFile } = await import('node:fs/promises')
			const { dirname } = await import('node:path')

			// Ensure directory exists
			await mkdir(dirname(filePath), { recursive: true })

			// Download image
			const response = await fetch(value)
			if (!response.ok) {
				throw new Error(
					`Failed to download image: ${response.status} ${response.statusText}`,
				)
			}

			const buffer = await response.arrayBuffer()
			await writeFile(filePath, Buffer.from(buffer))
		} catch {
			// Silent fail - will use original URL
		}
	}

	/**
	 * Delete cached image
	 * @param key - Format: "cardId:size"
	 */
	async delete(key: string): Promise<void> {
		const filePath = this.keyToPath(key)

		try {
			const { unlink } = await import('node:fs/promises')
			await unlink(filePath)
		} catch {
			// Silent fail
		}
	}

	/**
	 * Convert cache key to file path
	 * @param key - Format: "cardId:size"
	 * @returns Full file path
	 */
	private keyToPath(key: string): string {
		const [cardId, size] = key.split(':')
		// Use dynamic import for path to support both Node and edge environments
		const pathModule = require('node:path')
		return pathModule.join(this.cacheDir, cardId, `${size}.jpg`)
	}

	/**
	 * Clean up old cached images
	 * Removes files older than maxAge
	 */
	async cleanup(): Promise<void> {
		const now = Date.now()

		const walk = async (dir: string): Promise<void> => {
			try {
				const { readdir, stat, unlink } = await import('node:fs/promises')

				const entries = await readdir(dir, { withFileTypes: true })

				for (const entry of entries) {
					const { join } = await import('node:path')
					const fullPath = join(dir, entry.name)

					if (entry.isDirectory()) {
						await walk(fullPath)
					} else {
						const stats = await stat(fullPath)
						if (now - stats.mtimeMs > this.maxAge) {
							await unlink(fullPath)
						}
					}
				}
			} catch {
				// Silent fail
			}
		}

		await walk(this.cacheDir)
	}
}

// ============================================
// Configuration Interfaces
// ============================================

export interface RetryConfig {
	maxAttempts?: number
	baseDelay?: number
	maxDelay?: number
	backoffFactor?: number
}

export interface FallbackConfig {
	urls?: string[]
	timeout?: number
}

export interface YgoApiOptions {
	headers?: HeadersInit
	cache?: KVStore
	requestQueue?: TimeQueue
	cacheTtl?: number
	retry?: RetryConfig
	fallback?: FallbackConfig
	imageCache?: FileSystemCacheOptions | KVStore
	imageCacheEnabled?: boolean
}

// ============================================
// API Error
// ============================================

export class YgoApiError extends Error {
	constructor(
		public statusCode: number,
		message: string,
	) {
		super(message)
		this.name = 'YgoApiError'
	}
}

// ============================================
// API Client
// ============================================

export class YgoApi {
	private readonly baseURL = 'https://db.ygoprodeck.com/api/v7'
	private readonly headers: HeadersInit
	private readonly cache?: KVStore
	private readonly requestQueue?: TimeQueue
	private readonly cacheTtl: number
	private readonly retryConfig: Required<RetryConfig>
	private readonly fallbackConfig: Required<FallbackConfig>
	private readonly imageCache?: KVStore
	private readonly imageCacheEnabled: boolean

	constructor(options?: YgoApiOptions) {
		this.headers = {
			'Content-Type': 'application/json',
			...options?.headers,
		}
		this.cache = options?.cache
		this.requestQueue = options?.requestQueue
		this.cacheTtl = options?.cacheTtl ?? 300000 // 5 minutes default
		this.retryConfig = {
			maxAttempts: options?.retry?.maxAttempts ?? 3,
			baseDelay: options?.retry?.baseDelay ?? 1000,
			maxDelay: options?.retry?.maxDelay ?? 10000,
			backoffFactor: options?.retry?.backoffFactor ?? 2,
		}
		this.fallbackConfig = {
			urls: options?.fallback?.urls ?? [],
			timeout: options?.fallback?.timeout ?? 5000,
		}

		// Initialize image cache
		this.imageCacheEnabled = options?.imageCacheEnabled ?? false

		if (this.imageCacheEnabled && !options?.imageCache) {
			// Auto-initialize with default filesystem cache
			this.imageCache = new FileSystemImageCache()
		} else if (options?.imageCache) {
			// Use provided cache (either FileSystemCacheOptions or KVStore)
			if (
				typeof options.imageCache === 'object' &&
				'cacheDir' in options.imageCache
			) {
				this.imageCache = new FileSystemImageCache(options.imageCache)
			} else {
				this.imageCache = options.imageCache as KVStore
			}
		}
	}

	/**
	 * Build query string from parameters
	 */
	private buildQueryString(params?: Record<string, any>): string {
		if (!params) return ''

		const query = new URLSearchParams()

		Object.entries(params).forEach(([key, value]) => {
			if (value === undefined || value === null) return

			if (Array.isArray(value)) {
				query.append(key, value.join(','))
			} else if (typeof value === 'boolean') {
				query.append(key, value.toString())
			} else {
				query.append(key, String(value))
			}
		})

		const queryString = query.toString()
		return queryString ? `?${queryString}` : ''
	}

	/**
	 * Sleep utility for retry delays
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	/**
	 * Generate cache key from endpoint and parameters
	 */
	private getCacheKey(endpoint: string, params?: Record<string, any>): string {
		const sortedParams = params
			? JSON.stringify(params, Object.keys(params).sort())
			: ''
		return `ygoapi:${endpoint}:${sortedParams}`
	}

	/**
	 * Try to get data from cache
	 */
	private async getCached<T>(cacheKey: string): Promise<T | null> {
		if (!this.cache) return null

		try {
			const cached = await this.cache.get(cacheKey)
			return cached ? JSON.parse(cached) : null
		} catch {
			return null
		}
	}

	/**
	 * Store data in cache
	 */
	private async setCached<T>(cacheKey: string, data: T): Promise<void> {
		if (!this.cache) return

		try {
			await this.cache.set(cacheKey, JSON.stringify(data), this.cacheTtl)
		} catch {
			// Silently fail cache writes
		}
	}

	/**
	 * Cache card images to local filesystem
	 */
	private async cacheCardImages(card: Card): Promise<void> {
		if (!this.imageCache) return

		for (const img of card.card_images) {
			const sizes = [
				{ url: img.image_url, key: `${img.id}:default` },
				{ url: img.image_url_small, key: `${img.id}:small` },
				{ url: img.image_url_cropped, key: `${img.id}:cropped` },
			]

			for (const { url, key } of sizes) {
				// Check if already cached
				const cached = await this.imageCache.get(key)

				if (!cached) {
					// Download and cache (fire and forget)
					const setResult = this.imageCache.set(key, url)
					if (setResult instanceof Promise) {
						setResult.catch(() => {
							// Silent fail - will use original URL
						})
					}
				}
			}
		}
	}

	/**
	 * Cache images for multiple cards in background
	 */
	private cacheImagesInBackground(data: CardInfoResponse | Card): void {
		if (!this.imageCacheEnabled || !this.imageCache) return

		const cards = Array.isArray(data)
			? data
			: (data as CardInfoResponse).data || [data as Card]

		// Fire and forget - don't block response
		Promise.all(cards.map((card) => this.cacheCardImages(card))).catch(() => {
			// Silent fail
		})
	}

	/**
	 * Check if response contains card data
	 */
	private isCardResponse(data: any): boolean {
		return data?.data?.[0]?.card_images !== undefined
	}

	/**
	 * Perform API request with retry and caching
	 */
	private async request<T>(
		endpoint: string,
		params?: Record<string, any>,
	): Promise<T> {
		// Validate offset/num parameters
		if (
			params &&
			((params.offset !== undefined && params.num === undefined) ||
				(params.num !== undefined && params.offset === undefined))
		) {
			throw new YgoApiError(
				400,
				"You cannot use only one of 'offset' or 'num'. You must use both or none.",
			)
		}

		const cacheKey = this.getCacheKey(endpoint, params)

		// Try cache first
		const cached = await this.getCached<T>(cacheKey)
		if (cached) return cached

		const urls = [this.baseURL, ...this.fallbackConfig.urls]
		let lastError: Error | undefined

		for (const baseUrl of urls) {
			const url = `${baseUrl}${endpoint}${this.buildQueryString(params)}`

			for (
				let attempt = 1;
				attempt <= this.retryConfig.maxAttempts;
				attempt++
			) {
				try {
					const controller = new AbortController()
					const timeoutId = setTimeout(
						() => controller.abort(),
						this.fallbackConfig.timeout,
					)

					const task = async () =>
						fetch(url, {
							method: 'GET',
							headers: this.headers,
							signal: controller.signal,
						})

					let response: Response

					if (this.requestQueue) {
						response = await this.requestQueue.enqueue(task, controller.signal)
					} else {
						response = await task()
					}

					clearTimeout(timeoutId)
					const data = await response.json()

					if (!response.ok) {
						throw new YgoApiError(
							response.status,
							data.error || `API request failed with status ${response.status}`,
						)
					}

					// Cache successful response
					await this.setCached(cacheKey, data)

					// Cache images in background if enabled
					if (this.isCardResponse(data)) {
						this.cacheImagesInBackground(data)
					}

					return data
				} catch (error) {
					lastError = error instanceof Error ? error : new Error(String(error))

					if (error instanceof YgoApiError && error.statusCode < 500) {
						// Don't retry client errors
						break
					}

					if (attempt < this.retryConfig.maxAttempts) {
						const delay = Math.min(
							this.retryConfig.baseDelay *
								this.retryConfig.backoffFactor ** (attempt - 1),
							this.retryConfig.maxDelay,
						)
						await this.sleep(delay)
					}
				}
			}
		}

		// All attempts failed
		if (lastError instanceof YgoApiError) {
			throw lastError
		}
		throw new YgoApiError(
			500,
			`Network error: ${lastError?.message || 'Unknown error'}`,
		)
	}

	/**
	 * Get card information
	 * @param params - Query parameters
	 * @returns Card information response
	 */
	async getCardInfo(params?: CardInfoParams): Promise<CardInfoResponse> {
		return this.request<CardInfoResponse>('/cardinfo.php', params)
	}

	/**
	 * Get a single card by name
	 * @param name - Exact card name
	 * @returns Single card or null if not found
	 */
	async getCardByName(name: string): Promise<Card | null> {
		try {
			const response = await this.getCardInfo({ name })
			return response.data[0] || null
		} catch (error) {
			if (error instanceof YgoApiError && error.statusCode === 400) {
				return null
			}
			throw error
		}
	}

	/**
	 * Get a single card by ID
	 * @param id - Card ID (passcode)
	 * @returns Single card or null if not found
	 */
	async getCardById(id: string | number): Promise<Card | null> {
		try {
			const response = await this.getCardInfo({ id })
			return response.data[0] || null
		} catch (error) {
			if (error instanceof YgoApiError && error.statusCode === 400) {
				return null
			}
			throw error
		}
	}

	/**
	 * Search cards by fuzzy name
	 * @param fname - Fuzzy search string
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async searchCards(
		fname: string,
		params?: Omit<CardInfoParams, 'fname'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, fname })
	}

	/**
	 * Get cards by archetype
	 * @param archetype - Archetype name
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsByArchetype(
		archetype: string,
		params?: Omit<CardInfoParams, 'archetype'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, archetype })
	}

	/**
	 * Get cards by set
	 * @param cardset - Card set name
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsBySet(
		cardset: string,
		params?: Omit<CardInfoParams, 'cardset'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, cardset })
	}

	/**
	 * Get a random card
	 * @returns Random card
	 */
	async getRandomCard(): Promise<Card> {
		const response = await this.request<CardInfoResponse>('/randomcard.php')
		return response.data[0]
	}

	/**
	 * Get all card sets
	 * @returns Array of card sets
	 */
	async getAllCardSets(): Promise<CardSetInfo[]> {
		return this.request<CardSetInfo[]>('/cardsets.php')
	}

	/**
	 * Get card set information
	 * @param setcode - Set code
	 * @returns Card set details
	 */
	async getCardSetInfo(setcode: string): Promise<CardSetDetails> {
		return this.request<CardSetDetails>('/cardsetsinfo.php', { setcode })
	}

	/**
	 * Get all archetypes
	 * @returns Array of archetypes
	 */
	async getAllArchetypes(): Promise<Archetype[]> {
		return this.request<Archetype[]>('/archetypes.php')
	}

	/**
	 * Check database version
	 * @returns Database version information
	 */
	async checkDatabaseVersion(): Promise<DatabaseVersion> {
		const response = await this.request<DatabaseVersion[]>('/checkDBVer.php')
		return response[0]
	}

	/**
	 * Get staple cards
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getStapleCards(
		params?: Omit<CardInfoParams, 'staple'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, staple: 'yes' })
	}

	/**
	 * Get cards by format
	 * @param format - Card format
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsByFormat(
		format: Format,
		params?: Omit<CardInfoParams, 'format'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, format })
	}

	/**
	 * Get cards in Genesys format with their point values
	 * @param params - Additional parameters
	 * @returns Card information response with genesys_points included in misc_info
	 */
	async getCardsByGenesysFormat(
		params?: Omit<CardInfoParams, 'format' | 'misc'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, format: 'genesys', misc: 'yes' })
	}

	/**
	 * Get banned/limited cards
	 * @param banlist - Banlist type
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getBanlistCards(
		banlist: BanlistType,
		params?: Omit<CardInfoParams, 'banlist'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, banlist })
	}

	/**
	 * Get cards with pagination
	 * @param num - Number of cards per page
	 * @param offset - Offset for pagination
	 * @param params - Additional parameters
	 * @returns Card information response with pagination metadata
	 */
	async getCardsWithPagination(
		num: number,
		offset: number,
		params?: Omit<CardInfoParams, 'num' | 'offset'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, num, offset })
	}

	/**
	 * Get cards by type
	 * @param type - Card type
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsByType(
		type: CardType,
		params?: Omit<CardInfoParams, 'type'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, type })
	}

	/**
	 * Get cards by attribute
	 * @param attribute - Card attribute
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsByAttribute(
		attribute: Attribute,
		params?: Omit<CardInfoParams, 'attribute'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, attribute })
	}

	/**
	 * Get cards by race
	 * @param race - Card race
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsByRace(
		race: CardRace,
		params?: Omit<CardInfoParams, 'race'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, race })
	}

	/**
	 * Get cards by level
	 * @param level - Card level or comparison
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsByLevel(
		level: number | `${ComparisonOperator}${number}`,
		params?: Omit<CardInfoParams, 'level'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, level })
	}

	/**
	 * Get cards by ATK value
	 * @param atk - ATK value or comparison
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsByATK(
		atk: number | `${ComparisonOperator}${number}`,
		params?: Omit<CardInfoParams, 'atk'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, atk })
	}

	/**
	 * Get cards by DEF value
	 * @param def - DEF value or comparison
	 * @param params - Additional parameters
	 * @returns Card information response
	 */
	async getCardsByDEF(
		def: number | `${ComparisonOperator}${number}`,
		params?: Omit<CardInfoParams, 'def'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, def })
	}

	/**
	 * Get cards with misc info
	 * @param params - Additional parameters
	 * @returns Card information response with misc info
	 */
	async getCardsWithMiscInfo(
		params?: Omit<CardInfoParams, 'misc'>,
	): Promise<CardInfoResponse> {
		return this.getCardInfo({ ...params, misc: 'yes' })
	}

	/**
	 * Get local filesystem path for cached card image
	 * @param card - Card object
	 * @param size - Image size (default, small, or cropped)
	 * @returns Local file path if cached, null otherwise
	 */
	async getLocalImagePath(
		card: Card,
		size: 'default' | 'small' | 'cropped' = 'default',
	): Promise<string | null> {
		if (!this.imageCache) return null

		const imageId = card.card_images[0]?.id
		if (!imageId) return null

		const key = `${imageId}:${size}`
		return await this.imageCache.get(key)
	}

	/**
	 * Clean up old cached images
	 * Only works with FileSystemImageCache
	 */
	async cleanupImageCache(): Promise<void> {
		if (this.imageCache instanceof FileSystemImageCache) {
			await this.imageCache.cleanup()
		}
	}
}

// ============================================
// Helper Functions
// ============================================

/**
 * Build a comparison query for ATK/DEF/Level
 * @param operator - Comparison operator
 * @param value - Value to compare
 * @returns Formatted comparison string
 */
export function buildComparison(
	operator: ComparisonOperator,
	value: number,
): `${ComparisonOperator}${number}` {
	return `${operator}${value}`
}

/**
 * Parse card image URLs from a card
 * @param card - Card object
 * @returns Object with image URLs
 */
export function getCardImages(card: Card): {
	default: CardImage
	alternates: CardImage[]
} {
	const [defaultImage, ...alternates] = card.card_images
	return {
		default: defaultImage,
		alternates,
	}
}

/**
 * Check if a card is a monster
 * @param card - Card object
 * @returns True if the card is a monster
 */
export function isMonsterCard(card: Card): boolean {
	return !card.type.includes('Spell') && !card.type.includes('Trap')
}

/**
 * Check if a card is a spell
 * @param card - Card object
 * @returns True if the card is a spell
 */
export function isSpellCard(card: Card): boolean {
	return card.type.includes('Spell')
}

/**
 * Check if a card is a trap
 * @param card - Card object
 * @returns True if the card is a trap
 */
export function isTrapCard(card: Card): boolean {
	return card.type.includes('Trap')
}

/**
 * Check if a card is an extra deck monster
 * @param card - Card object
 * @returns True if the card is an extra deck monster
 */
export function isExtraDeckMonster(card: Card): boolean {
	const extraDeckTypes: CardType[] = [
		'Fusion Monster',
		'Link Monster',
		'Pendulum Effect Fusion Monster',
		'Synchro Monster',
		'Synchro Pendulum Effect Monster',
		'Synchro Tuner Monster',
		'XYZ Monster',
		'XYZ Pendulum Effect Monster',
	]
	return extraDeckTypes.includes(card.type)
}
