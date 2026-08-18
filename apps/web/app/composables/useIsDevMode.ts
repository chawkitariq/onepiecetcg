/**
 * Returns whether the app is running in Nuxt/Vite dev mode.
 */
export function useIsDevMode() {
  return computed(() => import.meta.dev)
}
