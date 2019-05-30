import * as _ from 'lodash'
import Storage from './utils/storage'
import { Transactions, Transaction } from './transactions'
import { BankAccounts } from './bankaccounts'

export interface MonthlyStats {
  date: string
  total: number
  debits: number
  credits: number
  details?: { [categoryId: string]: number }
}

export class Stats {
  private readonly storage: Storage
  private readonly transactions: Transactions
  private readonly bankAccounts: BankAccounts

  constructor(storage: Storage, transactions: Transactions, bankAccounts: BankAccounts) {
    this.storage = storage
    this.transactions = transactions
    this.bankAccounts = bankAccounts
  }

  /**
   * Returns detailed stats for favorite accounts over the previous year
   */
  budgetForPreviousYear(date: Date) {
    const favoriteBankAccountIds: string[] = _.chain(this.bankAccounts.list())
      .filter(a => a.favorite)
      .map(a => a.id)
      .value()
    return this.statsForPreviousYear(favoriteBankAccountIds, date, true)
  }

  /**
   * Returns the monthly statistics for the given account, for the 12 months
   * prior to the given date
   * @param accountIds
   * @param date
   * @param details set to true to get the breakdown by categories
   */
  statsForPreviousYear(accountIds: string[], date: Date, details: boolean): MonthlyStats[] {
    const oneYearBefore = this.oneYearBeforeDate(date)
    return _.chain(this.transactions.listForAccounts(accountIds))
      .filter(t => t.date >= oneYearBefore && t.date < date.toISOString())
      .groupBy(t => t.date.substring(0, 7))
      .map(t => this.computeMonthlyStats(t, details))
      .sortBy(s => s.date)
      .value()
  }

  oneYearBeforeDate(date: Date): string {
    return `${date.getFullYear() - 1}-${date.getMonth() > 9 ? '' : '0'}${date.getMonth() + 1}-01`
  }

  computeMonthlyStats(transactions: Transaction[], details: boolean): MonthlyStats {
    const stats: MonthlyStats = {
      date: transactions[0].date,
      total: 0,
      debits: 0,
      credits: 0
    }
    if (details) {
      stats.details = {}
    }
    transactions.forEach(t => {
      if (
        // "other expenses"
        t.fromId === 'C120' ||
        // "other revenues"
        t.fromId === 'C159' ||
        // Bank transferts
        Transactions.isTransfer(t) ||
        // Unusual transactions are also ignored
        t.unusual
      ) {
        // Let's not count them
        return
      }

      // Compute amounts
      stats.total += t.amount
      if (t.amount > 0) {
        stats.credits += t.amount
      } else {
        stats.debits += t.amount
      }

      // If details are required, feed the relevant category stats
      if (details) {
        this.feedCategoryStats(stats, t)
      }
    })
    return stats
  }

  feedCategoryStats(stats: MonthlyStats, t: Transaction) {
    const categoryId = t.fromId
    if (stats.details![categoryId] === undefined) {
      stats.details![categoryId] = 0
    }
    stats.details![categoryId] += t.amount
  }
}
