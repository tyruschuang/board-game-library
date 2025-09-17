import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

async function verifyToken(token: string) {
    const secret = new TextEncoder().encode(JWT_SECRET)
    return jwtVerify(token, secret, {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'board-game-library',
        audience: process.env.JWT_AUDIENCE || 'board-game-client',
    })
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Only protect the matched routes; see config below
    const token = req.cookies.get('token')?.value
    if (!token) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    try {
        await verifyToken(token)
        return NextResponse.next()
    } catch {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }
}

export const config = {
    matcher: ['/profile'],
}

