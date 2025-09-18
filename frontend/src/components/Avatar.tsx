import React from 'react'

function hashToNumber(str: string) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0
    return Math.abs(h)
}

function colorFromSeed(seed: string) {
    const h = hashToNumber(seed) % 360
    const h2 = (h + 40) % 360
    return {
        start: `hsl(${h}deg 70% 55%)`,
        end: `hsl(${h2}deg 70% 55%)`,
    }
}

function initialsFrom(name?: string, email?: string) {
    const base = (name || email || '?').trim()
    if (!base) return '?'
    const parts = base.split(/\s+/).filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({name, email, size = 32, className = ''}: {
    name?: string;
    email?: string;
    size?: number;
    className?: string
}) {
    const seed = (email || name || 'user').toLowerCase()
    const {start, end} = colorFromSeed(seed)
    const text = initialsFrom(name, email)
    const style: React.CSSProperties = {
        width: size,
        height: size,
        backgroundImage: `linear-gradient(135deg, ${start}, ${end})`,
    }
    const fontSize = Math.max(12, Math.floor(size * 0.4))
    return (
        <div
            className={`inline-flex items-center justify-center rounded-full text-white font-semibold select-none ${className}`}
            style={style}
            aria-label={name || email || 'user avatar'}
            title={name || email || 'user'}
        >
            <span style={{fontSize}}>{text}</span>
        </div>
    )
}

