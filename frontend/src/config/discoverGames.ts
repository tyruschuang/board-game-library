export type DiscoverGame = {
    id: string
    name: string
    image: string
    year?: number
    rating?: number
    players: { min: number; max: number }
    time: { min: number; max: number } // minutes
    weight: 'light' | 'medium' | 'heavy'
    tags: string[]
}

export const discoverGames: DiscoverGame[] = [
    {
        id: 'catan',
        name: 'Catan',
        image: 'https://picsum.photos/seed/catan/800/600',
        year: 1995,
        rating: 7.2,
        players: {min: 3, max: 4},
        time: {min: 60, max: 90},
        weight: 'medium',
        tags: ['trading', 'resource-management', 'family', 'strategy'],
    },
    {
        id: 'gloomhaven',
        name: 'Gloomhaven',
        image: 'https://picsum.photos/seed/gloomhaven/800/600',
        year: 2017,
        rating: 8.7,
        players: {min: 1, max: 4},
        time: {min: 90, max: 140},
        weight: 'heavy',
        tags: ['campaign', 'co-op', 'dungeon-crawl', 'hand-management'],
    },
    {
        id: 'azul',
        name: 'Azul',
        image: 'https://picsum.photos/seed/azul/800/600',
        year: 2017,
        rating: 7.8,
        players: {min: 2, max: 4},
        time: {min: 30, max: 45},
        weight: 'light',
        tags: ['abstract', 'pattern-building', 'family'],
    },
    {
        id: 'wingspan',
        name: 'Wingspan',
        image: 'https://picsum.photos/seed/wingspan/800/600',
        year: 2019,
        rating: 8.0,
        players: {min: 1, max: 5},
        time: {min: 45, max: 75},
        weight: 'medium',
        tags: ['engine-building', 'set-collection', 'solo'],
    },
    {
        id: 'terraforming-mars',
        name: 'Terraforming Mars',
        image: 'https://picsum.photos/seed/terraforming/800/600',
        year: 2016,
        rating: 8.4,
        players: {min: 1, max: 5},
        time: {min: 120, max: 180},
        weight: 'heavy',
        tags: ['engine-building', 'card-drafting', 'science', 'solo'],
    },
    {
        id: 'ticket-to-ride',
        name: 'Ticket to Ride',
        image: 'https://picsum.photos/seed/ticket/800/600',
        year: 2004,
        rating: 7.4,
        players: {min: 2, max: 5},
        time: {min: 45, max: 60},
        weight: 'light',
        tags: ['route-building', 'set-collection', 'family'],
    },
    {
        id: 'root',
        name: 'Root',
        image: 'https://picsum.photos/seed/root/800/600',
        year: 2018,
        rating: 8.1,
        players: {min: 2, max: 4},
        time: {min: 60, max: 120},
        weight: 'heavy',
        tags: ['asymmetric', 'area-control', 'strategy'],
    },
    {
        id: '7wonders',
        name: '7 Wonders',
        image: 'https://picsum.photos/seed/7wonders/800/600',
        year: 2010,
        rating: 7.7,
        players: {min: 2, max: 7},
        time: {min: 30, max: 45},
        weight: 'medium',
        tags: ['card-drafting', 'simultaneous', 'civilization'],
    },
    {
        id: 'pandemic',
        name: 'Pandemic',
        image: 'https://picsum.photos/seed/pandemic/800/600',
        year: 2008,
        rating: 7.6,
        players: {min: 2, max: 4},
        time: {min: 45, max: 60},
        weight: 'medium',
        tags: ['co-op', 'hand-management', 'disease'],
    },
    {
        id: 'brass',
        name: 'Brass: Birmingham',
        image: 'https://picsum.photos/seed/brass/800/600',
        year: 2018,
        rating: 8.8,
        players: {min: 2, max: 4},
        time: {min: 90, max: 150},
        weight: 'heavy',
        tags: ['economic', 'network', 'card-hand-management'],
    },
    {
        id: 'carcassonne',
        name: 'Carcassonne',
        image: 'https://picsum.photos/seed/carcassonne/800/600',
        year: 2000,
        rating: 7.4,
        players: {min: 2, max: 5},
        time: {min: 30, max: 45},
        weight: 'light',
        tags: ['tile-laying', 'area-control', 'family'],
    },
    {
        id: 'dune',
        name: 'Dune: Imperium',
        image: 'https://picsum.photos/seed/dune/800/600',
        year: 2020,
        rating: 8.4,
        players: {min: 1, max: 4},
        time: {min: 60, max: 120},
        weight: 'medium',
        tags: ['deck-building', 'worker-placement', 'solo'],
    },
]

export const allTags = Array.from(
    new Set(discoverGames.flatMap((g) => g.tags))
).sort()

