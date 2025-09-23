import Link from 'next/link'
import Image from 'next/image'
import {Card, CardBody, CardHeader} from '@heroui/card'
import {Button} from '@heroui/button'
import {Chip} from '@heroui/chip'

import {sampleCollections} from '@/src/config/collections'

export function CollectionsPreview() {
  const collections = sampleCollections.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Collections</h2>
        <Button as={Link} href="/collections" size="sm" variant="bordered" color="primary">
          Manage Collections
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {collections.map((c) => (
          <Card key={c.id} className="bg-content1/60 overflow-hidden">
            <CardHeader className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-md overflow-hidden">
                <Image
                  src={c.games[0]?.image || 'https://picsum.photos/seed/collection/200/200'}
                  alt={c.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="font-semibold">{c.name}</div>
                <div className="text-small text-foreground-500">{c.games.length} games</div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {c.description && (
                <p className="text-small text-foreground-600 mb-3 line-clamp-2">{c.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {c.games.slice(0, 5).map((g) => (
                  <Chip key={g.id} size="sm" variant="flat" className="capitalize">
                    {g.name}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

