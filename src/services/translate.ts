import fs from 'fs'
import { deepMap } from '../helpers/deep-map'
import { TranslateFileConfig } from '../types/local'
import { getClient, getSupportedTargetLanguages, translate } from './deepl'
import { SourceLanguageCode, TargetLanguageCode, Translator } from 'deepl-node'

const BASE_PATH = __dirname + '/../..'

export async function translateFile(config: TranslateFileConfig): Promise<void> {
  const deeplClient = getClient()
  await validateLanguages(deeplClient, config)

  const fileContent = require(config.sourceFile)
  const translated = await deepMap(fileContent, translate(deeplClient, config))
  return saveFile(config.outputFile, translated)
}

export function prepareConfig(args: Record<string, string>): TranslateFileConfig {
  return {
    sourceFile: `${BASE_PATH}/sources/${args.s}`,
    outputFile: `${BASE_PATH}/outputs/${args.s}`,
    sourceLanguage: args.sl as SourceLanguageCode | null,
    outputLanguage: args.ol as TargetLanguageCode,
  }
}

export function validateConfig(config: TranslateFileConfig): void {
  [
    { error: 'Source path is required', checkFn: (): boolean => !config.sourceFile },
    { error: 'Source file does not exist', checkFn: (): boolean => !fs.existsSync(config.sourceFile) },
    { error: 'Output path is required', checkFn: (): boolean => !config.outputFile },
    { error: 'Output language is required', checkFn: (): boolean => !config.outputLanguage },
  ].forEach(({ checkFn, error }) => {
    if (checkFn()) {
      throw new Error(error)
    }
  })
}

async function validateLanguages(deeplClient: Translator, config: TranslateFileConfig): Promise<void> {
  const outputLanguages = await getSupportedTargetLanguages(deeplClient)
  if (!outputLanguages.find(language => language.code === config.outputLanguage)) {
    throw new Error('Output language is not supported')
  }
  
  const languageToSkip: string[] = ['en']
  const sourceLanguages = await getSupportedTargetLanguages(deeplClient)
  if (
    !!config.sourceLanguage
    && !languageToSkip.includes(config.sourceLanguage)
    && !sourceLanguages.find(language => language.code === config.sourceLanguage)
  ) {
    throw new Error('Source language is not supported')
  }
}

function saveFile(path: string, content: unknown): void {
  return fs.writeFileSync(path, JSON.stringify(content, null, 2))
}
