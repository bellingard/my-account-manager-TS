import * as _ from 'lodash'
import Storage from './utils/storage'
import { BankAccounts } from './bankaccounts'
import { CsvTransaction } from './utils/csv-loader'
import { Payees } from './payees'

export interface Transaction {
  id: string
  date: string
  amount: number
  desc: string
  toId: string
  fromId: string
  payeeId?: string
  stagedDesc?: string
  unusual?: boolean
}

export class Transactions {
  private readonly storage: Storage
  private readonly payees: Payees
  private counter: number

  constructor(storage: Storage, payees: Payees) {
    this.storage = storage
    this.payees = payees
    this.counter = storage.findNextCounter(this.list())
  }

  /**
   * Tells whether the transaction is a transfer or not
   * @param transaction
   */
  static isTransfer(transaction: Transaction): boolean {
    return BankAccounts.isValidID(transaction.toId) && BankAccounts.isValidID(transaction.fromId)
  }

  /**
   * Tells whether the transaction is a list of monthly card payments
   * @param transaction
   */
  isCardPayments(transaction: Transaction): boolean {
    return transaction.stagedDesc != null && transaction.stagedDesc.indexOf('DEPENSES CARTE') >= 0
  }

  /**
   * Returns the transaction for the given ID if it exists.
   * @param id
   */
  get(id: string): Transaction {
    return this.storage.repo().transactions[id]
  }

  /**
   * Returns the list of transactions
   */
  list(): Transaction[] {
    return _.values(this.storage.repo().transactions)
  }

  /**
   * Returns all transactions for the given account
   * @param accountId
   */
  listForAccount(accountId: string): Transaction[] {
    return _.chain(this.list())
      .filter(t => accountId === t.fromId || accountId === t.toId)
      .value()
  }

  /**
   * Returns all transactions for the given accounts
   * @param accountIds
   */
  listForAccounts(accountIds: string[]): Transaction[] {
    return _.chain(this.list())
      .filter(t => accountIds.includes(t.fromId) || accountIds.includes(t.toId))
      .value()
  }

  /**
   * Returns all transactions for the given category
   * @param categoryId
   */
  listForCategory(categoryId: string): Transaction[] {
    return _.chain(this.list())
      .filter(t => categoryId === t.fromId)
      .value()
  }

  /**
   * Deletes a transaction
   * @param transaction
   */
  deleteTransaction(transaction: Transaction) {
    delete this.storage.repo().transactions[transaction.id]
  }

  /**
   * Confirms that all transactions can be saved
   */
  confirmTransactions() {
    this.list().forEach(t => {
      if (t.stagedDesc) {
        delete t.stagedDesc
      }
    })
  }

  /**
   * Synchronises transactions retrieved from a CSV file. (see CsvLoader)
   * @param {*} accountId the account to add transactions to
   * @param {*} basicTransactions the CSV-format transactions
   */
  synchronizeTransactions(accountId: string, basicTransactions: CsvTransaction[]) {
    basicTransactions.forEach(t => {
      const amount = t.credit == null ? -t.debit! : t.credit
      if (!this.alreadyContainsTransaction(t.date, amount)) {
        // this transaction is not already known, let's add it
        const finder = this.payees.findBasedOnLabel(t.label)
        let payee = ''
        let category = ''
        if (finder != null) {
          payee = finder.payee
          category = finder.cat
        }
        this.addStaged(t.date, amount, accountId, category, payee, t.label)
      }
    })
  }

  /**
   * Tells whether a transaction with the same date and amount is found
   */
  private alreadyContainsTransaction(date: string, amount: number): boolean {
    const list: Transaction[] = this.list()
    for (let index = 0; index < list.length; index++) {
      const t = list[index]
      if (t.stagedDesc === undefined && t.date === date && t.amount === amount) {
        return true
      }
    }
    return false
  }

  /**
   * Add a staged transaction, i.e. a transaction that needs to be confirmed (= saved).
   */
  private addStaged(date: string, amount: number, toId: string, fromId: string, payeeId: string, label: string) {
    const transactionId = this.nextTransactionID()
    this.storage.repo().transactions[transactionId] = {
      id: transactionId,
      date: date,
      amount: amount,
      toId: toId,
      fromId: fromId,
      payeeId: payeeId,
      desc: '',
      stagedDesc: label
    }
  }

  /**
   * Returns true if some staged transactions have not been categorized yet.
   */
  hasUnclassifiedStagedTransaction() {
    for (const t of this.list()) {
      if (this.isUnclassifiedStaged(t)) {
        return true
      }
    }
    return false
  }

  /**
   * Returns true if the transaction is staged and not classified
   * @param transaction
   */
  isUnclassifiedStaged(transaction: Transaction): boolean {
    return transaction.stagedDesc !== undefined && transaction.fromId === ''
  }

  /**
   * Replaces a card payment entry by transactions retrieved from a CSV file
   * @param {*} accountId the account on which the transaction applies
   * @param {*} transactionToReplace the card payment transaction to replace
   * @param {*} basicTransactions Transactions that will replace the card payment transaction
   * @param {*} cb the callback if there's an error
   */
  replaceCardPayments(
    accountId: string,
    transactionToReplace: Transaction,
    basicTransactions: CsvTransaction[],
    cb: (err: Error | null) => void
  ) {
    const transactionsAmount = _.chain(basicTransactions)
      .map(t => (t.credit == null ? -t.debit! : t.credit))
      .reduce((a, b) => a + b, 0)
      .value()
    if (transactionsAmount === transactionToReplace.amount) {
      // Perfect, the amounts match: we can replace the given transaction to replace by all the given transactions
      this.synchronizeTransactions(accountId, basicTransactions)
      this.deleteTransaction(transactionToReplace)
      cb(null)
    } else {
      // we can't replace, let's return an error
      cb(
        new Error(
          `The sum of the transactions (${transactionsAmount}) does not match the sum of card payments (${
            transactionToReplace.amount
          }).`
        )
      )
    }
  }

  private nextTransactionID() {
    const nextCounter = this.counter
    // increase the counter for next ID
    this.counter++
    // and return the new counter, with the appropriate format 'T3782034'
    return 'T' + nextCounter
  }
}
