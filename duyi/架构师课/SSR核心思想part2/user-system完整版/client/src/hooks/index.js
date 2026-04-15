export const useServerData = async (cb) => {
  if (import.meta.env.SSR && cb) {
    await cb()
  }
}
