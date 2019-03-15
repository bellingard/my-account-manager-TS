import { BankAccounts, BankAccount } from '@/services/bankaccounts'
import Storage from '@/services/utils/storage'

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
  }
}
jest.mock('@/services/utils/storage', () => {
  return jest.fn().mockImplementation(() => {
    return {
      repo: () => {
        return mockRepo
      }
    }
  })
})

// And start the tests
const bankAccounts = new BankAccounts(new Storage({ storageFolder: '' }))

describe('BankAccounts', () => {
  it('should list non closed accounts by default', () => {
    expect(bankAccounts.list().length).toEqual(1)
    expect(bankAccounts.list()[0].id).toEqual('B164')
  })

  it('should be able to list all accounts', () => {
    expect(bankAccounts.list(true).length).toEqual(2)
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

  it('should switch', () => {
    const account = bankAccounts.get('B1')
    expect(account!.favorite).toEqual(false)
    bankAccounts.switchFavorite('B1')
    expect(account!.favorite).toEqual(true)
  })
})
