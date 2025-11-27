import dotenv from 'dotenv'
import minimist from 'minimist'
import { createGlossary } from './services/glossary'

dotenv.config({ path: './.env' })
process.on('unhandledRejection', err => console.error(err))

async function main() {
  const glossaryName = process.env.DEEPL_GLOSSARY_NAME || 'glossary-name'
  await createGlossary(glossaryName)

  console.log('========= ========= =========')
  console.info('Glossary generated!')
}

main()