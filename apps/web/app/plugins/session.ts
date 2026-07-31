export default defineNuxtPlugin(async () => {
  const { profile, refresh } = useSession()

  if (!profile.value) {
    await refresh()
  }
})
