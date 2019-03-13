import { Institution } from '../institutions'
import { Payee } from '../payees'
import { BankAccount } from '../bankaccount'
import { Category } from '../categories'
import { Transaction } from '../transactions'

export default interface Repository {
  institutions: { [key: string]: Institution }
  payees: { [key: string]: Payee }
  bankAccounts: { [key: string]: BankAccount }
  categories: { [key: string]: Category }
  transactions: { [key: string]: Transaction }
}

export type RepositoryTypes = Institution | Payee | BankAccount | Category | Transaction
