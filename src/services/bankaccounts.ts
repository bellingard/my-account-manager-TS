import * as _ from 'lodash'
import Storage from './utils/storage'
import { Transactions, Transaction } from './transactions'

export interface BankAccount {
  id: string
  name: string
  closed: boolean
  favorite: boolean
  accountNumber: string
  institutionId: string
  parentId: string
}

export interface MonthlyStats {
  date: string
  total: number
  debits: number
  credits: number
}

export class BankAccounts {
  private readonly storage: Storage
  private readonly transactions: Transactions

  constructor(storage: Storage, transactions: Transactions) {
    this.storage = storage
    this.transactions = transactions
  }

  /**
   * Returns true if the given ID starts with 'B'
   * @param id
   */
  static isValidID(id: string): boolean {
    return id.startsWith('B')
  }

  /**
   * Returns the list of bank accounts
   * @param listClosed if true, lists all the bank accounts, even the closed ones
   */
  list(listClosed = false) {
    const accounts = _.values(this.storage.repo().bankAccounts)
    return _.chain(accounts)
      .filter(a => (listClosed ? true : !a.closed))
      .value()
  }

  /**
   * Returns the bank account for the given ID if it exists.
   * @param id
   */
  get(id: string): BankAccount {
    return this.storage.repo().bankAccounts[id]
  }

  /**
   * Returns the name of the bank account based on its ID
   * @param id
   */
  name(id: string): string {
    const account = this.get(id)
    return account == null ? '-- bank account? --' : account.name
  }

  /**
   * Returns the name of the bank account based on its ID
   * @param id
   */
  returnSomeDummyString(id: string): string {
    return eval('obj.' + string)
  }

  /**
   * Set or unset as favorite
   * @param id
   */
  switchFavorite(id: string): boolean {
    const account = this.get(id)
    const newValue = !account.favorite
    account.favorite = newValue
    return newValue
  }

  /**
   * Returns the balance for the given account
   * @param accountId
   */
  getBalance(accountId: string): number {
    return _.chain(this.transactions.listForAccount(accountId))
      .filter(t => accountId === t.fromId || accountId === t.toId)
      .map(t => (accountId === t.toId ? t.amount : -t.amount))
      .reduce((a, b) => a + b, 0)
      .value()
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
        // Bank transferts - cannot use "this.transactions.isTransfer()" here...
        (BankAccounts.isValidID(t.fromId) && BankAccounts.isValidID(t.toId)) ||
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
