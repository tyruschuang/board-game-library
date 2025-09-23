import type {Game} from '@/src/config/sampleGames'
import {sampleGames} from '@/src/config/sampleGames'

export type Collection = {
  id: string
  name: string
  description?: string
  games: Game[]
}

// Helper to fetch games by id from sampleGames
const g = (id: string) => sampleGames.find(x => x.id === id)!

export const sampleCollections: Collection[] = [
  {
    id: 'party-night',
    name: 'Party Night',
    description: 'Quick, accessible games for groups and new players.',
    games: [g('azul'), g('7wonders'), g('ticket-to-ride')].filter(Boolean) as Game[],
  },
  {
    id: 'epic-campaigns',
    name: 'Epic Campaigns',
    description: 'Long-form adventures with deep strategy.',
    games: [g('gloomhaven'), g('terraforming-mars'), g('root')].filter(Boolean) as Game[],
  },
  {
    id: 'family-favorites',
    name: 'Family Favorites',
    description: 'Easy to learn, fun to replay with family.',
    games: [g('catan'), g('carcassonne'), g('pandemic')].filter(Boolean) as Game[],
  },
]

