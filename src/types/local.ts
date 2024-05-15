import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node'

export type TranslateFileConfig = {
  sourceFile: string
  outputFile: string
  sourceLanguage: SourceLanguageCode | null
  outputLanguage: TargetLanguageCode
}
