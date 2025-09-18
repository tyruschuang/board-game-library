"use client"
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {apiFetch} from '@/src/lib/api'
import {emitAuthChanged} from '@/src/lib/events'

export default function LogoutButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogout() {
        setLoading(true)
        setError(null)
        try {
            const res = await apiFetch('/api/auth/logout', {method: 'POST'})
            setLoading(false)
            if (res.ok) {
                emitAuthChanged()
                router.refresh()
                router.replace('/login')
            } else {
                const data = await res.json().catch(() => null)
                setError(data?.error || 'Logout failed')
            }
        } catch (e) {
            setLoading(false)
            setError('Network error')
        }
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-danger text-white py-2 px-3 rounded disabled:opacity-60"
                type="button"
            >
                {loading ? 'Logging out…' : 'Logout'}
            </button>
            {error && <div className="text-danger text-sm" role="alert">{error}</div>}
        </div>
    )
}
