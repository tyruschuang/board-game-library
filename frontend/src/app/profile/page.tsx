import Link from 'next/link'
import Image from 'next/image'
import {Card, CardBody, CardHeader} from '@heroui/card'
import {Chip} from '@heroui/chip'
import {Button} from '@heroui/button'
import {CollectionsPreview} from '@/src/components/CollectionsPreview'
import {Avatar} from '@/src/components/Avatar'
import {sampleGames} from '@/src/config/sampleGames'
import {discoverGames} from '@/src/config/discoverGames'

export default async function ProfilePage() {
    // const token = (await cookies()).get('token')?.value
    // if (!token) {
    //     return (
    //         <div className="space-y-4">
    //             <p>Not authenticated.</p>
    //             <Link href="/login" className="underline text-primary">Go to Login</Link>
    //         </div>
    //     )
    // }

    try {
        // const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me')
        // const {payload} = await jwtVerify(token, secret, {
        //     algorithms: ['HS256'],
        //     issuer: process.env.JWT_ISSUER || 'board-game-library',
        //     audience: process.env.JWT_AUDIENCE || 'board-game-client',
        // })
        //
        // const user = {
        //     id: payload.sub as string,
        //     email: payload.email as string,
        //     name: (payload.name as string) || '',
        //     roles: (payload.roles as string[]) || [],
        // }

        // Dummy profile data
        const user = {
            name: 'Alexandra River',
            email: 'alex@example.com',
            joined: 'Jan 2024',
            location: 'Seattle, WA',
            bio: 'Eurogame enthusiast. Loves engine-building and cozy co-ops. Always down for a 2-player duel.',
            favoriteTags: ['engine-building', 'co-op', 'deck-building', 'family'],
            favoriteWeight: 'medium',
        }

        const owned = sampleGames.slice(0, 6)
        const wishlist = sampleGames.slice(6, 12)
        const playedRecently = discoverGames.slice(0, 4)
        const recommended = [...discoverGames].sort((a,b) => (b.rating||0)-(a.rating||0)).slice(0,6)

        return (
            <div className="space-y-8">
                {/* Header */}
                <section className="flex flex-col gap-4">
                    <h1 className="text-2xl font-semibold">Profile</h1>
                    <Card className="bg-content1/60">
                        <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar name={user.name} email={user.email} size={56}/>
                                <div className="flex flex-col">
                                    <div className="text-xl font-semibold">{user.name}</div>
                                    <div className="text-small text-foreground-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 text-small text-foreground-600">
                                <Chip variant="flat">Joined {user.joined}</Chip>
                                <Chip variant="flat">{user.location}</Chip>
                                <Chip variant="flat" className="capitalize">Prefers {user.favoriteWeight} weight</Chip>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="bg-content1/60">
                        <CardBody>
                            <p className="text-foreground-600">{user.bio}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {user.favoriteTags.map((t) => (
                                    <Chip key={t} size="sm" variant="flat" className="capitalize">{t.replace('-', ' ')}</Chip>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </section>

                {/* Quick Stats */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[{label:'Owned', value: owned.length}, {label:'Wishlist', value: wishlist.length}, {label:'Played', value: playedRecently.length}, {label:'Collections', value: 3}].map((s) => (
                            <Card key={s.label} className="bg-content1/60">
                                <CardBody className="p-4">
                                    <div className="text-2xl font-bold">{s.value}</div>
                                    <div className="text-small text-foreground-500">{s.label}</div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Collections preview */}
                <CollectionsPreview/>

                {/* Owned preview */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Owned</h2>
                        <Button as={Link} href="/discover" size="sm" variant="bordered">Add more</Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {owned.map((g) => (
                            <Card key={g.id} className="bg-content1/60 overflow-hidden">
                                <CardBody className="p-0">
                                    <div className="relative w-full aspect-[4/3]">
                                        <Image src={g.image} alt={g.name} fill className="object-cover"/>
                                    </div>
                                    <div className="p-2 text-small font-medium truncate">{g.name}</div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Wishlist preview */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Wishlist</h2>
                        <Button as={Link} href="/discover" size="sm" variant="bordered">Discover</Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {wishlist.map((g) => (
                            <Card key={g.id} className="bg-content1/60 overflow-hidden">
                                <CardBody className="p-0">
                                    <div className="relative w-full aspect-[4/3]">
                                        <Image src={g.image} alt={g.name} fill className="object-cover"/>
                                    </div>
                                    <div className="p-2 text-small font-medium truncate">{g.name}</div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Recent activity */}
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Recent Activity</h2>
                    <Card className="bg-content1/60">
                        <CardBody className="divide-y divide-default-100">
                            {[ 
                                {icon:'✨', text:'Added Wingspan to "Family Favorites"'},
                                {icon:'🎲', text:'Played Catan (4 players, 75m)'},
                                {icon:'🛒', text:'Wishlisted Dune: Imperium'},
                                {icon:'📌', text:'Rated Azul 8/10'},
                            ].map((a, i) => (
                                <div key={i} className="py-2 flex items-center gap-3 text-foreground-600">
                                    <span className="text-lg">{a.icon}</span>
                                    <span className="text-small">{a.text}</span>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </section>

                {/* Recommended for you */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recommended for You</h2>
                        <Button as={Link} href="/similar" size="sm" variant="bordered">Find similar</Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommended.map((g) => (
                            <Card key={g.id} className="bg-content1/60 overflow-hidden">
                                <CardHeader className="flex gap-3 items-center">
                                    <div className="relative w-14 h-14 rounded-md overflow-hidden">
                                        <Image src={g.image} alt={g.name} fill className="object-cover"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="font-semibold">{g.name}</div>
                                        <div className="text-small text-foreground-500">
                                            {g.players.min}-{g.players.max} players • {g.time.min}-{g.time.max}m
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0">
                                    <div className="flex flex-wrap gap-2">
                                        {g.tags.slice(0, 4).map((t) => (
                                            <Chip key={t} size="sm" variant="flat" className="capitalize">{t.replace('-', ' ')}</Chip>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        )
    } catch {
        return (
            <div className="space-y-4">
                <p>Session is invalid or expired.</p>
                <Link href="/login" className="underline text-primary">Sign in again</Link>
            </div>
        )
    }
}
