import fs from 'fs'

export const formatObject = (content: Record<string, any>, indent: number = 2): string => {
  const prepareKey = (key: string): string => key.includes('-') ? `'${key}'` : key
  const spacing = ' '.repeat(indent)
  const entries = Object.entries(content).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `${spacing}${prepareKey(key)}: ${formatObject(value, indent + 2)}`
    }
    return `${spacing}${prepareKey(key)}: '${value}'`
  })
  return `{\n${entries.join(',\n')}\n${' '.repeat(indent - 2)}}`
}

export const formatJSObject = (content: Record<string, any>, indent: number): string => {
  return `module.exports = ${formatObject(content, indent)}`
}

export const formatTSObject = (content: Record<string, any>, indent: number): string => {
  return `export default ${formatObject(content.default, indent)}`
}

export const isSupportedFile = (file: string): boolean => {
  return ['.json', '.js', '.ts'].includes(file.substring(file.lastIndexOf('.')))
}

export const changeFileLang = (file: string, from: string, to: string): string => {
  return file.replace(`${from}.json`, `${to}.json`)
}

export const flattenObject = (
  obj: Record<string, any>,
  parentKey: string = '',
  result: Record<string, any> = {},
): Record<string, any> => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        flattenObject(obj[key], newKey, result)
      } else {
        result[newKey] = obj[key]
      }
    }
  }
  return result
}

export const saveFile = (path: string, content: Record<string, any>): void => {
  if (path.includes('.json')) return fs.writeFileSync(path, JSON.stringify(content, null, 2))
  if (path.includes('.ts')) return fs.writeFileSync(path, formatTSObject(content, 2))
  return fs.writeFileSync(path, formatJSObject(content, 2))
}
