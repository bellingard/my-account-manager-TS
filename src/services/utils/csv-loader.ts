import * as fs from 'fs'
// import Converter from 'csvtojson' => TODO: move to v2.0 of the API
const Converter = require('csvtojson/v1')

export interface CsvTransaction {
  date: string
  label: string
  debit: number | null
  credit: number | null
}

export class CsvLoader {
  /**
   * Parses the given file with the same output as
   * #extractTransactions
   */
  getTransactionsFromFile(
    csvFilePath: string,
    cb: (transactions: CsvTransaction[] | null, error: Error | null) => void
  ) {
    let content = fs.readFileSync(csvFilePath, 'latin1')
    return this.extractTransactions(content, cb)
  }

  /**
   * Parses a CSV content downloaded from the Bank app into a list of transactions
   * with the format:
   * {
        date: '2017-09-14',
        label: 'Foo',
        debit: 1000,
        credit: null
      }
   * ('credit' and 'debit' are parsed from floats and turned to Cents)
   * @param {*} csvContent
   * @param {*} cb(transactions, err)
   */
  extractTransactions(csvContent: string, cb: (transactions: CsvTransaction[] | null, error: Error | null) => void) {
    let contentToParse = this.removeUselessChars(csvContent)
    let transactions: CsvTransaction[] = []

    Converter({
      headers: ['date', 'label', 'debit', 'credit', 'other'],
      noheader: true,
      delimiter: ';',
      includeColumns: [0, 1, 2, 3],
      colParser: {
        date: function(item: string, head: string, resultRow: any, row: any, colIdx: number): string {
          return CsvLoader.revertDate(item)
        },
        label: function(item: string, head: string, resultRow: any, row: any, colIdx: number): string {
          return CsvLoader.replaceEndLinesBySpace(item)
        },
        debit: function(item: string, head: string, resultRow: any, row: any, colIdx: number): number | null {
          return CsvLoader.turnToCents(item)
        },
        credit: function(item: string, head: string, resultRow: any, row: any, colIdx: number): number | null {
          return CsvLoader.turnToCents(item)
        }
      },
      checkType: true
    })
      .fromString(contentToParse)
      .on('json', (jsonObj: CsvTransaction) => {
        transactions.push(jsonObj)
      })
      .on('done', (err: Error) => {
        if (err) {
          cb(null, err)
        } else {
          cb(transactions, null)
        }
      })
  }

  static replaceEndLinesBySpace(item: string): string {
    return item.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ')
  }

  static revertDate(item: string): string {
    return item.substr(6, 4) + '-' + item.substr(3, 2) + '-' + item.substr(0, 2)
  }

  static turnToCents(item: string): number | null {
    return item === '' ? null : parseInt(item.replace(',', ''))
  }

  removeUselessChars(csvContent: string) {
    let eurosPosition = csvContent.lastIndexOf('Euros;')
    if (eurosPosition > 0) {
      return csvContent.substr(eurosPosition + 'Euros;'.length, csvContent.length).trim()
    } else {
      return csvContent.trim()
    }
  }

  /**
   * Fixes the bad CSV to add ';' at the end of each line that starts with a .
   * @param {*} text the CSV content
   */
  addMissingSemiColon(text: string) {
    let goodCsv = ''
    let lines = text.split('\n')
    lines.forEach(line => {
      let l = line.trim()
      if (l.startsWith('.')) {
        goodCsv += l.substr(1) + ';\n'
      } else {
        goodCsv += l + '\n'
      }
    })
    return goodCsv
  }
}
