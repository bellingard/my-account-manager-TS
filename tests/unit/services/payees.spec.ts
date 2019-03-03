import { Payees, Finder } from '@/services/payees'
import Storage from '@/services/utils/storage'

// Mock Storage
const mockFinders = [
  {
    expr: 'Caf De La Haute Savoie',
    payee: 'P1',
    cat: 'C10'
  },
  {
    expr: 'CA',
    payee: 'P2',
    cat: 'C20'
  },
  {
    expr: 'Medecins .* Frontieres',
    payee: 'P3',
    cat: 'C30'
  }
]
jest.mock('@/services/utils/storage', () => {
  return jest.fn().mockImplementation(() => {
    return {
      payeeFinders: () => {
        return mockFinders
      }
    }
  })
})

// And start the tests
const payeeFinder = new Payees(new Storage({ storageFolder: '' }))

describe('PayeeFinder', () => {
  it('should return correct payee', () => {
    expect(payeeFinder.findBasedOnLabel('Versement Caf De La Haute Savoie 2107')!.payee).toEqual('P1')
    expect(payeeFinder.findBasedOnLabel('Virement CA')!.payee).toEqual('P2')
  })

  it('should return correct payee when using regexp', () => {
    expect(payeeFinder.findBasedOnLabel('Medecins Sans Frontieres Account 39480098')!.payee).toEqual('P3')
  })

  it('should return no payee', () => {
    expect(payeeFinder.findBasedOnLabel('Versement MSF')).toBeNull()
    expect(payeeFinder.findBasedOnLabel('Versement Médecins Sans Frontières')).toBeNull()
  })

  it('should return correct category', () => {
    expect(payeeFinder.findBasedOnLabel('Versement Caf De La Haute Savoie 2107')!.cat).toEqual('C10')
    expect(payeeFinder.findBasedOnLabel('Virement CA')!.cat).toEqual('C20')
  })

  it('should add payee finder', () => {
    payeeFinder.addFinder('P4', 'foo', 'C40')
    expect(payeeFinder.finders().length).toEqual(4)
    expect(payeeFinder.finders()[3]).toEqual({ expr: 'foo', payee: 'P4', cat: 'C40' })
  })
})
