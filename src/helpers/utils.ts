export const formatObject = (content: Record<string, any>, indent: number = 2): string => {
  const spacing = ' '.repeat(indent)
  const entries = Object.entries(content).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `${spacing}${key}: ${formatObject(value, indent + 2)}`
    }
    return `${spacing}${key}: '${value}'`
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

export function flattenObject(
  obj: Record<string, any>,
  parentKey: string = '',
  result: Record<string, any> = {},
): Record<string, any> {
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