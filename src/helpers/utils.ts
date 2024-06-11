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
  return `export default ${formatObject(content, indent)}`
}
