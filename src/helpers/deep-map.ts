export async function deepMap(obj: any, fn: (value: string) => Promise<string>): Promise<Record<string, unknown>> {
  const isObject = (val: unknown): boolean => !!val && typeof val === 'object'
  const deepMapHelper = async (value: unknown): Promise<unknown> => {
    if (Array.isArray(value)) {
      return await Promise.all(value.map(deepMapHelper))
    }
    if (isObject(value)) {
      return deepMap(value, fn)
    }
    return await fn(value as string)
  }

  let results: Record<string, unknown> = {}
  for (const key in obj) {
    console.log(`Key: ${key}`)
    results[key] = await deepMapHelper(obj[key])
  }
  return results
}
