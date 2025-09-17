"use client"
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { title, subtitle } from '@/src/components/primitives'
import { discoverGames, allTags } from '@/src/config/discoverGames'
import { SearchBar } from '@/src/components/SearchBar'
import {Select, SelectItem} from "@heroui/select";

type TimeBucket = {
    id: string
    label: string
    min: number
    max: number
}

const TIME_BUCKETS: TimeBucket[] = [
    { id: 'u30', label: '< 30m', min: 0, max: 29 },
    { id: '30-60', label: '30–60m', min: 30, max: 60 },
    { id: '60-90', label: '60–90m', min: 61, max: 90 },
    { id: '90+', label: '90m+', min: 91, max: 999 },
]

export default function DiscoverPage() {
    const [query, setQuery] = useState('')
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [players, setPlayers] = useState<number | ''>('')
    const [weight, setWeight] = useState<'light' | 'medium' | 'heavy' | ''>('')

    const results = useMemo(() => {
        let list = discoverGames

        if (query.trim()) {
            const q = query.trim().toLowerCase()
            list = list.filter((g) => g.name.toLowerCase().includes(q))
        }
    if (selectedTags.size) {
      const required = Array.from(selectedTags)
      list = list.filter((g) => required.every((t) => g.tags.includes(t)))
    }
        if (selectedTime) {
            const bucket = TIME_BUCKETS.find((b) => b.id === selectedTime)
            if (bucket) {
                list = list.filter((g) => g.time.min <= bucket.max && g.time.max >= bucket.min)
            }
        }
        if (players) {
            list = list.filter((g) => g.players.min <= players && g.players.max >= players)
        }
        if (weight) {
            list = list.filter((g) => g.weight === weight)
        }

        // simple stable sort: by rating desc
        return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }, [query, selectedTags, selectedTime, players, weight])

    const clearFilters = () => {
        setQuery('')
        setSelectedTags(new Set())
        setSelectedTime(null)
        setPlayers('')
        setWeight('')
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <h1 className={title({ size: 'md' })}>Discover Games</h1>
                <p className={subtitle()}>Search and filter by tags, time, players, and more</p>
            </div>

            {/* Filters */}
            <Card className="bg-content1/50 backdrop-blur-md">
                <CardBody className="flex flex-col gap-4">
                    <SearchBar
                        placeholder="Search games"
                        value={query}
                        onValueChange={setQuery as any}
                        classNames={{ inputWrapper: 'bg-default-100' }}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Select
                            aria-label="Time to play"
                            label="Time to play"
                            items={TIME_BUCKETS}
                            placeholder="Select a duration"
                            selectedKeys={selectedTime ? new Set([selectedTime]) : new Set()}
                            onSelectionChange={(keys: any) => {
                                const key = Array.from(keys as Set<any>)[0]
                                setSelectedTime(key ? String(key) : null)
                            }}
                            selectionMode="single"
                            variant="bordered"
                        >
                            {(time) => (
                                <SelectItem>
                                    {time.label}
                                </SelectItem>
                            )}
                        </Select>
                        <Input
                            type="number"
                            label="Players"
                            min={1}
                            max={10}
                            value={players === '' ? '' : String(players)}
                            onValueChange={(v) => setPlayers(v ? Math.max(1, Math.min(10, Number(v))) : '')}
                            variant="bordered"
                        />
                        <Select
                            aria-label="Tags"
                            label="Tags"
                            items={allTags.map((tag) => {
                                return {id: tag, label: tag.replace('-', ' ')}
                            })}
                            placeholder="Select tags"
                            selectionMode="multiple"
                            selectedKeys={selectedTags}
                            onSelectionChange={(keys: any) => {
                                if (keys === 'all') {
                                    setSelectedTags(new Set(allTags))
                                } else {
                                    setSelectedTags(new Set(Array.from(keys as Set<any>).map(String)))
                                }
                            }}
                            variant="bordered"
                        >
                            {(tag) => (
                                <SelectItem className="capitalize">
                                    {tag.label}
                                </SelectItem>
                            )}
                        </Select>
                    </div>
                    <div className="flex">
                        <Button variant="flat" onPress={clearFilters} className="w-full">Clear</Button>
                    </div>
                </CardBody>
            </Card>

            {/* Results */}
            <div className="flex items-center justify-between">
                <div className="text-small text-foreground-500">{results.length} results</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((g) => (
                    <Card key={g.id} className="bg-content1/60 overflow-hidden">
                        <CardHeader className="flex gap-3 items-center">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                <Image src={g.image} alt={g.name} fill className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <div className="font-semibold">{g.name}</div>
                                <div className="text-small text-foreground-500">
                                    {g.year ? `${g.year} • ` : ''}{g.players.min}-{g.players.max} players • {g.time.min}-{g.time.max}m
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="flex flex-wrap gap-2">
                                {g.tags.slice(0, 5).map((t) => (
                                    <Chip key={t} size="sm" variant="flat" className="capitalize">{t.replace('-', ' ')}</Chip>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}
