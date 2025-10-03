"use client"
import Image from 'next/image'
import {useEffect, useMemo, useRef, useState} from 'react'
import {Card, CardBody, CardHeader} from '@heroui/card'
import {Chip} from '@heroui/chip'
import {Button} from '@heroui/button'
import {Input} from '@heroui/input'
import {Select, SelectItem} from '@heroui/select'
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/modal'
import {subtitle, title} from '@/src/components/primitives'
import {SearchBar} from '@/src/components/SearchBar'
import {Spinner} from '@heroui/spinner'
import {GameDetailsModal} from '@/src/components/GameDetailsModal'
import type {BggGame} from '@/src/types/bgg'

type TimeBucket = { id: string; label: string; min: number; max: number }

const TIME_BUCKETS: TimeBucket[] = [
  {id: 'u30', label: '< 30m', min: 0, max: 29},
  {id: '30-60', label: '30–60m', min: 30, max: 60},
  {id: '60-90', label: '60–90m', min: 61, max: 90},
  {id: '90+', label: '90m+', min: 91, max: 999},
]

const WEIGHTS = [
  {id: '', label: 'Any weight'},
  {id: 'light', label: 'Light'},
  {id: 'medium', label: 'Medium'},
  {id: 'heavy', label: 'Heavy'},
]

const SORTS = [
  {id: 'relevance', label: 'Relevance'},
  {id: 'rating', label: 'Avg rating'},
  {id: 'rank', label: 'BGG rank'},
  {id: 'year', label: 'Year (newest)'},
  {id: 'time', label: 'Playtime (shortest)'},
  {id: 'name', label: 'Name (A–Z)'},
]

export function DiscoverClient({
  initialResults,
  initialTotal,
  initialPages,
}: {
  initialResults: BggGame[]
  initialTotal: number
  initialPages: number
}) {
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [players, setPlayers] = useState<number | ''>('')
  const [weight, setWeight] = useState<'light' | 'medium' | 'heavy' | ''>('')
  const [sort, setSort] = useState<'relevance' | 'rating' | 'rank' | 'year' | 'time' | 'name'>('relevance')

  const [results, setResults] = useState<BggGame[]>(initialResults)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(initialPages)
  const [loading, setLoading] = useState(false)

  const LIMIT = 20
  const [selected, setSelected] = useState<BggGame | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Track that we've already used the server-provided initial hot results once
  const usedInitialHotRef = useRef<boolean>(false)
  const nextAllowedAtRef = useRef<number>(0)

  const effectivePages = useMemo(() => {
    if (pages && pages > 0) return pages
    if (total && total > 0) return Math.ceil(total / LIMIT)
    if (results.length > 0) return Number.MAX_SAFE_INTEGER
    return 1
  }, [pages, total, results.length])
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    for (const g of results) for (const t of (g.tags || [])) tags.add(t)
    return Array.from(tags).sort()
  }, [results])

  const hasFilterSelections = useMemo(() => Boolean(
    selectedTags.size ||
    selectedTime ||
    players !== '' ||
    weight ||
    sort !== 'relevance'
  ), [selectedTags, selectedTime, players, weight, sort])

  const canClear = useMemo(() => Boolean(query.trim() || hasFilterSelections), [query, hasFilterSelections])

  // Relevance scoring
  function scoreRelevance(g: BggGame): number {
    const q = query.trim().toLowerCase()
    if (!q) return 0
    let s = 0
    const name = g.name.toLowerCase()
    if (name === q) s += 100
    else if (name.startsWith(q)) s += 70
    else if (name.includes(q)) s += 40
    if (players !== '') {
      const p = players as number
      const within = g.players.min <= p && p <= g.players.max
      if (within) s += 25
      else {
        const dist = p < g.players.min ? (g.players.min - p) : (p - g.players.max)
        s += Math.max(0, 12 - 6 * Math.log2(1 + dist))
      }
    }
    if (selectedTime) {
      const b = TIME_BUCKETS.find(x => x.id === selectedTime)
      if (b) {
        const overlap = !(g.time.max < b.min || g.time.min > b.max)
        if (overlap) s += (g.time.min >= b.min && g.time.max <= b.max) ? 20 : 12
      }
    }
    if (weight && g.weight === weight) s += 10
    if (g.stats?.rank != null) {
      const r = g.stats.rank
      if (r <= 100) s += 20
      else if (r <= 500) s += 12
      else if (r <= 1000) s += 6
    }
    if (g.rating != null) s += Math.max(0, (g.rating - 5) * 6)
    return s
  }

  const sortedResults = useMemo(() => {
    const arr = [...results]
    switch (sort) {
      case 'relevance':
        if (query.trim()) arr.sort((a, b) => scoreRelevance(b) - scoreRelevance(a))
        return arr
      case 'rating':
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'rank':
        return arr.sort((a, b) => (a.stats?.rank || 999999) - (b.stats?.rank || 999999))
      case 'year':
        return arr.sort((a, b) => (b.year || 0) - (a.year || 0))
      case 'time':
        return arr.sort((a, b) => (a.time.min || 0) - (b.time.min || 0))
      case 'name':
        return arr.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return arr
    }
  }, [results, sort, query, players, selectedTime, weight])

  const clearFilters = () => {
    setQuery('')
    setSelectedTags(new Set())
    setSelectedTime(null)
    setPlayers('')
    setWeight('')
    setSort('relevance')
    setPage(1)
    setFiltersOpen(false)
  }

  // Data fetcher effect
  useEffect(() => {
    const isDefault = !query.trim() && selectedTags.size === 0 && !selectedTime && players === '' && !weight
    // Skip exactly once on initial render when server provided hot results
    if (
      page === 1 &&
      isDefault &&
      results.length > 0 &&
      total > 0 &&
      usedInitialHotRef.current === false
    ) {
      usedInitialHotRef.current = true
      // Use server-provided hot results; skip duplicate fetch
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    setLoading(true)
    setError(null)

    const baseDelay = 250
    const throttleDelay = Math.max(0, nextAllowedAtRef.current - Date.now())
    const delay = Math.max(baseDelay, throttleDelay)

    debounceRef.current = setTimeout(async () => {
      const requestWindowEndsAt = Date.now() + 3000
      nextAllowedAtRef.current = requestWindowEndsAt
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      try {
        const params = new URLSearchParams()
        params.set('limit', '20')
        params.set('page', String(page))
        if (players !== '') params.set('players', String(players))
        if (weight) params.set('weight', weight)
        if (selectedTime) {
          const bucket = TIME_BUCKETS.find(b => b.id === selectedTime)
          if (bucket) {
            params.set('min_time', String(bucket.min))
            params.set('max_time', String(bucket.max))
          }
        }
        if (selectedTags.size) params.set('tags', Array.from(selectedTags).join(','))
        const path = query.trim() ? '/api/bgg/search' : '/api/bgg/hot'
        if (query.trim()) params.set('q', query.trim())
        const res = await fetch(`${path}?${params.toString()}`, {signal: ac.signal})
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = await res.json()
        const newResults = (data?.results || []) as BggGame[]

        const waitMs = Math.max(0, requestWindowEndsAt - Date.now())
        if (waitMs > 0) {
          await new Promise(resolve => setTimeout(resolve, waitMs))
        }

        if (abortRef.current !== ac) return

        setTotal(Number(data?.total || 0))
        setPages(Number(data?.pages || 0))
        setResults(prev => (page > 1 ? [...prev, ...newResults] : newResults))
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        console.error(e)
        setError(e?.message || 'Failed to fetch')
        if (page === 1) setResults([])
      } finally {
        if (abortRef.current === ac) setLoading(false)
      }
    }, delay)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, selectedTags, selectedTime, players, weight, page])


  // Reset pagination when filters or query change (except page itself)
  useEffect(() => { setPage(1); nextAllowedAtRef.current = 0 }, [query, selectedTags, selectedTime, players, weight])

  // Infinite scroll via intersection observer
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && !loading && page < effectivePages) {
      const nowTs = Date.now()
      if (nowTs < nextAllowedAtRef.current) return
      // Reserve a slot so we don't bump pages multiple times
      nextAllowedAtRef.current = nowTs + 5000
      setPage(p => p + 1)
    }
    }, {rootMargin: '400px'})
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading, page, effectivePages])

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className={title({size: 'md'})}>Discover Games</h1>
        <p className={subtitle()}>Fast search with smart relevance and flexible filters</p>
      </div>

      {/* Search + Filters */}
      <Card className="bg-content1/50 backdrop-blur-md">
        <CardBody className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <SearchBar
                placeholder="Search games"
                value={query}
                onValueChange={setQuery as any}
                classNames={{inputWrapper: 'bg-default-100'}}
              />
            </div>
            <div className="flex items-center justify-end gap-2 lg:justify-start">
              <Button
                variant={hasFilterSelections ? 'solid' : 'bordered'}
                color={hasFilterSelections ? 'primary' : 'default'}
                onPress={() => setFiltersOpen(true)}
              >
                {hasFilterSelections ? 'Filters • Active' : 'Filters'}
              </Button>
              <Button variant="light" onPress={clearFilters} isDisabled={!canClear}>Clear</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={filtersOpen} onOpenChange={setFiltersOpen} scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-base font-semibold">Refine Results</span>
                <span className="text-small text-foreground-500">Adjust filters or sorting to narrow the list</span>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    type="number"
                    label="Players"
                    min={1}
                    max={20}
                    value={players === '' ? '' : String(players)}
                    onValueChange={(v) => setPlayers(v ? Math.max(1, Math.min(20, Number(v))) : '')}
                    variant="bordered"
                  />
                  <Select
                    aria-label="Time to play"
                    label="Time"
                    items={TIME_BUCKETS}
                    placeholder="Any"
                    selectedKeys={selectedTime ? new Set([selectedTime]) : new Set()}
                    onSelectionChange={(keys: any) => {
                      const key = Array.from(keys as Set<any>)[0]
                      setSelectedTime(key ? String(key) : null)
                    }}
                    selectionMode="single"
                    variant="bordered"
                  >
                    {(t) => <SelectItem>{t.label}</SelectItem>}
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    aria-label="Weight"
                    label="Weight"
                    items={WEIGHTS}
                    placeholder="Any"
                    selectedKeys={new Set([weight || ''])}
                    onSelectionChange={(keys: any) => {
                      const key = Array.from(keys as Set<any>)[0]
                      const v = (key ? String(key) : '') as 'light'|'medium'|'heavy'|''
                      setWeight(v)
                    }}
                    selectionMode="single"
                    variant="bordered"
                  >
                    {(w) => <SelectItem>{w.label}</SelectItem>}
                  </Select>
                  <Select
                    aria-label="Sort by"
                    label="Sort"
                    items={SORTS}
                    placeholder="Relevance"
                    selectedKeys={new Set([sort])}
                    onSelectionChange={(keys: any) => {
                      const key = Array.from(keys as Set<any>)[0] as any
                      setSort((key || 'relevance') as any)
                    }}
                    selectionMode="single"
                    variant="bordered"
                  >
                    {(s) => <SelectItem>{s.label}</SelectItem>}
                  </Select>
                </div>
                <Select
                  aria-label="Tags"
                  label="Tags"
                  items={availableTags.map((tag) => ({id: tag, label: tag.replace('-', ' ')}))}
                  placeholder={availableTags.length ? 'Filter by tags' : 'Tags load from results'}
                  selectionMode="multiple"
                  selectedKeys={selectedTags}
                  onSelectionChange={(keys: any) => {
                    if (keys === 'all') setSelectedTags(new Set(availableTags))
                    else setSelectedTags(new Set(Array.from(keys as Set<any>).map(String)))
                  }}
                  variant="bordered"
                >
                  {(tag) => <SelectItem className="capitalize">{tag.label}</SelectItem>}
                </Select>
              </ModalBody>
              <ModalFooter className="flex justify-between">
                <Button variant="light" onPress={clearFilters} isDisabled={!canClear}>Reset</Button>
                <Button color="primary" onPress={() => onClose()}>Done</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Results header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="text-small text-foreground-500">{results.length} shown{total ? ` • ${total} total` : ''}{loading ? ` (loading...)` : ''}</div>
          {error && <div className="text-tiny text-danger">{error}</div>}
        </div>
      </div>
      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResults.map((g) => (
          <Card key={g.id} className="bg-content1/60 overflow-hidden">
            <CardHeader className="flex gap-3 items-center cursor-pointer" onClick={() => { setSelected(g); setDetailsOpen(true); }}>
              <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                <Image src={g.image || 'https://picsum.photos/seed/boardgame/160/160'} alt={g.name} fill className="object-cover"/>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="font-semibold truncate max-w-[16rem]" title={g.name}>{g.name}</div>
                <div className="text-small text-foreground-500">
                  {g.year ? `${g.year} • ` : ''}{g.players.min}-{g.players.max} players • {g.time.min}-{g.time.max}m
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex flex-wrap gap-2">
                {g.tags.slice(0, 6).map((t) => (
                  <Chip key={t} size="sm" variant="flat" className="capitalize">{t.replace('-', ' ')}</Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 my-10" aria-live="polite">
        {loading && (
          <>
            <Spinner size="lg" color="primary" />
            <span className="text-small text-foreground-500">Loading games...</span>
          </>
        )}
      </div>
      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      <GameDetailsModal isOpen={detailsOpen} onOpenChange={setDetailsOpen} game={selected} />
    </div>
  )
}













