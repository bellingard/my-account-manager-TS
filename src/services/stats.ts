import * as _ from 'lodash'
import Storage from './utils/storage'
import { Transactions, Transaction } from './transactions'

export interface MonthlyStats {
  date: string
  total: number
  debits: number
  credits: number
}

export class Stats {
  private readonly storage: Storage
  private readonly transactions: Transactions

  constructor(storage: Storage, transactions: Transactions) {
    this.storage = storage
    this.transactions = transactions
  }

  /**
   * Returns the monthly statistics for the given account, for the 12 months
   * prior to the given date
   * @param accountId
   * @param date
   */
  statsForPreviousYear(accountId: string, date: Date): MonthlyStats[] {
    const oneYearBefore = this.oneYearBeforeDate(date)
    return _.chain(this.transactions.listForAccount(accountId))
      .filter(t => t.date >= oneYearBefore && t.date < date.toISOString())
      .groupBy(t => t.date.substring(0, 7))
      .map(this.computeMonthlyStats)
      .sortBy(s => s.date)
      .value()
  }

  oneYearBeforeDate(date: Date): string {
    return `${date.getFullYear() - 1}-${date.getMonth() > 9 ? '' : '0'}${date.getMonth() + 1}-01`
  }

  computeMonthlyStats(transactions: Transaction[]): MonthlyStats {
    const stats = {
      date: transactions[0].date,
      total: 0,
      debits: 0,
      credits: 0
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

      stats.total += t.amount
      if (t.amount > 0) {
        stats.credits += t.amount
      } else {
        stats.debits += t.amount
      }
    })
    return stats
  }
}
