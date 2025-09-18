import Link from 'next/link'
import LogoutButton from '@/src/components/LogoutButton'

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

        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold">Profile</h1>
                <div className="rounded border p-4">
                    {/*<p><strong>Email:</strong> {user.email}</p>*/}
                    {/*<p><strong>Name:</strong> {user.name}</p>*/}
                    {/*<p><strong>Roles:</strong> {user.roles.join(', ') || '—'}</p>*/}
                </div>
                <LogoutButton/>
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
