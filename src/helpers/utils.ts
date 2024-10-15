import fs from 'fs'

export const formatObject = (content: Record<string, any>, indent: number = 2): string => {
  const prepareKey = (key: string): string => {
    return key.includes('/') || key.includes('-') || key.includes(' ') || key.includes('+')
      ? `'${key}'`
      : key
  }
  const prepareValue = (value: string): string => {
    return value
      .replace(/"s /g, "\\'s ")
      .replace(/"t /g, "\\'t ")
  }

  const spacing = ' '.repeat(indent)
  const entries = Object.entries(content).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${spacing}${prepareKey(key)}: ${formatArray(value, indent)}`
    }
    if (typeof value === 'object' && value !== null) {
      return `${spacing}${prepareKey(key)}: ${formatObject(value, indent + 2)}`
    }

    const preparedValue = prepareValue(value)
    const valueWithQuotes = preparedValue.includes('"') ? `'${preparedValue}'` : `"${preparedValue}"`
    return `${spacing}${prepareKey(key)}: ${valueWithQuotes}`.length > 120
      ? `${spacing}${prepareKey(key)}:\n${' '.repeat(indent + 2)}${valueWithQuotes}`
      : `${spacing}${prepareKey(key)}: ${valueWithQuotes}`
  })
  return `{\n${entries.join(',\n')}\n${' '.repeat(indent - 2)}}`
}

export const formatArray = (content: string[], indent: number): string => {
  return `[\n${content.map((item) => `${' '.repeat(indent + 2)}'${item}'`).join(',\n')},\n${' '.repeat(indent)}]`
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
  return file.replace(`${from}.`, `${to}.`)
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
