# YGOPRODeck API TypeScript Client

A comprehensive TypeScript client for the YGOPRODeck API, providing type-safe access to the Yu-Gi-Oh! card database. See the [API guide](https://ygoprodeck.com/api-guide/) for more information.

## Features

- 🔒 **Type-safe** - Full TypeScript support.
- 🎯 **Complete coverage** - ALL YGOPRODeck API endpoints and parameters supported.
- 🛠 **Rich utilities** - Helper functions and convenience methods for common tasks.

## Installation

```bash
npm install ygoapi
```

## Quick Start

```typescript
import { YgoApi } from 'ygoapi'

const api = new YgoApi()

// Get a specific card by name
const darkMagician = await api.getCardByName('Dark Magician')
console.log(darkMagician)

// Search cards by fuzzy name matching
const magicians = await api.searchCards('Magician', {
	num: 10,
	offset: 0,
})

console.log(magicians.data)
// Get cards from a specific archetype
const blueEyesCards = await api.getCardsByArchetype('Blue-Eyes', {
	num: 10,
	offset: 0,
})
console.log(blueEyesCards.data)
```

Run the example:

```bash
node examples/basic.js
```

## Using the Cache

The YgoApi client supports caching through a configurable KV store interface. This helps reduce API calls and stay within rate limits:

### Basic Cache Setup

```typescript
import { YgoApi } from 'ygoapi';

// Simple in-memory cache implementation
class MemoryCache {
  private cache = new Map<string, { value: string; expires: number }>();

  get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key: string, value: string, ttl?: number): void {
    const expires = Date.now() + (ttl || 300000); // Default 5 minutes
    this.cache.set(key, { value, expires });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Create API instance with caching
const api = new YgoApi({
  cache: new MemoryCache(),
  cacheTtl: 600000 // 10 minutes
});
```

### Cache Configuration Options

```typescript
const api = new YgoApi({
  cache: yourCacheStore,      // KV store implementation
  cacheTtl: 300000           // Cache TTL in milliseconds (default: 5 minutes)
});
```

### Cache Benefits

- **Reduces API calls** - Repeated requests return cached data
- **Respects rate limits** - Helps stay under 20 requests/second limit  
- **Improves performance** - Faster response times for cached data
- **Automatic invalidation** - Cache entries expire based on TTL

The cache automatically stores successful API responses and serves them for subsequent identical requests until the TTL expires.

You can also use the default export for convenience:

```typescript
import api from 'ygoapi';

const card = await api.getCardByName('Blue-Eyes White Dragon');
```

## API Reference

### Core Methods

#### `getCardInfo(params?: CardInfoParams): Promise<CardInfoResponse>`

Get card information with optional filtering parameters.

```typescript
// Get all cards
const allCards = await api.getCardInfo();

// Get cards with specific filters
const waterDragons = await api.getCardInfo({
  attribute: 'WATER',
  race: 'Dragon',
  type: 'Effect Monster'
});

// Get cards with ATK greater than 2500
const strongCards = await api.getCardInfo({
  atk: 'gt2500'
});
```

#### `getCardByName(name: string): Promise<Card | null>`

Get a single card by exact name match.

```typescript
const card = await api.getCardByName('Dark Magician');
if (card) {
  console.log(`ATK: ${card.atk}, DEF: ${card.def}`);
}
```

#### `getCardById(id: string | number): Promise<Card | null>`

Get a single card by its ID (passcode).

```typescript
const card = await api.getCardById('46986414'); // Dark Magician
```

#### `searchCards(fname: string, params?: Omit<CardInfoParams, 'fname'>): Promise<CardInfoResponse>`

Search cards using fuzzy name matching.

```typescript
// Find all cards with "Dragon" in the name
const dragons = await api.searchCards('Dragon');

// Find all LIGHT Dragons with "Dragon" in name
const lightDragons = await api.searchCards('Dragon', {
  attribute: 'LIGHT'
});
```

#### `getCardsByArchetype(archetype: string, params?: Omit<CardInfoParams, 'archetype'>): Promise<CardInfoResponse>`

Get all cards from a specific archetype.

```typescript
const heroCards = await api.getCardsByArchetype('Elemental HERO');
```

#### `getCardsBySet(cardset: string, params?: Omit<CardInfoParams, 'cardset'>): Promise<CardInfoResponse>`

Get all cards from a specific set.

```typescript
const metalRaiders = await api.getCardsBySet('Metal Raiders');
```

### Utility Methods

#### `getRandomCard(): Promise<Card>`

Get a random card from the database.

```typescript
const randomCard = await api.getRandomCard();
console.log(`Random card: ${randomCard.name}`);
```

#### `getAllCardSets(): Promise<CardSetInfo[]>`

Get information about all card sets.

```typescript
const sets = await api.getAllCardSets();
sets.forEach(set => {
  console.log(`${set.set_name} (${set.set_code}) - ${set.num_of_cards} cards`);
});
```

#### `getCardSetInfo(setcode: string): Promise<CardSetDetails>`

Get detailed information about a specific card set.

```typescript
const setInfo = await api.getCardSetInfo('LOB-001');
```

#### `getAllArchetypes(): Promise<Archetype[]>`

Get all available archetypes.

```typescript
const archetypes = await api.getAllArchetypes();
archetypes.forEach(archetype => {
  console.log(archetype.archetype_name);
});
```

#### `checkDatabaseVersion(): Promise<DatabaseVersion>`

Check the current database version.

```typescript
const version = await api.checkDatabaseVersion();
console.log(`Database version: ${version.database_version}`);
console.log(`Last update: ${version.last_update}`);
```

### Specialized Search Methods

#### `getStapleCards(params?: Omit<CardInfoParams, 'staple'>): Promise<CardInfoResponse>`

Get cards considered staples in the game.

```typescript
const staples = await api.getStapleCards();
```

#### `getCardsByFormat(format: Format, params?: Omit<CardInfoParams, 'format'>): Promise<CardInfoResponse>`

Get cards available in a specific format.

```typescript
const tcgCards = await api.getCardsByFormat('tcg');
const speedDuelCards = await api.getCardsByFormat('speed duel');
const rushDuelCards = await api.getCardsByFormat('rush duel');
const masterDuelCards = await api.getCardsByFormat('master duel');
```

#### `getBanlistCards(banlist: BanlistType, params?: Omit<CardInfoParams, 'banlist'>): Promise<CardInfoResponse>`

Get cards that appear on a specific banlist.

```typescript
const tcgBanned = await api.getBanlistCards('TCG');
const ocgBanned = await api.getBanlistCards('OCG');
const goatBanned = await api.getBanlistCards('Goat');
```

#### `getCardsWithPagination(num: number, offset: number, params?: Omit<CardInfoParams, 'num' | 'offset'>): Promise<CardInfoResponse>`

Get cards with pagination support.

```typescript
const firstPage = await api.getCardsWithPagination(50, 0);
console.log(`Total cards: ${firstPage.meta?.total_rows}`);
console.log(`Pages remaining: ${firstPage.meta?.pages_remaining}`);
```

### Convenience Methods

#### Type-specific Methods

```typescript
// Get cards by type
const spellCards = await api.getCardsByType('Spell Card');
const linkMonsters = await api.getCardsByType('Link Monster');

// Get cards by attribute
const fireCards = await api.getCardsByAttribute('FIRE');
const lightCards = await api.getCardsByAttribute('LIGHT');

// Get cards by race
const dragons = await api.getCardsByRace('Dragon');
const spellcasters = await api.getCardsByRace('Spellcaster');
```

#### Stat-based Methods

```typescript
// Get cards by level
const level4Cards = await api.getCardsByLevel(4);
const highLevelCards = await api.getCardsByLevel('gte8');

// Get cards by ATK/DEF
const strongCards = await api.getCardsByATK('gte3000');
const defensiveCards = await api.getCardsByDEF('gte2500');
```

#### Advanced Search Methods

```typescript
// Get cards with misc info (views, formats, dates, etc.)
const cardsWithMisc = await api.getCardsWithMiscInfo({
  archetype: 'Blue-Eyes'
});
```

## Helper Functions

### `buildComparison(operator: ComparisonOperator, value: number)`

Build comparison queries for ATK, DEF, or Level.

```typescript
import { buildComparison } from 'ygoapi';

const strongCards = await api.getCardInfo({
  atk: buildComparison('gte', 3000) // ATK >= 3000
});
```

### `getCardImages(card: Card)`

Extract image URLs from a card object.

```typescript
import { getCardImages } from 'ygoapi';

const card = await api.getCardByName('Dark Magician');
if (card) {
  const images = getCardImages(card);
  console.log('Default image:', images.default.image_url);
  console.log('Alternative images:', images.alternates);
}
```

### Card Type Checkers

```typescript
import { isMonsterCard, isSpellCard, isTrapCard, isExtraDeckMonster } from 'ygoapi';

const card = await api.getCardByName('Blue-Eyes White Dragon');
if (card) {
  console.log('Is monster:', isMonsterCard(card));
  console.log('Is spell:', isSpellCard(card));
  console.log('Is trap:', isTrapCard(card));
  console.log('Is extra deck:', isExtraDeckMonster(card));
}
```

## Advanced Search Features

### Link Monsters

Search for Link monsters with specific criteria:

```typescript
// Get all Link monsters
const linkMonsters = await api.getCardInfo({
  type: 'Link Monster'
});

// Get Link-2 monsters
const link2Monsters = await api.getCardInfo({
  type: 'Link Monster',
  link: 2
});

// Get Link monsters with specific markers
const topBottomLinks = await api.getCardInfo({
  type: 'Link Monster',
  linkmarker: ['Top', 'Bottom']
});
```

### Pendulum Monsters

Search for Pendulum monsters by scale:

```typescript
// Get all Pendulum monsters
const pendulums = await api.getCardInfo({
  type: 'Pendulum Effect Monster'
});

// Get Pendulum monsters with scale 7
const scale7Pendulums = await api.getCardInfo({
  type: 'Pendulum Effect Monster',
  scale: 7
});
```

### Advanced Filtering

```typescript
// Cards with effects vs without effects
const effectCards = await api.getCardInfo({
  has_effect: true,
  type: 'Effect Monster'
});

const vanillaCards = await api.getCardInfo({
  has_effect: false
});

// Date-based filtering
const oldCards = await api.getCardInfo({
  startdate: '2000-01-01',
  enddate: '2005-12-31',
  dateregion: 'tcg'
});

// Multiple card names/IDs
const specificCards = await api.getCardInfo({
  name: 'Dark Magician|Blue-Eyes White Dragon'
});

const cardsByIds = await api.getCardInfo({
  id: '46986414,89631139'
});
```

## Query Parameters

The `CardInfoParams` interface supports extensive filtering options:

### Basic Filters

```typescript
interface CardInfoParams {
  // Card identification
  name?: string;                    // Exact name match
  fname?: string;                   // Fuzzy name search
  id?: string | number;             // Card ID/passcode
  konami_id?: string | number;      // Konami ID
  
  // Card properties
  type?: CardType;                  // Card type
  atk?: number | `${ComparisonOperator}${number}`;
  def?: number | `${ComparisonOperator}${number}`;
  level?: number | `${ComparisonOperator}${number}`;
  race?: CardRace | CardRace[];     // Card race/type
  attribute?: Attribute | Attribute[];
  
  // Link monsters
  link?: number;                    // Link value
  linkmarker?: LinkMarker | LinkMarker[];
  
  // Pendulum monsters
  scale?: number;                   // Pendulum scale
  
  // Set/Archetype
  cardset?: string;                 // Card set name
  archetype?: string;               // Archetype name
  
  // Format/Banlist
  banlist?: BanlistType;           // TCG, OCG, or Goat
  format?: Format;                 // Game format
  
  // Special filters
  staple?: "yes";                  // Staple cards only
  has_effect?: boolean;            // Cards with/without effects
  
  // Date filters
  startdate?: string;              // YYYY-MM-DD
  enddate?: string;                // YYYY-MM-DD
  dateregion?: DateRegion;         // tcg or ocg
  
  // Sorting/Pagination
  sort?: SortOption;               // Sort order
  num?: number;                    // Number of results
  offset?: number;                 // Result offset
  
  // Additional options
  misc?: "yes";                    // Include misc info
  tcgplayer_data?: boolean;        // Use TCGPlayer data
  
  // Language
  language?: Language;             // fr, de, it, pt
}
```

### Comparison Operators

For ATK, DEF, and Level fields, you can use comparison operators:

```typescript
// Examples
atk: 2500,           // Exactly 2500
atk: "lt2500",       // Less than 2500
atk: "lte2500",      // Less than or equal to 2500
atk: "gt2500",       // Greater than 2500
atk: "gte2500",      // Greater than or equal to 2500
```

### Array Parameters

Many parameters accept arrays for multiple values:

```typescript
const cards = await api.getCardInfo({
  attribute: ['LIGHT', 'DARK'],     // LIGHT OR DARK
  race: ['Dragon', 'Spellcaster'],  // Dragon OR Spellcaster
  linkmarker: ['Top', 'Bottom']     // Top AND Bottom link markers
});
```

## Multi-language Support

The API supports multiple languages:

```typescript
// Get cards in French
const frenchCards = await api.getCardInfo({
  fname: 'Magicien',
  language: 'fr'
});

// Get German Blue-Eyes archetype
const germanBlueEyes = await api.getCardsByArchetype('Blue-Eyes', {
  language: 'de'
});
```

**Supported languages:**
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese

**Note:** Card images are only available in English.

## Types Reference

### Card Types

All card types from the game are supported:

```typescript
type CardType = 
  | "Effect Monster"
  | "Normal Monster"
  | "Fusion Monster"
  | "Synchro Monster"
  | "XYZ Monster"
  | "Link Monster"
  | "Spell Card"
  | "Trap Card"
  // ... and many more
```

### Attributes

```typescript
type Attribute = 
  | "DARK"
  | "LIGHT"
  | "EARTH"
  | "FIRE"
  | "WATER"
  | "WIND"
  | "DIVINE"
```

### Races

Monster races:

```typescript
type MonsterRace = 
  | "Dragon"
  | "Spellcaster"
  | "Warrior"
  | "Beast-Warrior"
  | "Fiend"
  // ... and more
```

Spell races:

```typescript
type SpellRace = 
  | "Normal"
  | "Quick-Play"
  | "Field"
  | "Equip"
  | "Continuous"
  | "Ritual"
```

Trap races:

```typescript
type TrapRace = 
  | "Normal"
  | "Continuous"
  | "Counter"
```

## Error Handling

The client includes comprehensive error handling:

```typescript
import { YgoApiError } from 'ygoapi';

try {
  const card = await api.getCardByName('Invalid Card Name');
} catch (error) {
  if (error instanceof YgoApiError) {
    console.log(`API Error ${error.statusCode}: ${error.message}`);
  } else {
    console.log('Network or other error:', error);
  }
}
```

## Rate Limiting

The YGOPRODeck API has rate limiting:

- **20 requests per second**
- Exceeding this limit results in a **1-hour IP ban**
- Cache responses locally to minimize API calls

## Testing

This library includes comprehensive test coverage with 53+ tests covering all features:

```bash
# Run tests
bun test

# Run tests with coverage
bun test --coverage
```

Test categories:
- ✅ Core API endpoints (6 endpoints)
- ✅ Advanced search parameters (25+ parameters)
- ✅ Link monsters and Pendulum cards
- ✅ Banlist and format filtering
- ✅ Multi-language support (5 languages)
- ✅ Error handling and edge cases
- ✅ Helper functions and utilities
- ✅ Convenience methods
- ✅ Real API integration tests

## Best Practices

1. **Cache responses locally** - Don't make repeated calls for the same data
2. **Respect rate limits** - Max 20 requests per second
3. **Download images locally** - Don't hotlink card images
4. **Use specific queries** - Filter results to reduce bandwidth
5. **Handle errors gracefully** - Always wrap API calls in try-catch blocks
6. **Use pagination** - For large result sets, use `num` and `offset` parameters
7. **Leverage TypeScript** - Take advantage of full type safety and IntelliSense

## Example Applications

### Card Search Application

```typescript
import { YgoApi, isMonsterCard, isSpellCard, isTrapCard } from 'ygoapi';

const api = new YgoApi();

async function searchCards(query: string) {
  try {
    const response = await api.searchCards(query, {
      sort: 'name',
      num: 20
    });
    
    return response.data.map(card => ({
      id: card.id,
      name: card.name,
      type: card.type,
      atk: card.atk,
      def: card.def,
      image: card.card_images[0]?.image_url_small
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}
```

### Deck Builder Helper

```typescript
import { YgoApi, isMonsterCard, isSpellCard, isTrapCard } from 'ygoapi';

const api = new YgoApi();

async function getArchetypeCards(archetype: string) {
  const response = await api.getCardsByArchetype(archetype);
  
  const monsters = response.data.filter(isMonsterCard);
  const spells = response.data.filter(isSpellCard);
  const traps = response.data.filter(isTrapCard);
  
  return { monsters, spells, traps };
}
```

### Price Tracker

```typescript
import { YgoApi } from 'ygoapi';

const api = new YgoApi();

async function getCardPrices(cardName: string) {
  const card = await api.getCardByName(cardName);
  if (!card) return null;
  
  const prices = card.card_prices[0];
  return {
    tcgplayer: parseFloat(prices.tcgplayer_price),
    cardmarket: parseFloat(prices.cardmarket_price),
    ebay: parseFloat(prices.ebay_price),
    amazon: parseFloat(prices.amazon_price),
    coolstuffinc: parseFloat(prices.coolstuffinc_price)
  };
}
```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

This project is licensed under the MIT License.

## API Coverage Summary

This library provides **100% coverage** of the YGOPRODeck API:

### ✅ All Endpoints (6/6)
- Card Information (`/cardinfo.php`)
- Random Card (`/randomcard.php`)
- Card Sets (`/cardsets.php`) 
- Card Set Information (`/cardsetsinfo.php`)
- Archetypes (`/archetypes.php`)
- Database Version (`/checkDBVer.php`)

### ✅ All Search Parameters (25+)
- Card identification: `name`, `fname`, `id`, `konami_id`
- Card properties: `type`, `atk`, `def`, `level`, `race`, `attribute`
- Link monsters: `link`, `linkmarker`
- Pendulum cards: `scale`
- Filtering: `cardset`, `archetype`, `banlist`, `format`, `staple`, `has_effect`
- Date filtering: `startdate`, `enddate`, `dateregion`
- Sorting & pagination: `sort`, `num`, `offset`
- Advanced: `misc`, `tcgplayer_data`, `language`

### ✅ All Features
- Comparison operators (`lt`, `lte`, `gt`, `gte`)
- Multiple values (pipe-separated names, comma-separated IDs)
- Multi-language support (English, French, German, Italian, Portuguese)
- Complete TypeScript definitions
- Parameter validation
- Error handling
- Helper functions
- Convenience methods

## Changelog

### v1.0.0
- ✅ Complete YGOPRODeck API implementation
- ✅ Full TypeScript support with 30+ type definitions
- ✅ 53+ comprehensive tests with 200+ assertions
- ✅ All 6 API endpoints supported
- ✅ All 25+ search parameters supported
- ✅ Multi-language support (5 languages)
- ✅ Advanced features (Link monsters, Pendulum cards, banlist filtering)
- ✅ Helper functions and convenience methods
- ✅ Parameter validation and error handling
- ✅ Zero external dependencies

## Important Usage Notes

⚠️ **Images**: Do not continually hotlink images directly from this site. Please download and re-host the images yourself. Failure to do so will result in an IP blacklist. Please read the guide on where to download images.

💾 **Data Caching**: Please download and store all data pulled from this API locally to keep the amount of API calls used to a minimum. Failure to do so may result in either your IP address being blacklisted or the API being rolled back.

⏱️ **Rate Limiting**: Rate limiting is enabled on the API. The rate limit is 20 requests per 1 second. If you exceed this, you are blocked from accessing the API for 1 hour.

## Disclaimer

This library is not affiliated with YGOPRODeck, Konami, or Yu-Gi-Oh!. Yu-Gi-Oh! is a trademark of Konami Digital Entertainment, Inc.

