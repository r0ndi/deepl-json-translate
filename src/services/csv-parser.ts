import { changeFileLang, saveFile } from '../helpers/utils'
import csv from 'csv-parser'

const BASE_PATH = __dirname + '/../..'
const CSV_FILE_PATH = `${BASE_PATH}/sources/results.csv`
const OUTPUT_PATH = `${BASE_PATH}/outputs`

type CSVData = { file: string, key: string, value: string }[]

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

export async function parseCsv({ targetLang, sourceLang = 'en' }: Config): Promise<void> {
  const csvData = await fetchCsvData()
  const translations = parseCsvContent(csvData)

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

function fetchCsvData(): Promise<CSVData> {
  return new Promise((resolve) => {
    const results: CSVData = []
    require('fs')
      .createReadStream(CSV_FILE_PATH)
      .pipe(csv({ separator: ',' }))
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
  })
}

function parseCsvContent(content: CSVData): TranslationContent {
  const translations: TranslationContent = {}

  for (const { file, key, value } of content) {
    if (!translations[file]) {
      translations[file] = {}
    }
    translations[file][key] = value
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

