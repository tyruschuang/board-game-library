"use client"

import Image from 'next/image'
import {useMemo, useState} from 'react'
import {Card, CardBody, CardHeader} from '@heroui/card'
import {Select, SelectItem} from '@heroui/select'
import {Chip} from '@heroui/chip'
import {subtitle, title} from '@/src/components/primitives'
import {discoverGames, type DiscoverGame} from '@/src/config/discoverGames'

type Scored = {
  game: DiscoverGame
  score: number // 0..1
  reasons: string[]
  commonTags: string[]
}

const weightOrder: Record<NonNullable<DiscoverGame['weight']>, number> = {
  light: 0,
  medium: 1,
  heavy: 2,
}

function jaccard<T>(a: T[], b: T[]): number {
  const A = new Set(a)
  const B = new Set(b)
  let inter = 0
  A.forEach((x) => {
    if (B.has(x)) inter++
  })
  const union = A.size + B.size - inter
  return union === 0 ? 0 : inter / union
}

function intervalOverlapRatio(aMin: number, aMax: number, bMin: number, bMax: number): number {
  const overlap = Math.max(0, Math.min(aMax, bMax) - Math.max(aMin, bMin))
  const union = Math.max(aMax, bMax) - Math.min(aMin, bMin)
  return union === 0 ? 0 : overlap / union
}

function computeSimilarity(base: DiscoverGame, other: DiscoverGame): Scored {
  const tagScore = jaccard(base.tags, other.tags)
  const playersScore = intervalOverlapRatio(base.players.min, base.players.max + 0.0001, other.players.min, other.players.max + 0.0001)
  const timeScore = intervalOverlapRatio(base.time.min, base.time.max, other.time.min, other.time.max)
  const weightScore = 1 - Math.min(1, Math.abs(weightOrder[base.weight] - weightOrder[other.weight]) / 2)
  const ratingScore = base.rating && other.rating ? 1 - Math.min(1, Math.abs(base.rating - other.rating) / 5) : 0.5

  const score = 0.5 * tagScore + 0.2 * playersScore + 0.15 * timeScore + 0.1 * weightScore + 0.05 * ratingScore

  // reasons
  const commonTags = base.tags.filter(t => other.tags.includes(t))
  const reasons: string[] = []
  if (commonTags.length) reasons.push(`shares ${commonTags.length} tag${commonTags.length > 1 ? 's' : ''}`)
  if (playersScore > 0) reasons.push('overlapping player counts')
  if (timeScore > 0) reasons.push('similar playtime')
  if (weightScore === 1) reasons.push('same weight')
  else if (weightScore >= 0.5) reasons.push('similar weight')

  return {game: other, score, reasons, commonTags: commonTags.slice(0, 4)}
}

export default function SimilarPage() {
  const [selectedId, setSelectedId] = useState<string | null>(discoverGames[0]?.id ?? null)

  const base = useMemo(() => discoverGames.find(g => g.id === selectedId) || null, [selectedId])

  const results = useMemo(() => {
    if (!base) return [] as Scored[]
    const scored = discoverGames
      .filter(g => g.id !== base.id)
      .map(g => computeSimilarity(base, g))
      .sort((a, b) => b.score - a.score)
    return scored
  }, [base])

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className={title({size: 'md'})}>Find Similar Games</h1>
        <p className={subtitle()}>Pick a game to see algorithmic similarities</p>
      </div>

      {/* Picker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <Select
          aria-label="Choose a base game"
          label="Base game"
          labelPlacement="outside"
          items={discoverGames}
          selectedKeys={selectedId ? new Set([selectedId]) : new Set()}
          onSelectionChange={(keys: any) => {
            const key = Array.from(keys as Set<any>)[0]
            setSelectedId(key ? String(key) : null)
          }}
          selectionMode="single"
          variant="bordered"
        >
          {(g: DiscoverGame) => <SelectItem key={g.id}>{g.name}</SelectItem>}
        </Select>
        {base && (
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
              <Image src={base.image} alt={base.name} fill className="object-cover" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="font-semibold">{base.name}</div>
              <div className="text-small text-foreground-500">
                {base.players.min}-{base.players.max} players • {base.time.min}-{base.time.max}m • {base.weight}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <div className="text-small text-foreground-500">{base ? results.length : 0} results</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(({game, score, reasons, commonTags}) => (
          <Card key={game.id} className="bg-content1/60 overflow-hidden">
            <CardHeader className="flex gap-3 items-center">
              <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                <Image src={game.image} alt={game.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="font-semibold">{game.name}</div>
                <div className="text-small text-foreground-500">
                  {(score * 100).toFixed(0)}% match • {game.players.min}-{game.players.max} players • {game.time.min}-{game.time.max}m
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {reasons.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {reasons.map((r, i) => (
                    <Chip key={i} size="sm" variant="flat" className="capitalize">{r}</Chip>
                  ))}
                </div>
              )}
              {commonTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((t) => (
                    <Chip key={t} size="sm" variant="dot" className="capitalize">{t.replace('-', ' ')}</Chip>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}



