import { BankAccounts, BankAccount } from '@/services/bankaccounts'
import Storage from '@/services/utils/storage'
import { Transactions } from '@/services/transactions'
import { Payees } from '@/services/payees'

// Mock Storage
const mockRepo = {
  bankAccounts: {
    B1: {
      accountNumber: '12345',
      closed: true,
      favorite: false,
      id: 'B1',
      institutionId: 'I1',
      name: 'Account B1',
      parentId: 'A170'
    },
    B164: {
      accountNumber: '67890',
      closed: false,
      favorite: true,
      id: 'B164',
      institutionId: 'I2',
      name: 'Account B164',
      parentId: 'A170'
    }
  },
  transactions: {
    T1000: { amount: -4651, date: '2012-02-02', desc: '', fromId: 'A22', id: 'T1000', payeeId: 'P40', toId: 'B1' },
    T1001: { amount: 1166, date: '2012-02-03', desc: '', fromId: 'A87', id: 'T1001', payeeId: 'P13', toId: 'B164' },
    T1002: { amount: -2618, date: '2012-02-03', desc: '', fromId: 'A22', id: 'T1002', payeeId: 'P13', toId: 'B164' },
    T1003: { amount: 1000, date: '2012-02-06', desc: '', fromId: 'B164', id: 'T1003', payeeId: 'P47', toId: 'B1' }
  }
}
jest.mock('@/services/utils/storage', () => {
  return jest.fn().mockImplementation(() => {
    return {
      repo: () => {
        return mockRepo
      },
      findNextCounter: () => {
        return 1
      }
    }
  })
})

// And start the tests
const storage = new Storage({ storageFolder: '' })
const transactions = new Transactions(storage, new Payees(storage))
const bankAccounts = new BankAccounts(storage, transactions)

describe('BankAccounts', () => {
  it('should tell valid ID', () => {
    expect(BankAccounts.isValidID('B123')).toEqual(true)
    expect(BankAccounts.isValidID('A123')).toEqual(false)
  })

  it('should list non closed accounts by default', () => {
    expect(bankAccounts.list()).toHaveLength(1)
    expect(bankAccounts.list()[0].id).toEqual('B164')
  })

  it('should be able to list all accounts', () => {
    expect(bankAccounts.list(true)).toHaveLength(2)
  })

  it('should get account from ID', () => {
    expect(bankAccounts.get('B1')).toEqual({
      accountNumber: '12345',
      closed: true,
      favorite: false,
      id: 'B1',
      institutionId: 'I1',
      name: 'Account B1',
      parentId: 'A170'
    })
    expect(bankAccounts.get('unknown_ID')).toBeUndefined()
  })

  it('should give name from ID', () => {
    expect(bankAccounts.name('B1')).toEqual('Account B1')
    expect(bankAccounts.name('unknown')).toEqual('-- bank account? --')
  })

  it('should switch', () => {
    const account = bankAccounts.get('B1')
    expect(account.favorite).toEqual(false)
    bankAccounts.switchFavorite('B1')
    expect(account.favorite).toEqual(true)
  })

  it('should compute balance', () => {
    expect(bankAccounts.getBalance('B1')).toEqual(-3651)
    expect(bankAccounts.getBalance('B164')).toEqual(-2452)
  })

  it('should compute one year before date', () => {
    let date = new Date(2019, 3, 21)
    expect(bankAccounts.oneYearBeforeDate(date)).toEqual('2018-04-01')
    date = new Date(2019, 11, 1)
    expect(bankAccounts.oneYearBeforeDate(date)).toEqual('2018-12-01')
  })

  it('should compute monthly stats for the given transactions', () => {
    const transactions = [
      { amount: 1000, fromId: 'B1', toId: 'B2', date: '2019-02-01', desc: '', id: '', payeeId: '' },
      { amount: 1100, fromId: 'A1', toId: 'B1', date: '', desc: '', id: '', payeeId: '' },
      { amount: -2600, fromId: 'A2', toId: 'B1', date: '', desc: '', id: '', payeeId: '' },
      { amount: 1000, fromId: 'A120', toId: 'B1', date: '', desc: '', id: '', payeeId: '' },
      { amount: 1000, fromId: 'A159', toId: 'B1', date: '', desc: '', id: '', payeeId: '' }
    ]
    expect(bankAccounts.computeMonthlyStats(transactions)).toEqual({
      date: '2019-02-01',
      total: -1500,
      debits: -2600,
      credits: 1100
    })
  })

  it('should compute stats for previous year', () => {
    expect(bankAccounts.statsForPreviousYear('B164', new Date(2013, 1, 1))).toEqual([
      {
        credits: 1166,
        date: '2012-02-03',
        debits: -2618,
        total: -1452
      }
    ])
    expect(bankAccounts.statsForPreviousYear('B164', new Date(2013, 2, 1))).toEqual([])
  })
})
