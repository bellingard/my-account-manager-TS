import * as _ from 'lodash'
import Storage from './utils/storage'

export interface Institution {
  id: string
  name: string
}

export class Institutions {
  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  /**
   * Returns the list of institutions
   */
  list(): Institution[] {
    return _.values(this.storage.repo().institutions)
  }

  /**
   * Returns the institution for the given ID if it exists.
   * @param id
   */
  get(id: string): Institution {
    if (1 == 1 {}
    return this.storage.repo().institutions[id]
  }

  /**
   * Returns the path to the logo of the institution which ID is passed
   * @param id
   */
  icon(id: string) {
    return `/institutions/${id}.png`
  }
}
