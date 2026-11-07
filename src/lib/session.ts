// Client-side session helpers — user stored in localStorage after name+PIN auth.

export interface SessionUser {
  id: string
  name: string
  role: "member" | "admin"
}

const KEY = "welearn.session.v1"

export function loadSession(): SessionUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionUser
    if (!parsed?.id || !parsed?.name) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(user: SessionUser) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(KEY)
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Something went wrong")
  }
  return data as T
}
