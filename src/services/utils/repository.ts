import { Institution } from '../institutions';
import { Payee } from '../payees';
import { BankAccount } from '../bankaccount';
import { Category } from '../category';
import { Transaction } from 'electron';

export default interface Repository {
  institutions: {[key: string]: Institution}
  payees: {[key: string]: Payee}
  bankAccounts: {[key: string]: BankAccount}
  categories: {[key: string]: Category}
  transactions: {[key: string]: Transaction}
}
