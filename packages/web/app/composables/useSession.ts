type ProfileResponse = {
  authenticated: true
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  profile: {
    id: string
    displayName: string
    email: string | null
    image: string | null
    createdAt: string
    updatedAt: string
  }
}

type SocialSignInResponse = {
  redirect: boolean
  url?: string
}

export type DevFixtureAccount = {
  name: string
  email: string
  password: string
}

type DeleteAccountResponse = {
  deleted: true
}

type AuthConfigResponse = {
  emailPasswordEnabled: boolean
  devFixtureAccounts: DevFixtureAccount[]
}

export function useSession() {
  const api = useApi()
  const profile = useState<ProfileResponse | null>('session-profile', () => null)
  const errorMessage = useState<string | null>('session-error', () => null)
  const loading = useState('session-loading', () => false)

  async function refresh() {
    loading.value = true
    errorMessage.value = null

    try {
      profile.value = await api<ProfileResponse>('/me')
    } catch (error: unknown) {
      profile.value = null

      const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number(error.statusCode)
        : undefined

      if (statusCode && statusCode !== 401) {
        errorMessage.value = 'Impossible de vérifier la session.'
      }
    } finally {
      loading.value = false
    }
  }

  async function signIn(provider: 'google' | 'discord') {
    const callbackURL = new URL(window.location.pathname + window.location.search, window.location.origin).toString()

    const response = await api<SocialSignInResponse>('/api/auth/sign-in/social', {
      method: 'POST',
      body: {
        callbackURL,
        provider
      }
    })

    if (response.redirect && response.url) {
      window.location.href = response.url
    }
  }

  /**
   * Dev-only shortcut: signs in with email/password. The API only accepts this when
   * running in development (see packages/api CLAUDE.md) — always rejected in production.
   */
  async function signInWithEmailPassword(email: string, password: string) {
    loading.value = true
    errorMessage.value = null

    try {
      await api('/api/auth/sign-in/email', {
        method: 'POST',
        body: { email, password }
      })
      await refresh()
    } catch {
      errorMessage.value = 'La connexion a echoue.'
    } finally {
      loading.value = false
    }
  }

  async function getAuthConfig() {
    return api<AuthConfigResponse>('/auth-config')
  }

  async function signOut() {
    loading.value = true
    errorMessage.value = null

    try {
      await api('/api/auth/sign-out', { method: 'POST' })
      profile.value = null
      await navigateTo('/')
    } catch {
      errorMessage.value = 'La deconnexion a echoue.'
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount() {
    loading.value = true
    errorMessage.value = null

    try {
      await api<DeleteAccountResponse>('/me', { method: 'DELETE' })
      profile.value = null
      await navigateTo('/')
    } catch (error) {
      errorMessage.value = 'La suppression du compte a echoue.'
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    deleteAccount,
    errorMessage,
    loading,
    profile,
    refresh,
    signIn,
    signInWithEmailPassword,
    getAuthConfig,
    signOut
  }
}
