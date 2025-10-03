"use client"
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/modal"
import Image from "next/image"
import {Chip} from "@heroui/chip"
import {Button} from "@heroui/button"
import {Divider} from "@heroui/divider"
import type {BggGame} from "@/src/types/bgg"

function decodeXmlEntities(input: string): string {
  return input
    .replaceAll(/&amp;/g, "&")
    .replaceAll(/&lt;/g, "<")
    .replaceAll(/&gt;/g, ">")
    .replaceAll(/&quot;/g, '"')
    .replaceAll(/&#39;|&apos;/g, "'")
}

export function GameDetailsModal({
  isOpen,
  onOpenChange,
  game,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  game: BggGame | null
}) {
  const description = decodeXmlEntities(game?.description || "")

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-4 items-center">
              <div className="relative w-14 h-14 rounded-md overflow-hidden bg-default-100">
                {game?.image && (
                  <Image src={game.image} alt={game.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-lg">{game?.name}</div>
                {game?.year && (
                  <div className="text-small text-foreground-500">{game.year}</div>
                )}
              </div>
            </ModalHeader>
            <ModalBody>
              {game && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip size="sm" variant="flat">Players: {game.players.min}-{game.players.max}</Chip>
                    <Chip size="sm" variant="flat">Time: {game.time.min}-{game.time.max}m</Chip>
                    {game.rating != null && <Chip size="sm" variant="flat">Rating: {game.rating.toFixed(2)}</Chip>}
                    <Chip size="sm" variant="flat" className="capitalize">{game.weight}</Chip>
                    {game.stats?.rank != null && <Chip size="sm" variant="flat">Rank: #{game.stats.rank}</Chip>}
                    {game.stats?.usersRated != null && <Chip size="sm" variant="flat">Users: {game.stats.usersRated}</Chip>}
                  </div>
                  {game.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {game.tags.slice(0, 12).map((t) => (
                        <Chip key={t} size="sm" variant="flat" className="capitalize">{t.replace('-', ' ')}</Chip>
                      ))}
                    </div>
                  ) : null}
                  <Divider />
                  <div style={{whiteSpace: 'pre-line'}} className="text-sm leading-relaxed">
                    {description || 'No description available.'}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {game?.url && (
                <Button as={"a" as any} href={game.url} target="_blank" rel="noopener" variant="light">
                  View on BGG
                </Button>
              )}
              <Button color="primary" onPress={() => (onClose as any)()}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

