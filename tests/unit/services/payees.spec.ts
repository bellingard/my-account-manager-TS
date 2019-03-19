import { Payees } from '@/services/payees'
import Storage from '@/services/utils/storage'

// Mock Storage
const mockFinders = [
  { expr: 'Caf De La Haute Savoie', payee: 'P1', cat: 'C10' },
  { expr: 'CA', payee: 'P2', cat: 'C20' },
  { expr: 'Medecins .* Frontieres', payee: 'P3', cat: 'C30' }
]
const mockRepo = {
  payees: {
    P303: { id: 'P303', name: 'Payee 303' },
    P424: { id: 'P424', name: 'Payee 424' },
    P545: { id: 'P545', name: 'Payee 545' }
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
const payees = new Payees(new Storage({ storageFolder: '' }))

describe('Payees', () => {
  it('should list payees', () => {
    expect(payees.list()).toHaveLength(3)
  })

  it('should get payee from ID', () => {
    expect(payees.get('P303')).toEqual({ id: 'P303', name: 'Payee 303' })
    expect(payees.get('unknown_ID')).toBeUndefined()
  })

  it('should add new payee', () => {
    const newPayee = payees.addPayee('New Payee')
    expect(newPayee).toEqual({ id: 'P546', name: 'New Payee' })
    expect(payees.list()).toHaveLength(4)
    expect(payees.list()).toEqual(expect.arrayContaining([newPayee]))
  })

  it('should find correct payee', () => {
    expect(payees.findBasedOnLabel('Versement Caf De La Haute Savoie 2107')!.payee).toEqual('P1')
    expect(payees.findBasedOnLabel('Virement CA')!.payee).toEqual('P2')
  })

  it('should find correct payee when using regexp', () => {
    expect(payees.findBasedOnLabel('Medecins Sans Frontieres Account 39480098')!.payee).toEqual('P3')
  })

  it('should find no payee', () => {
    expect(payees.findBasedOnLabel('Versement MSF')).toBeNull()
    expect(payees.findBasedOnLabel('Versement Médecins Sans Frontières')).toBeNull()
  })

  it('should find correct payee category', () => {
    expect(payees.findBasedOnLabel('Versement Caf De La Haute Savoie 2107')!.cat).toEqual('C10')
    expect(payees.findBasedOnLabel('Virement CA')!.cat).toEqual('C20')
  })

  it('should add payee finder', () => {
    payees.addFinder('P4', 'foo', 'C40')
    expect(payees.finders()).toHaveLength(4)
    expect(payees.finders()[3]).toEqual({ expr: 'foo', payee: 'P4', cat: 'C40' })
  })
})
