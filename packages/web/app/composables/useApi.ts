export function useApi() {
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie'])

  return $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    headers
  })
}
