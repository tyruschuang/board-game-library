export type BggGame = {
  id: string
  name: string
  image: string
  year?: number
  rating?: number
  players: { min: number; max: number }
  time: { min: number; max: number }
  weight: 'light' | 'medium' | 'heavy'
  tags: string[]
  description?: string
  stats?: {
    usersRated?: number | null
    bayesAverage?: number | null
    rank?: number | null
  }
  url?: string
}

