import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node'

export type TranslationConfig = {
  allFiles: boolean
  sourcePath: string
  outputPath: string
  sourceFile: string
  outputFile: string
  sourceLanguage: SourceLanguageCode | null
  outputLanguage: TargetLanguageCode
}

export type CsvGeneratorConfig = {
  srcLang: string
  outLang: string
  oriLang: string
  oriName: string
}