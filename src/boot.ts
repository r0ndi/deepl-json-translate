import dotenv from 'dotenv'
import minimist from 'minimist'
import { prepareConfig, translateFile, validateConfig } from './services/translate'

dotenv.config({ path: './.env' })
process.on('unhandledRejection', err => console.error(err))

async function main() {
  const args = minimist(process.argv.slice(2))
  const config = prepareConfig(args)
  validateConfig(config)

  await translateFile(config)

  console.log('========= ========= =========')
  console.info('Translation completed!')
}

main()