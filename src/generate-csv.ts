import dotenv from 'dotenv'
import { generateCsv, prepareConfig } from './services/csv-generator'
import minimist from 'minimist'

dotenv.config({ path: './.env' })
process.on('unhandledRejection', err => console.error(err))

async function main() {
  const args = minimist(process.argv.slice(2))
  const config = prepareConfig(args)
  generateCsv(config)

  console.log('========= ========= =========')
  console.info('File generated!')
}

main()