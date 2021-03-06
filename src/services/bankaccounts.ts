import * as _ from 'lodash'
import Storage from './utils/storage'
import { Transactions } from './transactions'

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
  list(listClosed = false): BankAccount[] {
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
   * Returns the overall balance, all accounts included
   * @param accountId
   */
  getOverallBalance(): number {
    return _.chain(this.list(true))
      .map(a => this.getBalance(a.id))
      .sum()
      .value()
  }
}
