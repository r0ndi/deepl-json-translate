import dotenv from 'dotenv'
import minimist from 'minimist'
import { createGlossary } from './services/glossary'

dotenv.config({ path: './.env' })
process.on('unhandledRejection', err => console.error(err))

async function main() {
  const glossaryId = process.env.DEEPL_GLOSSARY_ID || 'glossary-id'
  await createGlossary(glossaryId)

  console.log('========= ========= =========')
  console.info('Glossary generated!')
}

main()