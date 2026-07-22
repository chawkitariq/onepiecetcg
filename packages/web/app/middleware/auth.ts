export default defineNuxtRouteMiddleware(async (to) => {
  const { profile, refresh } = useSession()

  if (!profile.value) {
    await refresh()
  }

  if (!profile.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
