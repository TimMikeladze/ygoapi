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
