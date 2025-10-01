import { describe, expect, test } from 'bun:test'
import {
	buildComparison,
	type Card,
	getCardImages,
	isExtraDeckMonster,
	isMonsterCard,
	isSpellCard,
	isTrapCard,
	YgoApi,
	YgoApiError,
} from '.'

// Test data for helper functions
const sampleMonsterCard: Card = {
	id: 46986414,
	name: 'Dark Magician',
	type: 'Normal Monster',
	frameType: 'normal',
	desc: 'The ultimate wizard in terms of attack and defense.',
	ygoprodeck_url: 'https://ygoprodeck.com/card/dark-magician-4128',
	atk: 2500,
	def: 2100,
	level: 7,
	race: 'Spellcaster',
	attribute: 'DARK',
	card_sets: [
		{
			set_name: 'Legend of Blue Eyes White Dragon',
			set_code: 'LOB-005',
			set_rarity: 'Ultra Rare',
			set_rarity_code: '(UR)',
			set_price: '89.99',
		},
	],
	card_images: [
		{
			id: 46986414,
			image_url: 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
			image_url_small:
				'https://images.ygoprodeck.com/images/cards_small/46986414.jpg',
			image_url_cropped:
				'https://images.ygoprodeck.com/images/cards_cropped/46986414.jpg',
		},
		{
			id: 46986415,
			image_url: 'https://images.ygoprodeck.com/images/cards/46986415.jpg',
			image_url_small:
				'https://images.ygoprodeck.com/images/cards_small/46986415.jpg',
			image_url_cropped:
				'https://images.ygoprodeck.com/images/cards_cropped/46986415.jpg',
		},
	],
	card_prices: [
		{
			cardmarket_price: '15.50',
			tcgplayer_price: '18.99',
			ebay_price: '20.00',
			amazon_price: '25.99',
			coolstuffinc_price: '19.99',
		},
	],
}

const sampleSpellCard: Card = {
	id: 19613556,
	name: 'Heavy Storm',
	type: 'Spell Card',
	frameType: 'spell',
	desc: 'Destroy all Spell and Trap Cards on the field.',
	ygoprodeck_url: 'https://ygoprodeck.com/card/heavy-storm-3568',
	race: 'Normal',
	card_sets: [
		{
			set_name: 'Metal Raiders',
			set_code: 'MRD-142',
			set_rarity: 'Super Rare',
			set_rarity_code: '(SR)',
			set_price: '5.99',
		},
	],
	card_images: [
		{
			id: 19613556,
			image_url: 'https://images.ygoprodeck.com/images/cards/19613556.jpg',
			image_url_small:
				'https://images.ygoprodeck.com/images/cards_small/19613556.jpg',
			image_url_cropped:
				'https://images.ygoprodeck.com/images/cards_cropped/19613556.jpg',
		},
	],
	card_prices: [
		{
			cardmarket_price: '3.50',
			tcgplayer_price: '4.99',
			ebay_price: '5.00',
			amazon_price: '6.99',
			coolstuffinc_price: '4.99',
		},
	],
}

describe('YgoApi Integration Tests', () => {
	const api = new YgoApi()

	test('should get Dark Magician by name', async () => {
		const result = await api.getCardByName('Dark Magician')
		expect(result).not.toBeNull()
		if (result) {
			expect(result.id).toBe(46986414)
			expect(result.name).toBe('Dark Magician')
			expect(result.type).toBe('Normal Monster')
			expect(result.frameType).toBe('normal')
			expect(result.desc).toBe(
				"''The ultimate wizard in terms of attack and defense.''",
			)
			expect(result.race).toBe('Spellcaster')
			expect(result.attribute).toBe('DARK')
			expect(result.archetype).toBe('Dark Magician')
			expect(result.atk).toBe(2500)
			expect(result.def).toBe(2100)
			expect(result.level).toBe(7)
			expect(result.card_images).toBeDefined()
			expect(Array.isArray(result.card_images)).toBe(true)
			expect(result.card_images.length).toBeGreaterThan(0)
		}
	})

	test('should get Blue-Eyes White Dragon by ID', async () => {
		const result = await api.getCardById('89631139')
		expect(result).not.toBeNull()
		if (result) {
			expect(result.id).toBe(89631139)
			expect(result.name).toBe('Blue-Eyes White Dragon')
			expect(result.type).toBe('Normal Monster')
			expect(result.frameType).toBe('normal')
			expect(result.desc).toContain('legendary dragon')
			expect(result.race).toBe('Dragon')
			expect(result.attribute).toBe('LIGHT')
			expect(result.archetype).toBe('Blue-Eyes')
			expect(result.atk).toBe(3000)
			expect(result.def).toBe(2500)
			expect(result.level).toBe(8)
			expect(result.card_images).toBeDefined()
			expect(Array.isArray(result.card_images)).toBe(true)
		}
	})

	test('should search for Magician cards', async () => {
		const result = await api.searchCards('Magician', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.name.toLowerCase()).toContain('magician')
			expect(card.id).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
		})
	})

	test('should get Blue-Eyes archetype cards', async () => {
		const result = await api.getCardsByArchetype('Blue-Eyes', {
			num: 5,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(5)
		result.data.forEach((card) => {
			expect(card.archetype).toBe('Blue-Eyes')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
		})
	})

	test('should get cards from Legend of Blue Eyes White Dragon set', async () => {
		const result = await api.getCardsBySet('Legend of Blue Eyes White Dragon', {
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.card_sets).toBeDefined()
			expect(Array.isArray(card.card_sets)).toBe(true)
			const hasSet = card.card_sets?.some(
				(set) => set.set_name === 'Legend of Blue Eyes White Dragon',
			)
			expect(hasSet).toBe(true)
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
		})
	})

	test('should get staple cards', async () => {
		const result = await api.getStapleCards({ num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
		})
	})

	test('should get TCG format cards', async () => {
		const result = await api.getCardsByFormat('tcg', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
		})
	})

	test('should get Genesys format cards with point values', async () => {
		const result = await api.getCardsByGenesysFormat({ num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.misc_info).toBeDefined()
			expect(Array.isArray(card.misc_info)).toBe(true)
			if (card.misc_info && card.misc_info.length > 0) {
				const miscInfo = card.misc_info[0]
				expect(miscInfo).toHaveProperty('genesys_points')
				expect(typeof miscInfo.genesys_points).toBe('number')
			}
		})
	})

	test('should get cards with pagination', async () => {
		const result = await api.getCardsWithPagination(2, 0, { sort: 'name' })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBe(2)
		expect(result.meta).toBeDefined()
		expect(result.meta?.current_rows).toBe(2)
		expect(result.meta?.total_rows).toBeGreaterThan(0)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
		})
		// Check that cards are sorted by name
		if (result.data.length > 1) {
			expect(
				result.data[0].name.localeCompare(result.data[1].name),
			).toBeLessThanOrEqual(0)
		}
	})

	test('should get random card', async () => {
		const result = await api.getRandomCard()
		// For random cards, we can't snapshot the whole object since it's random
		// Instead, we test the structure
		expect(result).toHaveProperty('id')
		expect(result).toHaveProperty('name')
		expect(result).toHaveProperty('type')
		expect(result).toHaveProperty('card_images')
		expect(Array.isArray(result.card_images)).toBe(true)
	})

	test('should get all card sets', async () => {
		const result = await api.getAllCardSets()
		// Test structure since the full list is very large
		expect(Array.isArray(result)).toBe(true)
		expect(result.length).toBeGreaterThan(0)
		expect(result[0]).toHaveProperty('set_name')
		expect(result[0]).toHaveProperty('set_code')
		expect(result[0]).toHaveProperty('num_of_cards')
	})

	test('should get all archetypes', async () => {
		const result = await api.getAllArchetypes()
		// Test structure since the full list is large
		expect(Array.isArray(result)).toBe(true)
		expect(result.length).toBeGreaterThan(0)
		expect(result[0]).toHaveProperty('archetype_name')
	})

	test('should get database version', async () => {
		const result = await api.checkDatabaseVersion()
		expect(result).toHaveProperty('database_version')
		expect(result).toHaveProperty('last_update')
	})

	test('should handle non-existent card gracefully', async () => {
		const result = await api.getCardByName('This Card Does Not Exist 12345')
		expect(result).toBeNull()
	})

	test('should handle API errors', async () => {
		// Test with invalid parameters to trigger an error
		await expect(async () => {
			await api.getCardInfo({ name: '', id: 'invalid' })
		}).toThrow(YgoApiError)
	})
})

describe('Helper Functions', () => {
	describe('buildComparison', () => {
		test('should build comparison strings correctly', () => {
			expect(buildComparison('gt', 2500)).toBe('gt2500')
			expect(buildComparison('lte', 1000)).toBe('lte1000')
			expect(buildComparison('gte', 3000)).toBe('gte3000')
			expect(buildComparison('lt', 500)).toBe('lt500')
		})
	})

	describe('getCardImages', () => {
		test('should extract card images correctly', () => {
			const result = getCardImages(sampleMonsterCard)
			expect(result).toHaveProperty('default')
			expect(result).toHaveProperty('alternates')
			expect(Array.isArray(result.alternates)).toBe(true)
			expect(result.alternates.length).toBe(1) // Sample has 1 alternate image

			// Test default image
			expect(result.default.id).toBe(46986414)
			expect(result.default.image_url).toContain(
				'https://images.ygoprodeck.com',
			)
			expect(result.default.image_url_small).toContain(
				'https://images.ygoprodeck.com',
			)
			expect(result.default.image_url_cropped).toContain(
				'https://images.ygoprodeck.com',
			)

			// Test alternate images
			result.alternates.forEach((image) => {
				expect(image.id).toBeDefined()
				expect(image.image_url).toContain('https://images.ygoprodeck.com')
			})
		})

		test('should handle card with only one image', () => {
			const result = getCardImages(sampleSpellCard)
			expect(result).toHaveProperty('default')
			expect(result).toHaveProperty('alternates')
			expect(Array.isArray(result.alternates)).toBe(true)
			expect(result.alternates.length).toBe(0) // No alternate images

			// Test default image
			expect(result.default.id).toBe(19613556)
			expect(result.default.image_url).toContain(
				'https://images.ygoprodeck.com',
			)
			expect(result.default.image_url_small).toContain(
				'https://images.ygoprodeck.com',
			)
			expect(result.default.image_url_cropped).toContain(
				'https://images.ygoprodeck.com',
			)
		})
	})

	describe('Card Type Checkers', () => {
		test('should identify monster cards correctly', () => {
			expect(isMonsterCard(sampleMonsterCard)).toBe(true)
			expect(isMonsterCard(sampleSpellCard)).toBe(false)
		})

		test('should identify spell cards correctly', () => {
			expect(isSpellCard(sampleMonsterCard)).toBe(false)
			expect(isSpellCard(sampleSpellCard)).toBe(true)
		})

		test('should identify trap cards correctly', () => {
			const trapCard: Card = {
				...sampleMonsterCard,
				type: 'Trap Card',
				frameType: 'trap',
			}

			expect(isTrapCard(sampleMonsterCard)).toBe(false)
			expect(isTrapCard(trapCard)).toBe(true)
		})

		test('should identify extra deck monsters correctly', () => {
			const fusionMonster: Card = {
				...sampleMonsterCard,
				type: 'Fusion Monster',
				frameType: 'fusion',
			}

			const synchroMonster: Card = {
				...sampleMonsterCard,
				type: 'Synchro Monster',
				frameType: 'synchro',
			}

			const xyzMonster: Card = {
				...sampleMonsterCard,
				type: 'XYZ Monster',
				frameType: 'xyz',
			}

			const linkMonster: Card = {
				...sampleMonsterCard,
				type: 'Link Monster',
				frameType: 'link',
			}

			expect(isExtraDeckMonster(sampleMonsterCard)).toBe(false)
			expect(isExtraDeckMonster(fusionMonster)).toBe(true)
			expect(isExtraDeckMonster(synchroMonster)).toBe(true)
			expect(isExtraDeckMonster(xyzMonster)).toBe(true)
			expect(isExtraDeckMonster(linkMonster)).toBe(true)
		})
	})
})

describe('YgoApiError', () => {
	test('should create error with status code and message', () => {
		const error = new YgoApiError(404, 'Card not found')

		expect(error.statusCode).toBe(404)
		expect(error.message).toBe('Card not found')
		expect(error.name).toBe('YgoApiError')
		expect(error).toBeInstanceOf(Error)
	})
})

describe('API Client Options', () => {
	test('should accept custom headers', () => {
		const customApi = new YgoApi({
			headers: {
				'User-Agent': 'Custom User Agent',
				'X-Custom-Header': 'test-value',
			},
		})

		// Test that the client can be instantiated with custom headers
		expect(customApi).toBeInstanceOf(YgoApi)
	})
})

describe('Advanced Search Parameters', () => {
	const api = new YgoApi()

	test('should filter by ATK value with comparison operators', async () => {
		const result = await api.getCardInfo({
			atk: 'gte2500',
			type: 'Effect Monster',
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toBe('Effect Monster')
			if (card.atk !== undefined) {
				expect(card.atk).toBeGreaterThanOrEqual(2500)
			}
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
		})
	})

	test('should filter by DEF value with comparison operators', async () => {
		const result = await api.getCardInfo({
			def: 'lt1000',
			type: 'Normal Monster',
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toBe('Normal Monster')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.desc).toBeDefined()
			if (card.def !== undefined) {
				expect(card.def).toBeLessThan(1000)
			}
		})
	})

	test('should filter by level with comparison operators', async () => {
		const result = await api.getCardInfo({
			level: 'lte4',
			attribute: 'WATER',
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.attribute).toBe('WATER')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			if (card.level !== undefined) {
				expect(card.level).toBeLessThanOrEqual(4)
			}
		})
	})

	test('should filter by multiple attributes', async () => {
		const result = await api.getCardInfo({
			attribute: ['DARK', 'LIGHT'],
			type: 'Effect Monster',
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toBe('Effect Monster')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.desc).toBeDefined()
			if (card.attribute) {
				expect(['DARK', 'LIGHT']).toContain(card.attribute)
			}
		})
	})

	test('should filter by multiple races', async () => {
		const result = await api.getCardInfo({
			race: ['Spellcaster', 'Warrior'],
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(['Spellcaster', 'Warrior']).toContain(card.race)
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
		})
	})
})

describe('Link Monster Tests', () => {
	const api = new YgoApi()

	test('should get Link monsters by type', async () => {
		const result = await api.getCardInfo({
			type: 'Link Monster',
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toBe('Link Monster')
			expect(card.frameType).toBe('link')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.desc).toBeDefined()
			expect(card.race).toBeDefined()
			expect(card.attribute).toBeDefined()
			expect(card.linkval).toBeDefined()
			expect(typeof card.linkval).toBe('number')
			expect(card.linkmarkers).toBeDefined()
			expect(Array.isArray(card.linkmarkers)).toBe(true)
		})
	})

	test('should filter Link monsters by link value', async () => {
		const result = await api.getCardInfo({
			type: 'Link Monster',
			link: 2,
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toBe('Link Monster')
			expect(card.linkval).toBe(2)
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.desc).toBeDefined()
			expect(card.linkmarkers).toBeDefined()
			expect(Array.isArray(card.linkmarkers)).toBe(true)
		})
	})

	test('should filter Link monsters by link markers', async () => {
		const result = await api.getCardInfo({
			type: 'Link Monster',
			linkmarker: ['Top', 'Bottom'],
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toBe('Link Monster')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.linkmarkers).toBeDefined()
			expect(Array.isArray(card.linkmarkers)).toBe(true)
			const hasTopOrBottom = card.linkmarkers?.some((marker) =>
				['Top', 'Bottom'].includes(marker),
			)
			expect(hasTopOrBottom).toBe(true)
		})
	})
})

describe('Pendulum Monster Tests', () => {
	const api = new YgoApi()

	test('should get Pendulum monsters', async () => {
		const result = await api.getCardInfo({
			type: 'Pendulum Effect Monster',
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toContain('Pendulum')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.desc).toBeDefined()
			expect(card.race).toBeDefined()
			expect(card.attribute).toBeDefined()
			expect(card.scale).toBeDefined()
			expect(typeof card.scale).toBe('number')
		})
	})

	test('should filter Pendulum monsters by scale', async () => {
		const result = await api.getCardInfo({
			type: 'Pendulum Effect Monster',
			scale: 7,
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeLessThanOrEqual(3)
		if (result.data.length > 0) {
			result.data.forEach((card) => {
				expect(card.type).toContain('Pendulum')
				expect(card.scale).toBe(7)
				expect(card.id).toBeDefined()
				expect(card.name).toBeDefined()
			})
		}
	})
})

describe('Banlist and Format Tests', () => {
	const api = new YgoApi()

	test('should get Genesys format cards using general format method', async () => {
		const result = await api.getCardsByFormat('genesys', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
		})
	})

	test('should get cards from TCG banlist', async () => {
		const result = await api.getBanlistCards('TCG', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.banlist_info).toBeDefined()
			expect(card.banlist_info?.ban_tcg).toBeDefined()
		})
	})

	test('should get cards from OCG banlist', async () => {
		const result = await api.getBanlistCards('OCG', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.banlist_info).toBeDefined()
			expect(card.banlist_info?.ban_ocg).toBeDefined()
		})
	})
})

describe('Misc Parameter and Additional Info Tests', () => {
	const api = new YgoApi()

	test('should get card with misc info', async () => {
		const result = await api.getCardInfo({
			name: 'Blue-Eyes White Dragon',
			misc: 'yes',
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		const card = result.data[0]
		expect(card.id).toBeDefined()
		expect(card.name).toBe('Blue-Eyes White Dragon')
		expect(card.type).toBeDefined()
		expect(card.desc).toBeDefined()
		expect(card.misc_info).toBeDefined()
		expect(Array.isArray(card.misc_info)).toBe(true)
		if (card.misc_info && card.misc_info.length > 0) {
			const miscInfo = card.misc_info[0]
			// Note: We don't test specific values like views as they're dynamic
			expect(typeof miscInfo).toBe('object')
		}
	})
})

describe('Has Effect Parameter Tests', () => {
	const api = new YgoApi()

	test('should filter cards with effects', async () => {
		const result = await api.getCardInfo({
			has_effect: true,
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toBeDefined()
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.desc).toBeDefined()
			// Only monsters have race and attribute
			if (card.type.includes('Monster')) {
				expect(card.race).toBeDefined()
				expect(card.attribute).toBeDefined()
			}
		})
	})

	test('should filter cards without effects', async () => {
		const result = await api.getCardInfo({
			has_effect: false,
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
		})
	})
})

describe('Date Filtering Tests', () => {
	const api = new YgoApi()

	test('should filter cards by date range', async () => {
		const result = await api.getCardInfo({
			startdate: '2000-01-01',
			enddate: '2005-12-31',
			dateregion: 'tcg',
			num: 3,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeLessThanOrEqual(3)
		// Note: This test might not return results depending on available data
		if (result.data.length > 0) {
			result.data.forEach((card) => {
				expect(card.id).toBeDefined()
				expect(card.name).toBeDefined()
				expect(card.type).toBeDefined()
			})
		}
	})
})

describe('Multiple Values Tests', () => {
	const api = new YgoApi()

	test('should get multiple cards by names', async () => {
		const result = await api.getCardInfo({
			name: 'Dark Magician|Blue-Eyes White Dragon',
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThanOrEqual(2)
		const names = result.data.map((card) => card.name)
		expect(names).toContain('Dark Magician')
		expect(names).toContain('Blue-Eyes White Dragon')
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
		})
	})

	test('should get multiple cards by IDs', async () => {
		const result = await api.getCardInfo({
			id: '46986414,89631139', // Dark Magician, Blue-Eyes White Dragon
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThanOrEqual(2)
		const ids = result.data.map((card) => card.id)
		expect(ids).toContain(46986414)
		expect(ids).toContain(89631139)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
		})
	})
})

describe('Konami ID Tests', () => {
	const api = new YgoApi()

	test('should get card by Konami ID', async () => {
		const result = await api.getCardInfo({
			konami_id: '4007', // Blue-Eyes White Dragon's Konami ID
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		if (result.data.length > 0) {
			// Should return cards with this Konami ID if available
			expect(result.data.length).toBeGreaterThan(0)
			result.data.forEach((card) => {
				expect(card.id).toBeDefined()
				expect(card.name).toBeDefined()
				expect(card.type).toBeDefined()
			})
		}
	})
})

describe('Language Tests', () => {
	const api = new YgoApi()

	test('should get cards in French', async () => {
		const result = await api.getCardInfo({
			language: 'fr',
			archetype: 'Blue-Eyes',
			num: 2,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeLessThanOrEqual(2)
		// Test structure - cards should still have the same structure
		if (result.data.length > 0) {
			result.data.forEach((card) => {
				expect(card.archetype).toBe('Blue-Eyes')
				expect(card.id).toBeDefined()
				expect(card.name).toBeDefined()
				expect(card.type).toBeDefined()
				expect(card.desc).toBeDefined()
			})
		}
	})

	test('should get cards in German', async () => {
		const result = await api.getCardInfo({
			language: 'de',
			fname: 'Drache', // Dragon in German
			num: 2,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeLessThanOrEqual(2)
		if (result.data.length > 0) {
			result.data.forEach((card) => {
				expect(card.id).toBeDefined()
				expect(card.name).toBeDefined()
				expect(card.type).toBeDefined()
				expect(card.desc).toBeDefined()
			})
		}
	})
})

describe('TCGPlayer Data Tests', () => {
	const api = new YgoApi()

	test('should get card with TCGPlayer data', async () => {
		const result = await api.getCardInfo({
			name: 'Blue-Eyes White Dragon',
			tcgplayer_data: true,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		const card = result.data[0]
		expect(card.id).toBeDefined()
		expect(card.name).toBe('Blue-Eyes White Dragon')
		expect(card.type).toBeDefined()
		expect(card.desc).toBeDefined()
		if (card.card_sets && card.card_sets.length > 0) {
			const cardSet = card.card_sets[0]
			// TCGPlayer data might include set_edition and set_url
			expect(cardSet.set_name).toBeDefined()
			expect(cardSet.set_code).toBeDefined()
			// Note: We don't test specific price values as they're dynamic
		}
	})
})

describe('Card Set Information Tests', () => {
	const api = new YgoApi()

	test('should get card set information', async () => {
		const result = await api.getCardSetInfo('LOB-005')
		expect(result.id).toBeDefined()
		expect(result.name).toBeDefined()
		expect(result.set_name).toBeDefined()
		expect(result.set_code).toBe('LOB-005')
		expect(result.set_rarity).toBeDefined()
		// Note: We don't test specific price values as they're dynamic
		expect(result.set_price).toBeDefined()
		expect(typeof result.set_price).toBe('string')
	})
})

describe('Convenience Methods Tests', () => {
	const api = new YgoApi()

	test('should get cards by type', async () => {
		const result = await api.getCardsByType('Spell Card', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.type).toBe('Spell Card')
			expect(card.frameType).toBe('spell')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.desc).toBeDefined()
			expect(card.race).toBeDefined()
		})
	})

	test('should get cards by attribute', async () => {
		const result = await api.getCardsByAttribute('FIRE', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.attribute).toBe('FIRE')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
			expect(card.race).toBeDefined()
		})
	})

	test('should get cards by race', async () => {
		const result = await api.getCardsByRace('Dragon', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.race).toBe('Dragon')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
		})
	})

	test('should get cards by level', async () => {
		const result = await api.getCardsByLevel(4, { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.level).toBe(4)
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
			expect(card.race).toBeDefined()
			expect(card.attribute).toBeDefined()
		})
	})

	test('should get cards by ATK', async () => {
		const result = await api.getCardsByATK('gte3000', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
			if (card.atk !== undefined) {
				expect(card.atk).toBeGreaterThanOrEqual(3000)
			}
		})
	})

	test('should get cards by DEF', async () => {
		const result = await api.getCardsByDEF('lt2000', { num: 3, offset: 0 })
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(3)
		result.data.forEach((card) => {
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
			if (card.def !== undefined) {
				expect(card.def).toBeLessThan(2000)
			}
		})
	})

	test('should get cards with misc info', async () => {
		const result = await api.getCardsWithMiscInfo({
			archetype: 'Blue-Eyes',
			num: 2,
			offset: 0,
		})
		expect(result.data).toBeDefined()
		expect(Array.isArray(result.data)).toBe(true)
		expect(result.data.length).toBeGreaterThan(0)
		expect(result.data.length).toBeLessThanOrEqual(2)
		result.data.forEach((card) => {
			expect(card.archetype).toBe('Blue-Eyes')
			expect(card.id).toBeDefined()
			expect(card.name).toBeDefined()
			expect(card.type).toBeDefined()
			expect(card.desc).toBeDefined()
			expect(card.misc_info).toBeDefined()
			expect(Array.isArray(card.misc_info)).toBe(true)
			// Note: We don't test specific misc_info values as they're dynamic
		})
	})
})
