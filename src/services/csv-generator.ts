import fs from 'fs'
import { changeFileLang, flattenObject, isSupportedFile } from '../helpers/utils'
import { CsvGeneratorConfig } from '../types/local'

const DEFAULT_ORI_LANG = 'Polish'
const BASE_PATH = __dirname + '/../..'
const SOURCES_PATH = `${BASE_PATH}/sources`
const OUTPUTS_PATH = `${BASE_PATH}/outputs`
const ORIGINALS_PATH = `${BASE_PATH}/originals`
const HEADERS = (ori: string = DEFAULT_ORI_LANG) =>
  `"File"£"Key"£"${ori}"£"Original"£"Translation"£"Correction"£"Changed"£`

export function generateCsv({ srcLang, oriLang, outLang, oriName }: CsvGeneratorConfig): void {
  const filesToProccess = fs.readdirSync(`${BASE_PATH}/sources`).filter(isSupportedFile)
  const csvData: string[] = [HEADERS(oriName)]
  
  for (const file of filesToProccess) {
    const sourceFileContent = require(`${SOURCES_PATH}/${file}`)
    const sourceTranslations = flattenObject(sourceFileContent)

    const outputFile = changeFileLang(file, srcLang, outLang)
    const outputFileContent = require(`${OUTPUTS_PATH}/${outputFile}`)
    const outputTranslations = flattenObject(outputFileContent)

    const originalFile = changeFileLang(file, srcLang, oriLang)
    const originalFileContent = require(`${ORIGINALS_PATH}/${originalFile}`)
    const originalTranslations = flattenObject(originalFileContent)

    for (const key in sourceTranslations) {
      if (!outputTranslations[key]) {
        console.log(`Missing translation in ${file} with ${key}`)
        continue
      }

      csvData.push(`"${outputFile}"£"${key}"£"${originalTranslations[key]}"£"${sourceTranslations[key]}"£"${outputTranslations[key]}"£""£"0"`)
    }
  }

  const csvFilePath = `${OUTPUTS_PATH}/translation-summary.csv`
  fs.writeFileSync(csvFilePath, csvData.join('\n'), 'utf-8')
}

export function prepareConfig(args: Record<string, string>): CsvGeneratorConfig {
  return {
    srcLang: args.src as string,
    outLang: args.out as string,
    oriLang: args.ori as string,
    oriName: args.oriName as string,
  }
}
