"use client"

import {useMemo, useState} from 'react'
import Image from 'next/image'
import {Card, CardBody, CardHeader} from '@heroui/card'
import {Button} from '@heroui/button'
import {Input} from '@heroui/input'
import {Textarea} from '@heroui/input'
import {Select, SelectItem} from '@heroui/select'
import {Chip} from '@heroui/chip'

import type {Collection} from '@/src/config/collections'
import {sampleCollections} from '@/src/config/collections'
import {sampleGames, type Game} from '@/src/config/sampleGames'

export default function CollectionsManager() {
  const [collections, setCollections] = useState<Collection[]>(() => [...sampleCollections])
  const [selectedId, setSelectedId] = useState<string | null>(collections[0]?.id ?? null)
  const [gameToAdd, setGameToAdd] = useState<string | null>(null)

  const selected = useMemo(() => collections.find(c => c.id === selectedId) || null, [collections, selectedId])

  function addCollection() {
    const idx = collections.length + 1
    const newCol: Collection = {
      id: `new-${idx}`,
      name: `New Collection ${idx}`,
      description: '',
      games: [],
    }
    setCollections(prev => [newCol, ...prev])
    setSelectedId(newCol.id)
  }

  function deleteCollection(id: string) {
    setCollections(prev => prev.filter(c => c.id !== id))
    setSelectedId(prev => (prev === id ? null : prev))
  }

  function updateSelected(patch: Partial<Collection>) {
    setCollections(prev => prev.map(c => (c.id === selectedId ? {...c, ...patch} : c)))
  }

  function addGameById(id: string) {
    if (!selected) return
    const game = sampleGames.find(g => g.id === id)
    if (!game) return
    if (selected.games.some(g => g.id === id)) return
    updateSelected({games: [...selected.games, game]})
  }

  function removeGame(id: string) {
    if (!selected) return
    updateSelected({games: selected.games.filter(g => g.id !== id)})
  }

  const candidates = useMemo(() => {
    const taken = new Set((selected?.games || []).map(g => g.id))
    return sampleGames.filter(g => !taken.has(g.id))
  }, [selected])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Collections</h1>
        <Button color="primary" onPress={addCollection}>New Collection</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections list */}
        <Card className="bg-content1/60">
          <CardHeader className="font-semibold">Your Collections</CardHeader>
          <CardBody className="flex flex-col gap-3">
            {collections.length === 0 && (
              <div className="text-small text-foreground-500">No collections yet. Create one to get started.</div>
            )}
            {collections.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`flex items-center gap-3 rounded-md p-2 text-left transition-colors ${
                  selectedId === c.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-default-100'
                }`}
              >
                <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                  <Image
                    src={c.games[0]?.image || 'https://picsum.photos/seed/collection/200/200'}
                    alt={c.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-small text-foreground-500">{c.games.length} games</span>
                </div>
              </button>
            ))}
          </CardBody>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2 bg-content1/60">
          <CardHeader className="flex items-center justify-between">
            <span className="font-semibold">Details</span>
            {selected && (
              <Button color="danger" variant="flat" size="sm" onPress={() => deleteCollection(selected.id)}>
                Delete
              </Button>
            )}
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {!selected ? (
              <div className="text-foreground-500">Select a collection to edit.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    labelPlacement="outside"
                    placeholder="Collection name"
                    value={selected.name}
                    onValueChange={(v) => updateSelected({name: v})}
                    variant="bordered"
                  />
                  <Textarea
                    label="Description"
                    labelPlacement="outside"
                    placeholder="What goes into this collection?"
                    value={selected.description || ''}
                    onValueChange={(v) => updateSelected({description: v})}
                    variant="bordered"
                  />
                </div>

                {/* Add games */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <Select
                      aria-label="Add a game"
                      label="Add a game"
                      labelPlacement="outside"
                      placeholder={candidates.length ? 'Select a game' : 'No more games to add'}
                      items={candidates}
                      selectedKeys={gameToAdd ? new Set([gameToAdd]) : new Set()}
                      onSelectionChange={(keys: any) => {
                        const key = Array.from(keys as Set<any>)[0]
                        setGameToAdd(key ? String(key) : null)
                      }}
                      selectionMode="single"
                      variant="bordered"
                      isDisabled={candidates.length === 0}
                    >
                      {(g: Game) => <SelectItem key={g.id}>{g.name}</SelectItem>}
                    </Select>
                    <Button
                      color="primary"
                      variant="solid"
                      onPress={() => {
                        if (gameToAdd) {
                          addGameById(gameToAdd)
                          setGameToAdd(null)
                        }
                      }}
                      isDisabled={!gameToAdd}
                    >
                      Add Game
                    </Button>
                  </div>
                </div>

                {/* Games grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selected.games.map((g) => (
                    <Card key={g.id} className="bg-content2/60 overflow-hidden">
                      <CardHeader className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-md overflow-hidden">
                          <Image src={g.image} alt={g.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{g.name}</span>
                          <span className="text-small text-foreground-500">{g.year ?? '—'} • {g.players ?? ''}</span>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0 flex items-center justify-between">
                        <div className="flex gap-2">
                          <Chip size="sm" variant="flat">{g.players ?? ''} players</Chip>
                          {g.year && <Chip size="sm" variant="flat">{g.year}</Chip>}
                        </div>
                        <Button size="sm" color="danger" variant="light" onPress={() => removeGame(g.id)}>
                          Remove
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

