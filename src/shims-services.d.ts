import Vue from 'vue'
import Formatter from './services/utils/formatter'
import { CsvLoader } from './services/utils/csv-loader'
import { Config } from './services/utils/config'
import Storage from './services/utils/storage'
import { Payees } from './services/payees'
import { Transactions } from './services/transactions'
import { BankAccounts } from './services/bankaccounts'
import { Institutions } from './services/institutions'
import { Categories } from './services/categories'
import { Stats } from './services/stats'

declare module 'vue/types/vue' {
  interface Vue {
    $format: Formatter
    $cvsLoader: CsvLoader
    $appConfig: Config
    $storage: Storage
    $payees: Payees
    $transactions: Transactions
    $accounts: BankAccounts
    $institutions: Institutions
    $categories: Categories
    $stats: Stats
  }
}
