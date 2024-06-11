import fs from 'fs'
import { flattenObject, isSupportedFile } from '../helpers/utils'

const BASE_PATH = __dirname + '/../..'
const SOURCES_PATH = `${BASE_PATH}/sources`
const OUTPUTS_PATH = `${BASE_PATH}/outputs`
const HEADERS = 'File;Key;Original;Translation;Correction;Changed;'

export function generateCsv(): void {
  const filesToProccess = fs.readdirSync(`${BASE_PATH}/sources`).filter(isSupportedFile)
  const csvData: string[] = [HEADERS]
  
  for (const file of filesToProccess) {
    const originalFileContent = require(`${SOURCES_PATH}/${file}`)
    const originalTranslations = flattenObject(originalFileContent)

    const newFileContent = require(`${OUTPUTS_PATH}/${file}`)
    const newTranslations = flattenObject(newFileContent)

    for (const key in originalTranslations) {
      if (!newTranslations[key]) {
        console.log('Missing translation:', key)
        continue
      }

      csvData.push(`${file};${key};${originalTranslations[key]};${newTranslations[key]};;0`)
    }
  }

  const csvFilePath = `${OUTPUTS_PATH}/translation-summary.csv`
  fs.writeFileSync(csvFilePath, csvData.join('\n'), 'utf-8')
}
