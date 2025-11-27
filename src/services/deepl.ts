import { getHbsBracketsPlaceholders, revertHbsBracketsFromPlaceholders } from '../helpers/hbs-brackets'
import { Formality, GlossaryInfo, Language, SourceLanguageCode, TagHandlingMode, TargetLanguageCode, TranslateTextOptions, Translator } from 'deepl-node'
import { GlossaryContent, TranslationConfig } from '../types/local'
import { parseLang } from '../helpers/utils'

let cachedTranslations: Record<string, string> = {}

export function getClient(): Translator {
  return new Translator(process.env.DEEPL_API_KEY || '')
}

export async function translateFn(client: Translator, config: TranslationConfig): Promise<(text: string) => Promise<string>> {
  const glossaryId = await getGlossaryId(client, config.sourceLanguage || null, config.outputLanguage)
  return async (text: string): Promise<string> => {
    if (cachedTranslations[text]) return cachedTranslations[text]
    if (!text.length) return ''

    const [modifiedText, placeholders] = getHbsBracketsPlaceholders(text)
    const { text: translatedText } = await client.translateText(
      modifiedText, config.sourceLanguage || null, config.outputLanguage, getOptions(glossaryId),
    )
    const translated = revertHbsBracketsFromPlaceholders(translatedText, placeholders)
    cachedTranslations[text] = translated
    return translated
  }
}

export function updateGlossary(client: Translator): (name: string, glossary: GlossaryContent) => Promise<GlossaryInfo> {
  return async (name: string, glossary: GlossaryContent): Promise<GlossaryInfo> => {
    return client.createGlossary(name, glossary.sourceLang, glossary.targetLang, glossary.entries)
  }
}

export async function getSupportedSourceLanguages(client: Translator): Promise<readonly Language[]> {
  return client.getSourceLanguages()
}

export async function getSupportedTargetLanguages(client: Translator): Promise<readonly Language[]> {
  return client.getTargetLanguages()
}

function getOptions(glossaryId: string | undefined): TranslateTextOptions {
  return {
    ...(process.env.DEEPL_FORMALITY ? { formality: process.env.DEEPL_FORMALITY as Formality } : {}),
    ...(process.env.DEEPL_TAG_HANDLING ? { tagHandling: process.env.DEEPL_TAG_HANDLING as TagHandlingMode } : {}),
    ...(process.env.DEEPL_PRESERVE_FORMATTING ? { preserveFormatting: process.env.DEEPL_PRESERVE_FORMATTING === '1' } : {}),
    ...(process.env.DEEPL_CONTEXT ? { context: process.env.DEEPL_CONTEXT } : {}),
    ...(glossaryId ? { glossary: glossaryId } : {}),
  }
}

async function getGlossaryId(
  client: Translator, sourceLang: SourceLanguageCode | null, targetLang: TargetLanguageCode,
): Promise<string | undefined> {
  if (!sourceLang) return undefined
  const glossaries = await client.listGlossaries()
  const glossary = glossaries.find(g => g.sourceLang === parseLang(sourceLang) && g.targetLang === parseLang(targetLang))
  return glossary?.glossaryId
}