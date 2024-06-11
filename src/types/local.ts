import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node'

export type TranslateFileConfig = {
  allFiles: boolean
  sourcePath: string
  outputPath: string
  sourceFile: string
  outputFile: string
  sourceLanguage: SourceLanguageCode | null
  outputLanguage: TargetLanguageCode
}
