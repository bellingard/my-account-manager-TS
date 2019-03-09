import * as _ from 'lodash'
import Storage from './utils/storage';

export interface Institution {
  id: string
  name: string
}

export class Institutions {
  private storage: Storage

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
  get(id: string): Institution | undefined {
    return this.storage.repo().institutions[id]
  }

}