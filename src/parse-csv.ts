import dotenv from 'dotenv'
import { parseCsv, prepareConfig } from './services/csv-parser'
import minimist from 'minimist'

dotenv.config({ path: './.env' })
process.on('unhandledRejection', err => console.error(err))

async function main() {
  const args = minimist(process.argv.slice(2))
  const config = prepareConfig(args)
  await parseCsv(config)

  console.log('========= ========= =========')
  console.info('Csv parsed!')
}

main()