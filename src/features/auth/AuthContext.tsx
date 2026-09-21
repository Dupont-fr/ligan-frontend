import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  login as loginApi,
  logout as logoutApi,
  me as meApi,
  refreshUser as refreshApi,
  register as registerApi,
  type RegisterInput,
  type User,
} from '../../services/auth'

export type AuthStatus = 'loading' | 'guest' | 'authenticated'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const refreshUser = useCallback(async () => {
    try {
      const data = await meApi()
      setUser(data.user)
      setStatus('authenticated')
      return data.user
    } catch {
      try {
        const data = await refreshApi()
        setUser(data.user)
        setStatus('authenticated')
        return data.user
      } catch {
        setUser(null)
        setStatus('guest')
        return null
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    meApi()
      .then((data) => {
        if (cancelled) return
        setUser(data.user)
        setStatus('authenticated')
      })
      .catch(() => {
        refreshApi()
          .then((data) => {
            if (cancelled) return
            setUser(data.user)
            setStatus('authenticated')
          })
          .catch(() => {
            if (cancelled) return
            setUser(null)
            setStatus('guest')
          })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      async login(email, password) {
        const data = await loginApi(email, password)
        setUser(data.user)
        setStatus('authenticated')
        return data.user
      },
      async register(input) {
        const data = await registerApi(input)
        return data.user
      },
      async logout() {
        try {
          await logoutApi()
        } finally {
          setUser(null)
          setStatus('guest')
        }
      },
      refreshUser,
    }),
    [user, status, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  }
  return ctx
}