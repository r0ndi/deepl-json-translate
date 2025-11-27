import { GlossaryEntries, LanguageCode, Translator } from 'deepl-node'
import { GlossaryContent } from '../types/local'
import { getClient, updateGlossary } from './deepl'
import fs from 'fs'

const BASE_PATH = __dirname + '/../..'
const GLOSSARY_PATH = `${BASE_PATH}/sources/glossary.csv`

export async function createGlossary(glossaryName: string): Promise<void> {
  if (!fs.existsSync(GLOSSARY_PATH)) {
    console.warn('Glossary file not found, skipping glossary creation.')
    return
  }

  const client = getClient()
  await deleteGlossaries(client)

  const glossaryContent = parseGlossaryFileSource()
  for (const glossary of glossaryContent) {
    const response = await updateGlossary(client)(glossaryName, glossary)
    console.log(`Created ${response.glossaryId}: ${response.sourceLang} -> ${response.targetLang} [Items: ${response.entryCount}]`)
  }
}

async function deleteGlossaries(client: Translator): Promise<void> {
  const glossaries = await client.listGlossaries()
  for (const glossary of glossaries) {
    await client.deleteGlossary(glossary.glossaryId)
  }
}

const parseGlossaryFileSource = (): GlossaryContent[] => {
  const glossaryContent = fs.readFileSync(GLOSSARY_PATH, 'utf-8')
  const lines = glossaryContent.split('\n').filter((line: string) => line.trim().length > 0)

  const glossaryMap: Map<string, { [key: string]: string }> = new Map()
  
  for (const line of lines) {
    const [sourceTerm, targetTerm, sourceLang, targetLang] = line
      .split(',')
      .map((term: string) => term.trim().replace(/(^"|"$)/g, ''))

    const mapKey = `${sourceLang}-${targetLang}`
    const mapEntry = { [sourceTerm]: targetTerm }
    const currentEntries = glossaryMap.get(mapKey) || {}
    glossaryMap.set(mapKey, { ...currentEntries, ...mapEntry })
  }

  const glossaryContentArray: GlossaryContent[] = []
  for (const [key, entries] of glossaryMap.entries()) {
    glossaryContentArray.push({
      sourceLang: key.split('-')[0] as LanguageCode,
      targetLang: key.split('-')[1] as LanguageCode,
      entries: new GlossaryEntries({ entries }),
    })
  }

  return glossaryContentArray
}
