import dotenv from 'dotenv'
import { generateCsv } from './services/csv-generator'

dotenv.config({ path: './.env' })
process.on('unhandledRejection', err => console.error(err))

async function main() {
  generateCsv()

  console.log('========= ========= =========')
  console.info('File generated!')
}

main()