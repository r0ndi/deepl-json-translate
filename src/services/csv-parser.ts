import { changeFileLang, saveFile } from "../helpers/utils"

const BASE_PATH = __dirname + '/../..'
const CSV_FILE_PATH = `${BASE_PATH}/sources/results.csv`
const OUTPUT_PATH = `${BASE_PATH}/outputs`

type TranslationContent = {
  [key: string]: Translations
}

type Translations = {
  [key: string]: string | Translations
}

type Config = {
  targetLang: string
  sourceLang: string
}

export function parseCsv({ targetLang, sourceLang = 'en' }: Config): void {
  const csvContent = require('fs').readFileSync(CSV_FILE_PATH, 'utf-8')
  const translations = parseContentToTranslations(csvContent)

  for (const key in translations) {
    const parsedTranslations = transformData(translations[key])
    const fileName = changeFileLang(key, sourceLang, targetLang)
    saveFile(`${OUTPUT_PATH}/${fileName}`, parsedTranslations)
  }
}

export function prepareConfig(args: Record<string, string>): Config {
  return {
    targetLang: args.t,
    sourceLang: args.s,
  }
}

function parseContentToTranslations(content: string): TranslationContent {
  const translations: TranslationContent = {}

  const lines = content.split('\n')
  for (const line of lines) {
    const columns = line.split(',')
    if (!translations[columns[0]]) {
      translations[columns[0]] = {}
    }
    translations[columns[0]][columns[1]] = columns[4]
  }

  return translations
}

function transformData(items: Translations): Translations {
  const result: Translations = {}

  Object.entries(items).forEach(([key, value]) => {
    if (!key.includes('.')) {
      result[key] = value
      return
    }

    let current = result
    const keys = key.split('.')
    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        current[k] = value
        return
      }

      if (!current[k]) {
        current[k] = {}
      }
      current = current[k] as any
    })
  })

  return result
}

