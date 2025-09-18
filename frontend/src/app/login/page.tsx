"use client"
import {FormEvent, Suspense, useMemo, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {Card, CardBody, CardHeader} from "@heroui/card";
import {Input} from "@heroui/input";
import {Button} from "@heroui/button";
import {Link} from "@heroui/link";
import {subtitle, title} from "@/src/components/primitives";
import {EyeIcon, EyeOffIcon} from "@/src/components/Icons";
import {apiFetch} from '@/src/lib/api'
import {emitAuthChanged} from '@/src/lib/events'

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="container mx-auto max-w-7xl p-6">Loading…</div>}>
            <LoginForm/>
        </Suspense>
    )
}

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = useMemo(() => searchParams.get('next') || '/profile', [searchParams])

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [passwordShown, setPasswordShown] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        const response = await apiFetch('/api/auth/login', {
            method: 'POST',
            json: {email, password},
        })

        setLoading(false)

        if (response.ok) {
            emitAuthChanged()
            router.push(next)
        } else {
            const data = await response.json().catch(() => null)
            setError(data?.error || 'Login failed')
        }
    }

    return (
        <section className="container mx-auto max-w-7xl min-h-[70vh] flex items-center justify-center">
            <div className="w-full max-w-md px-4">
                <div className="mb-6 text-center">
                    <h1 className={title({size: "md"})}>Welcome back</h1>
                    <p className={subtitle()}>Sign in to your account</p>
                </div>
                <Card className="bg-content1/60 backdrop-blur-md">
                    <CardHeader className="pb-0">
                        <h2 className="text-xl font-semibold">Sign In</h2>
                    </CardHeader>
                    <CardBody className="gap-4">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <Input
                                name="email"
                                type="email"
                                label="Email"
                                placeholder="you@example.com"
                                variant="bordered"
                                required
                                autoFocus
                            />
                            <Input
                                name="password"
                                type={passwordShown ? "text" : "password"}
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
                            {error && (
                                <div className="text-danger text-sm" role="alert">
                                    {error}
                                </div>
                            )}
                            <Button color="primary" type="submit" isLoading={loading}>
                                Sign In
                            </Button>
                            <div className="text-center text-small text-foreground-500">
                                Don’t have an account?{' '}
                                <Link href="/signup">Create one</Link>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </section>
    )
}
