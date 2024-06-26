import fs from 'fs'
import { deepMap } from '../helpers/deep-map'
import { TranslationConfig } from '../types/local'
import { getClient, getSupportedTargetLanguages, translateFn } from './deepl'
import { SourceLanguageCode, TargetLanguageCode, Translator } from 'deepl-node'
import { formatJSObject, formatTSObject, isSupportedFile } from '../helpers/utils'

const BASE_PATH = __dirname + '/../..'

export async function translate(config: TranslationConfig): Promise<void> {
  const deeplClient = getClient()
  await validateLanguages(deeplClient, config)

  return config.allFiles ? translateFiles(deeplClient, config) : translateFile(deeplClient, config)
}

export function prepareConfig(args: Record<string, string>): TranslationConfig {
  return {
    allFiles: args.allFiles === 'true',
    sourcePath: `${BASE_PATH}/sources`,
    outputPath: `${BASE_PATH}/outputs`,
    sourceFile: `${BASE_PATH}/sources/${args.s}`,
    outputFile: `${BASE_PATH}/outputs/${args.s}`,
    sourceLanguage: args.sl as SourceLanguageCode | null,
    outputLanguage: args.ol as TargetLanguageCode,
  }
}

export function validateConfig(config: TranslationConfig): void {
  ;[
    {
      error: 'Source path is required',
      checkFn: (): boolean => !config.sourceFile,
    },
    {
      error: 'Source file does not exist',
      checkFn: (): boolean => !config.allFiles && !fs.existsSync(config.sourceFile),
    },
    {
      error: 'Output path is required',
      checkFn: (): boolean => !config.outputFile,
    },
    {
      error: 'Output language is required',
      checkFn: (): boolean => !config.outputLanguage,
    },
  ].forEach(({ checkFn, error }) => {
    if (checkFn()) {
      throw new Error(error)
    }
  })
}

async function translateFile(deeplClient: Translator, config: TranslationConfig): Promise<void> {
  const fileContent = require(config.sourceFile)
  const translated = await deepMap(fileContent, translateFn(deeplClient, config))
  return saveFile(config.outputFile, translated)
}

async function translateFiles(deeplClient: Translator, config: TranslationConfig): Promise<void> {
  const filesToTranslate = fs.readdirSync(config.sourcePath).filter(isSupportedFile)
  if (!filesToTranslate.length) {
    throw new Error('No files to translate')
  }

  for (const file of filesToTranslate) {
    await translateFile(deeplClient, {
      ...config,
      sourceFile: `${config.sourcePath}/${file}`,
      outputFile: `${config.outputPath}/${file}`,
    })
  }
}

async function validateLanguages(deeplClient: Translator, config: TranslationConfig): Promise<void> {
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

function saveFile(path: string, content: Record<string, any>): void {
  if (path.includes('.json')) return fs.writeFileSync(path, JSON.stringify(content, null, 2))
  if (path.includes('.ts')) return fs.writeFileSync(path, formatTSObject(content, 2))
  return fs.writeFileSync(path, formatJSObject(content, 2))
}
