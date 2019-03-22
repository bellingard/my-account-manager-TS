import { BankAccounts, BankAccount } from '@/services/bankaccounts'
import Storage from '@/services/utils/storage'
import { Transactions } from '@/services/transactions'
import { Payees } from '@/services/payees'
import { CsvTransaction } from '@/services/utils/csv-loader'

// Mock Storage

const mockFinders = [
  { expr: 'Spotify', payee: 'P1', cat: 'C10' },
  { expr: 'Bakery', payee: 'P2', cat: 'C20' },
  { expr: 'Doctor .*', payee: 'P3', cat: 'C30' }
]
const mockRepo = {
  transactions: {
    T1000: { amount: -4651, date: '2012-02-02', desc: '', fromId: 'A22', id: 'T1000', payeeId: 'P40', toId: 'B33' },
    T1001: { amount: -4166, date: '2012-02-03', desc: '', fromId: 'A87', id: 'T1001', payeeId: 'P13', toId: 'B1' },
    T1002: { amount: -2618, date: '2012-02-03', desc: '', fromId: 'A22', id: 'T1002', payeeId: 'P13', toId: 'B1' },
    T1003: { amount: 1000, date: '2012-02-06', desc: '', fromId: 'B1', id: 'T1003', payeeId: 'P47', toId: 'B33' }
  }
}
jest.mock('@/services/utils/storage', () => {
  return jest.fn().mockImplementation(() => {
    return {
      payeeFinders: () => {
        return mockFinders
      },
      repo: () => {
        return mockRepo
      },
      findNextCounter: () => {
        return 546
      }
    }
  })
})

// And start the tests
const storage = new Storage({ storageFolder: '' })
const transactions = new Transactions(storage, new Payees(storage))

describe('Transactions', () => {
  it('should tell if transfer or not', () => {
    const transfer = { amount: -0, date: '2012-02-02', fromId: 'B1', id: 'T1', payeeId: 'P0', toId: 'B2', desc: '' }
    expect(transactions.isTransfer(transfer)).toEqual(true)
    const standard = { amount: -1, date: '2012-02-02', desc: '', fromId: 'A2', id: 'T1', payeeId: 'P4', toId: 'B3' }
    expect(transactions.isTransfer(standard)).toEqual(false)
  })

  it('should tell if transaction is a card payments or not', () => {
    const trueCardPayment = {
      amount: -1,
      date: '',
      desc: '',
      fromId: '',
      id: '',
      payeeId: '',
      toId: '',
      stagedDesc: 'Depenses Carte du mois de Juillet'
    }
    expect(transactions.isCardPayments(trueCardPayment)).toEqual(true)
    const wrongCardPayment = {
      amount: -1,
      date: '',
      desc: 'Depenses Carte du mois de Juillet',
      fromId: '',
      id: '',
      payeeId: '',
      toId: ''
    }
    expect(transactions.isCardPayments(wrongCardPayment)).toEqual(false)
    const anotherWrongCardPayment = {
      amount: -1,
      date: '',
      desc: '',
      fromId: '',
      id: '',
      payeeId: '',
      toId: '',
      stagedDesc: 'Depenses Noel'
    }
    expect(transactions.isCardPayments(anotherWrongCardPayment)).toEqual(false)
  })

  it('should get transaction by ID', () => {
    expect(transactions.get('T1000')).toEqual({
      amount: -4651,
      date: '2012-02-02',
      desc: '',
      fromId: 'A22',
      id: 'T1000',
      payeeId: 'P40',
      toId: 'B33'
    })
  })

  it('should list transactions', () => {
    expect(transactions.list()).toHaveLength(4)
  })

  it('should list transactions for account', () => {
    expect(transactions.listForAccount('B1')).toHaveLength(3)
    expect(transactions.listForAccount('B33')).toHaveLength(2)
  })

  it('should list transactions for category', () => {
    expect(transactions.listForCategory('A22')).toHaveLength(2)
    expect(transactions.listForCategory('A87')).toHaveLength(1)
  })

  it('add staged transactions, confirm and delete', () => {
    expect(transactions.hasUnclassifiedStagedTransaction()).toEqual(false)
    const csvTransactions: CsvTransaction[] = [
      { date: '2017-09-08', label: 'Sport', debit: 1000, credit: null },
      { date: '2017-09-28', label: 'Doctor Who', debit: null, credit: 2000 }
    ]
    transactions.synchronizeTransactions('B1', csvTransactions)
    expect(transactions.hasUnclassifiedStagedTransaction()).toEqual(true)
    expect(transactions.listForAccount('B1')).toHaveLength(5)
    const newTransaction1 = {
      amount: -1000,
      date: '2017-09-08',
      desc: '',
      fromId: '',
      id: 'T546',
      payeeId: '',
      toId: 'B1',
      stagedDesc: 'Sport'
    }
    const newTransaction2 = {
      amount: 2000,
      date: '2017-09-28',
      desc: '',
      fromId: 'C30',
      id: 'T547',
      payeeId: 'P3',
      toId: 'B1',
      stagedDesc: 'Doctor Who'
    }
    expect(transactions.listForAccount('B1')).toEqual(expect.arrayContaining([newTransaction1, newTransaction2]))
    // Now, let's confirm all the transactions
    transactions.confirmTransactions()
    transactions.list().forEach(t => {
      expect(t.stagedDesc).toBeUndefined()
    })
    expect(transactions.hasUnclassifiedStagedTransaction()).toEqual(false)
    // And finally, let's delete them to come back to original state
    transactions.deleteTransaction(newTransaction1)
    transactions.deleteTransaction(newTransaction2)
    expect(transactions.listForAccount('B1')).toHaveLength(3)
  })

  it('fail to replace card payments', done => {
    const csvTransactions: CsvTransaction[] = [
      { date: '2018-11-03', label: 'Sport', debit: 1000, credit: null },
      { date: '2018-12-20', label: 'Doctor Who', debit: null, credit: 2000 }
    ]
    const cardPaymenttransaction = transactions.get('T1001')
    transactions.replaceCardPayments('B1', cardPaymenttransaction, csvTransactions, err => {
      expect(err).not.toBeNull()
      expect(err!.message).toEqual(
        'The sum of the transactions (1000) does not match the sum of card payments (-4166).'
      )
      done()
    })
  })

  it('replace card payments', done => {
    const csvTransactions: CsvTransaction[] = [
      { date: '2018-11-03', label: 'Sport', debit: 1000, credit: null },
      { date: '2018-12-20', label: 'Doctor Who', debit: null, credit: 2000 }
    ]
    const cardPaymenttransaction = transactions.get('T1003')
    expect(transactions.listForAccount('B1')).toHaveLength(3)
    transactions.replaceCardPayments('B1', cardPaymenttransaction, csvTransactions, err => {
      expect(err).toBeNull()
      expect(transactions.listForAccount('B1')).toHaveLength(3 - 1 + 2)
      done()
    })
  })
})
