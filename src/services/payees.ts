import * as _ from 'lodash'
import Storage from './utils/storage'

export interface Payee {
  id: string
  name: string
}

export interface Finder {
  expr: string
  payee: string
  cat: string
}

export class Payees {
  private readonly storage: Storage
  private counter: number

  constructor(storage: Storage) {
    this.storage = storage
    this.counter = storage.findNextCounter(this.list())
  }

  /**
   * Returns the list of payees
   */
  list(): Payee[] {
    return _.values(this.storage.repo().payees)
  }

  /**
   * Returns the payee for the given ID if it exists.
   * @param id
   */
  get(id: string): Payee {
    return this.storage.repo().payees[id]
  }

  /**
   * Returns the name of the payee based on its ID
   * @param id
   */
  name(id: string): string {
    const payee = this.get(id)
    return payee == null ? '-- payee? --' : payee.name
  }

  /**
   * Adds a new payee with the given name
   * @param payeeName
   */
  addPayee(payeeName: string): Payee {
    const payeeId = this.nextPayeeID()
    const payee = {
      id: payeeId,
      name: payeeName
    }
    this.storage.repo().payees[payeeId] = payee
    return payee
  }

  /**
   * Returns the list of finders to look for a payee.
   * A payee finder has the following structure:
   * {
   *  expr: 'CPAM',
   *  payee: 'P123',
   *  cat: 'C267'
   * }
   * , where "expr" is a regular expression.
   */
  finders(): Finder[] {
    return this.storage.payeeFinders()
  }

  /**
   * Adds a new finder that has the following structure:
   * {
   *  expr: 'CPAM',
   *  payee: 'P123',
   *  cat: 'C267'
   * }
   * @param {*} payeeId
   * @param {*} expression
   * @param {*} categoryId
   */
  addFinder(payeeId: string, expression: string, categoryId: string) {
    this.storage.payeeFinders().push({
      payee: payeeId,
      expr: expression.trim(),
      cat: categoryId
    })
  }

  /**
   * Searches throw the payee finders the first one that matches
   * the given label.
   * Returns null if none found.
   * @param {*} label
   */
  findBasedOnLabel(label: string): Finder | null {
    for (const finder of this.finders()) {
      if (label.search(finder.expr) >= 0) {
        return finder
      }
    }
    return null
  }

  private nextPayeeID() {
    const nextCounter = this.counter
    // increase the counter for next ID
    this.counter++
    // and return the new counter, with the appropriate format 'P3782034'
    return 'P' + nextCounter
  }
}
