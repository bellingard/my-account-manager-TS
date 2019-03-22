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
    expect(bankAccounts.getAccountBalance('B1')).toEqual(-3651)
    expect(bankAccounts.getAccountBalance('B164')).toEqual(-2452)
  })
})
