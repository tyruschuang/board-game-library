"use client"
import { FormEvent, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { Link } from "@heroui/link"
import { title, subtitle } from "@/src/components/primitives"

export default function SignupPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = useMemo(() => searchParams.get('next') || '/profile', [searchParams])

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

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
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        })
        setLoading(false)

        if (res.ok) {
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
                    <h1 className={title({ size: "md" })}>Create your account</h1>
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
                                type="password"
                                label="Password"
                                placeholder="••••••••"
                                description="Use at least 8 characters."
                                variant="bordered"
                                required
                            />
                            <Input
                                name="confirm"
                                type="password"
                                label="Confirm Password"
                                placeholder="••••••••"
                                variant="bordered"
                                required
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

