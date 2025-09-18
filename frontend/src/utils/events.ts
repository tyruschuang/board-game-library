export const AUTH_CHANGED_EVENT = 'auth:changed'

export function emitAuthChanged() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
    }
}

export function onAuthChanged(handler: () => void) {
    if (typeof window !== 'undefined') {
        window.addEventListener(AUTH_CHANGED_EVENT, handler)
        return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler)
    }
    return () => {
    }
}

