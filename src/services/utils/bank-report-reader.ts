import * as fs from 'fs'
import * as _ from 'lodash'
import { CsvLoader } from './csv-loader'

export interface BankReport {
  balance: number | null
  transactions: CsvTransaction[]
  cardTransactionsToReplace: CsvTransaction[]
}

export interface CsvTransaction {
  date: string
  label: string
  debit: number | null
  credit: number | null
}

export class BankReportReader {
  private readonly csvLoader: CsvLoader

  constructor(loader: CsvLoader) {
    this.csvLoader = loader
  }

  /**
   * Parses the given file to generate a bank report
   */
  async getBankReportFromFile(csvFilePath: string): Promise<BankReport> {
    const content = fs.readFileSync(csvFilePath, 'latin1')

    const bankReport: BankReport = await this.analyzeMainPart(content)
    const initialTotalAmount = this.computeInitialTotalAmount(bankReport)

    // ---------------- First card ----------------
    const contentCard1: string = this.extractFabCc(content)
    // Last month
    const lastMonthForCard1: BankReport = await this.analyzeCCPart(this.extractLastMonthContent(contentCard1))
    this.mergeTransactions(bankReport, lastMonthForCard1)
    // Previous month if it is available
    if (this.has2MonthsForCC(contentCard1)) {
      const previousMonthForCard1: BankReport = await this.analyzeCCPart(this.extractPreviousMonthContent(contentCard1))
      this.mergeTransactions(bankReport, previousMonthForCard1)
    }

    // ---------------- Second card ----------------
    const contentCard2: string = this.extractCelineCc(content)
    // Last month
    const lastMonthForCard2: BankReport = await this.analyzeCCPart(this.extractLastMonthContent(contentCard2))
    this.mergeTransactions(bankReport, lastMonthForCard2)
    // Previous month if it is available
    if (this.has2MonthsForCC(contentCard2)) {
      const previousMonthForCard2: BankReport = await this.analyzeCCPart(this.extractPreviousMonthContent(contentCard2))
      this.mergeTransactions(bankReport, previousMonthForCard2)
    }

    // sanity check in case of errors
    if (this.sanityChecksFailed(bankReport, initialTotalAmount)) {
      return new Promise((resolve, reject) => {
        reject(`Sanity check failed for bank report:\n\n${bankReport}.`)
      })
    }

    return bankReport
  }

  /**
   * Analyze the part which contains all the transactions from the account (and not the credit card ones)
   */
  private async analyzeMainPart(content: string): Promise<BankReport> {
    const bankReport: BankReport = { balance: null, transactions: [], cardTransactionsToReplace: [] }
    const contentMainPart = content.substring(0, content.indexOf('MR FABRICE BELLINGARD - Titulaire;'))

    // Get the balance
    bankReport.balance = this.extractBalance(contentMainPart)

    // Get the transactions out of the rest of the content
    const transactionsContent = contentMainPart
      .substring(contentMainPart.indexOf('Crédit euros;') + 'Crédit euros;'.length)
      .trim()

    // And parse the CSV to get transactions out of this
    return new Promise((resolve, reject) => {
      this.csvLoader.extractTransactions(transactionsContent, (transactions, err) => {
        if (err) {
          return reject(err)
        } else {
          transactions!.forEach(t => {
            if (t.label.indexOf('DEPENSES CARTE') >= 0) {
              bankReport.cardTransactionsToReplace.push(t)
            } else {
              bankReport.transactions.push(t)
            }
          })
          resolve(bankReport)
        }
      })
    })
  }

  /**
   * Analyze the credit card part
   */
  private async analyzeCCPart(content: string): Promise<BankReport> {
    const ccReport: BankReport = { balance: null, transactions: [], cardTransactionsToReplace: [] }

    // Get the outstanding
    ccReport.balance = this.extractOutstanding(content)

    // Get the transactions out of the rest of the content
    const transactionsContent = content.substring(content.indexOf('Crédit euros;') + 'Crédit euros;'.length).trim()

    // And parse the CSV to get transactions out of this
    return new Promise((resolve, reject) => {
      this.csvLoader.extractTransactions(transactionsContent, (transactions, err) => {
        if (err) {
          return reject(err)
        } else {
          transactions!.forEach(t => {
            ccReport.transactions.push(t)
          })
          resolve(ccReport)
        }
      })
    })
  }

  private computeInitialTotalAmount(bankReport: BankReport) {
    const totalAmountOfTransactions: number = this.sumTransactions(bankReport.transactions)
    const totalAmountOfCC: number = this.sumTransactions(bankReport.cardTransactionsToReplace)
    return totalAmountOfCC + totalAmountOfTransactions
  }

  private sumTransactions(transactionsToSum: CsvTransaction[]): number {
    return _.chain(transactionsToSum)
      .map(t => (t.debit ? -t.debit : t.credit))
      .sum()
      .value()
  }

  private mergeTransactions(bankReport: BankReport, lastMonthForCard: BankReport) {
    lastMonthForCard.transactions.forEach(transaction => {
      bankReport.transactions.push(transaction)
    })
  }

  private sanityChecksFailed(bankReport: BankReport, initialTotalAmount: number) {
    const totalAmountAfterMerge: number = this.sumTransactions(bankReport.transactions)
    return initialTotalAmount !== totalAmountAfterMerge
  }

  extractFabCc(content: string): string {
    return content
      .substring(
        content.indexOf('MR FABRICE BELLINGARD - Titulaire;'),
        content.indexOf('MLLE CELINE SAPUTO - Titulaire;')
      )
      .trim()
  }

  extractCelineCc(content: string): string {
    return content.substring(content.indexOf('MLLE CELINE SAPUTO - Titulaire;')).trim()
  }

  extractLastMonthContent(content: string): string {
    const lastMonthStartIndex = content.indexOf('Encours débité le')
    const previousMonthStartIndex = content.indexOf('Encours débité le', lastMonthStartIndex + 1)
    if (previousMonthStartIndex > 0) {
      return content.substring(lastMonthStartIndex, previousMonthStartIndex).trim()
    } else {
      return content.substring(lastMonthStartIndex).trim()
    }
  }

  extractPreviousMonthContent(content: string): string {
    const lastMonthStartIndex = content.indexOf('Encours débité le')
    const previousMonthStartIndex = content.indexOf('Encours débité le', lastMonthStartIndex + 1)
    return content.substring(previousMonthStartIndex).trim()
  }

  has2MonthsForCC(content: string): boolean {
    const lastMonthStartIndex = content.indexOf('Encours débité le')
    return content.indexOf('Encours débité le', lastMonthStartIndex + 1) > 0
  }

  extractBalance(content: string): number | null {
    const balanceLineIndex = content.indexOf('Solde au')
    const balanceLine = content.substring(balanceLineIndex, content.indexOf(';', balanceLineIndex)).trim()
    return this.turnToCents(balanceLine.substring(balanceLine.indexOf('/20') + 5, balanceLine.length - 1))
  }

  extractOutstanding(content: string): number | null {
    const outstandingLine = content.substring(0, content.indexOf('Date;')).trim()
    return this.turnToCents(outstandingLine.substring(outstandingLine.indexOf(';-') + 2, outstandingLine.length - 1))
  }

  private turnToCents(item: string): number | null {
    return item === ''
      ? null
      : parseInt(
          item
            .replace(/\s/g, '')
            .replace(',', '')
            .replace('.', '')
        )
  }
}
