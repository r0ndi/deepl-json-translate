const BRACKET_VARIABLE_REPLACEMENT = 'XAXBXCX'

/* Hide .HBS variables behind placeholder so as not to translate them */
export function getHbsBracketsPlaceholders(text: string): [string, string[]] {
  const placeholders: string[] = []
  const modifiedText = text.replace(/\{(.*?)\}/g, (_, match) => {
    placeholders.push(match)
    return BRACKET_VARIABLE_REPLACEMENT
  })
  return [modifiedText, placeholders]
}

export function revertHbsBracketsFromPlaceholders(text: string, placeholders: string[]): string {
  return text.replace(new RegExp(BRACKET_VARIABLE_REPLACEMENT, 'g'), () => `{${placeholders.shift()}}`)
}
