"use client"
import {FormEvent, Suspense, useMemo, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {Card, CardBody, CardHeader} from "@heroui/card"
import {Input} from "@heroui/input"
import {Button} from "@heroui/button"
import {Link} from "@heroui/link"
import {subtitle, title} from "@/src/components/primitives"
import {EyeIcon, EyeOffIcon} from "@/src/components/Icons"
import {apiFetch} from '@/src/lib/api'
import {emitAuthChanged} from '@/src/lib/events'

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="container mx-auto max-w-7xl p-6">Loading…</div>}>
            <SignupForm/>
        </Suspense>
    )
}

function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = useMemo(() => searchParams.get('next') || '/profile', [searchParams])

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [passwordShown, setPasswordShown] = useState(false)
    const [confirmShown, setConfirmShown] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        const formData = new FormData(event.currentTarget)
        const name = (formData.get('name') as string)?.trim()
        const email = (formData.get('email') as string)?.trim().toLowerCase()
        const password = formData.get('password') as string
        const confirm = formData.get('confirm') as string

        // Basic client validation
        if (!name || !email || !password) {
            setError('Please complete all required fields.')
            return
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        const res = await apiFetch('/api/auth/register', {
            method: 'POST',
            json: {name, email, password},
        })
        setLoading(false)

        if (res.ok) {
            emitAuthChanged()
            router.push(next)
        } else {
            const data = await res.json().catch(() => null)
            setError(data?.error || 'Sign up failed')
        }
    }

    return (
        <section className="container mx-auto max-w-7xl min-h-[70vh] flex items-center justify-center">
            <div className="w-full max-w-md px-4">
                <div className="mb-6 text-center">
                    <h1 className={title({size: "md"})}>Create your account</h1>
                    <p className={subtitle()}>Start organizing and discovering games</p>
                </div>
                <Card className="bg-content1/60 backdrop-blur-md">
                    <CardHeader className="pb-0">
                        <h2 className="text-xl font-semibold">Sign Up</h2>
                    </CardHeader>
                    <CardBody className="gap-4">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <Input
                                name="name"
                                type="text"
                                label="Name"
                                placeholder="Your name"
                                variant="bordered"
                                required
                                autoFocus
                            />
                            <Input
                                name="email"
                                type="email"
                                label="Email"
                                placeholder="you@example.com"
                                variant="bordered"
                                required
                            />
                            <Input
                                name="password"
                                type={passwordShown ? 'text' : 'password'}
                                label="Password"
                                placeholder="••••••••"
                                variant="bordered"
                                required
                                endContent={
                                    <button
                                        type="button"
                                        className="text-default-500 hover:text-foreground"
                                        onClick={() => setPasswordShown((v) => !v)}
                                        aria-label={passwordShown ? 'Hide password' : 'Show password'}
                                        aria-pressed={passwordShown}
                                    >
                                        {passwordShown ? <EyeOffIcon/> : <EyeIcon/>}
                                    </button>
                                }
                            />
                            <Input
                                name="confirm"
                                type={confirmShown ? 'text' : 'password'}
                                label="Confirm Password"
                                placeholder="••••••••"
                                variant="bordered"
                                description="Passwords must be at least 8 characters long."
                                required
                                endContent={
                                    <button
                                        type="button"
                                        className="text-default-500 hover:text-foreground"
                                        onClick={() => setConfirmShown((v) => !v)}
                                        aria-label={confirmShown ? 'Hide password' : 'Show password'}
                                        aria-pressed={confirmShown}
                                    >
                                        {confirmShown ? <EyeOffIcon/> : <EyeIcon/>}
                                    </button>
                                }
                            />
                            {error && (
                                <div className="text-danger text-sm" role="alert">
                                    {error}
                                </div>
                            )}
                            <Button color="primary" type="submit" isLoading={loading}>
                                Create Account
                            </Button>
                            <div className="text-center text-small text-foreground-500">
                                Already have an account?{' '}
                                <Link href="/login">Log in</Link>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </section>
    )
}
