import {DiscoverClient} from './DiscoverClient'

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5328'
  let initialResults: any[] = []
  let initialTotal = 0
  let initialPages = 0
  try {
    const res = await fetch(`${base}/api/bgg/hot?limit=20&page=1`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      initialResults = data?.results || []
      initialTotal = Number(data?.total || 0)
      initialPages = Number(data?.pages || 0)
    }
  } catch {}

  return (
    <DiscoverClient initialResults={initialResults as any} initialTotal={initialTotal} initialPages={initialPages} />
  )
}

