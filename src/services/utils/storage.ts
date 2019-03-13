import path from 'path'
import * as _ from 'lodash'
import { ConfigProps } from './config'
import { Finder, Payee } from '../payees'
import { Category } from '../categories';
import { Transaction } from '../transactions';
import { Institution } from '../institutions';
import { BankAccount } from '../bankaccount';
import Repository from './repository';
const jsonfile = require('jsonfile')

export default class Storage {
  private readonly config: ConfigProps
  private repoFile!: string
  private payeeFinderConfFile!: string
  private repository!: Repository
  private payeeFinderConf: any

  constructor(config: ConfigProps) {
    this.config = config
    try {
      this.init()
    } catch (e) {
      // could not open one of the storage files: will need to open from the UI
    }
  }

  /**
   * Read all the storage files to load data
   */
  private init() {
    // Base storage folder
    const storageFolder = this.config.storageFolder
    this.repoFile = path.join(storageFolder, 'Comptes.json')
    this.payeeFinderConfFile = path.join(storageFolder, 'PayeeFinder.json')
    // Let's read the storage files
    this.repository = jsonfile.readFileSync(this.repoFile, 'UTF-8')
    this.payeeFinderConf = jsonfile.readFileSync(this.payeeFinderConfFile, 'UTF-8')
  }

  /**
   * Returns the repository of entities
   */
  repo(): Repository {
    return this.repository
  }

  payeeFinders(): Finder[] {
    return this.payeeFinderConf
  }

  /**
   * Saves everything:
   *   - repo
   *   - payee finders
   * If there's an error, it is passed in an 'err' parameter of the callback
   * @param {*} cb the callback
   */
  save(cb: (err: Error) => void) {
    this.saveRepo(err => {
      if (err) {
        cb(err)
      } else {
        this.savePayeeFinders(cb)
      }
    })
  }

  private saveRepo(cb: (err: Error) => void) {
    jsonfile.writeFile(this.repoFile, this.repository, 'UTF-8', cb)
  }

  private savePayeeFinders(cb: (err: Error) => void) {
    jsonfile.writeFile(this.payeeFinderConfFile, this.payeeFinders(), 'UTF-8', cb)
  }

  /**
   * Loads everything:
   *   - repo
   *   - payee finders
   * If there's an error, it is passed in an 'err' parameter of the callback
   * @param {*} cb the callback
   */
  reload(cb: (err: Error | null) => void) {
    this.loadRepo(err => {
      if (err) {
        cb(err)
      } else {
        this.loadPayeeConf(cb)
      }
    })
  }

  private loadRepo(cb: (err: Error | null) => void) {
    jsonfile.readFile(this.repoFile, 'UTF-8', (err: Error, obj: any) => {
      if (err) {
        cb(err)
      } else {
        this.repository = obj
        cb(null)
      }
    })
  }

  private loadPayeeConf(cb: (err: Error | null) => void) {
    jsonfile.readFile(this.payeeFinderConfFile, 'UTF-8', (err: Error, obj: any) => {
      if (err) {
        cb(err)
      } else {
        this.payeeFinderConf = obj
        cb(null)
      }
    })
  }

  /**
   * Finds what is the next counter/index ID for the given list
   * @param list 
   */
  findNextCounter(list: (Payee | Category | BankAccount | Transaction)[]): number {
    const maxId: any = _.chain(list)
      // we map the ID - which is like "T5922" - to an integer
      .map((t: (Payee | Category | BankAccount |Transaction)) => parseInt(t.id.substring(1)) * 1)
      .max()
      .value()
    return maxId + 1
  }

}
