type ProfileResponse = {
  authenticated: true
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    isAnonymous: boolean
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

type DeleteAccountResponse = {
  deleted: true
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

  async function signInAnonymously() {
    loading.value = true
    errorMessage.value = null

    try {
      await api('/api/auth/sign-in/anonymous', {
        method: 'POST'
      })
      await refresh()
    } catch {
      errorMessage.value = 'La connexion anonyme a echoue.'
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    if (profile.value?.user.isAnonymous) {
      return
    }

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
    if (profile.value?.user.isAnonymous) {
      return
    }

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
    signInAnonymously,
    signOut
  }
}
