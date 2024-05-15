import { Formality, Language, TagHandlingMode, TranslateTextOptions, Translator } from 'deepl-node'
import { TranslateFileConfig } from '../types/local'

const BRACKET_VARIABLE_REPLACEMENT = 'XXX'
let cachedTranslations: Record<string, string> = {}

export function getClient(): Translator {
  return new Translator(process.env.DEEPL_API_KEY || '')
}

export function translate(client: Translator, config: TranslateFileConfig): (text: string) => Promise<string> {
  return async (text: string): Promise<string> => {
    if (cachedTranslations[text]) return cachedTranslations[text]
    if (!text.length) return ''

    const placeholders: string[] = []
    const modifiedText = text.replace(/\{\{(.*?)\}\}/g, (_, match) => {
      placeholders.push(match)
      return BRACKET_VARIABLE_REPLACEMENT
    })

    const { text: translatedText } = await client.translateText(
      modifiedText, config.sourceLanguage || null, config.outputLanguage, getOptions(),
    )
    const translated = translatedText.replace(
      new RegExp(BRACKET_VARIABLE_REPLACEMENT, 'g'),
      () => `{{${placeholders.shift()}}}`,
    )

    cachedTranslations[text] = translated
    return translated
  }
}

export async function getSupportedSourceLanguages(client: Translator): Promise<readonly Language[]> {
  return client.getSourceLanguages()
}

export async function getSupportedTargetLanguages(client: Translator): Promise<readonly Language[]> {
  return client.getTargetLanguages()
}

function getOptions(): TranslateTextOptions {
  return {
    ...(process.env.DEEPL_FORMALITY ? { formality: process.env.DEEPL_FORMALITY as Formality } : {}),
    ...(process.env.DEEPL_TAG_HANDLING ? { tagHandling: process.env.DEEPL_TAG_HANDLING as TagHandlingMode } : {}),
    ...(process.env.DEEPL_PRESERVE_FORMATTING ? { preserveFormatting: process.env.DEEPL_PRESERVE_FORMATTING === '1' } : {}),
    ...(process.env.DEEPL_CONTEXT ? { context: process.env.DEEPL_CONTEXT } : {}),
  }
}
