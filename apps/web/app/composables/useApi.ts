/**
 * Uses an internal base URL during SSR so the Nuxt container can reach the API
 * directly, while the browser keeps using the public URL exposed on localhost.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie'])

  return $fetch.create({
    baseURL: import.meta.server ? config.apiInternalBase : config.public.apiBase,
    credentials: 'include',
    headers
  })
}
