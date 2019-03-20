import path from 'path'
import Storage from '@/services/utils/storage'
import { ConfigProps } from '@/services/utils/config'
import { Payee } from '@/services/payees'

describe('Storage Service', () => {
  it('should load and reload info from files', done => {
    const config: ConfigProps = { storageFolder: pathForFile('can_load') }
    const storage: Storage = new Storage(config)
    expect(storage.repo()!.bankAccounts).toEqual({
      B1: {
        accountNumber: '123456',
        closed: false,
        favorite: true,
        id: 'B1',
        institutionId: 'I1',
        name: 'A1 account',
        parentId: 'C170'
      }
    })
    expect(storage.payeeFinders()).toEqual({ finder: 'bar' })
    // reload
    storage.reload((err: Error | null) => {
      expect(storage.repo()!.bankAccounts).toEqual({
        B1: {
          accountNumber: '123456',
          closed: false,
          favorite: true,
          id: 'B1',
          institutionId: 'I1',
          name: 'A1 account',
          parentId: 'C170'
        }
      })
      expect(storage.payeeFinders()).toEqual({ finder: 'bar' })
      done()
    })
  })

  it('should raise error when cannot load', () => {
    const config: ConfigProps = { storageFolder: pathForFile('cannot_load') }
    const storage: Storage = new Storage(config)
    expect(storage.repo()).toBeUndefined()
    expect(storage.payeeFinders()).toBeUndefined()
  })

  it('should raise error when old bank account or category format', () => {
    const config: ConfigProps = { storageFolder: pathForFile('old_format') }
    const storage: Storage = new Storage(config)
    expect(storage.repo()).toBeUndefined()
    expect(storage.payeeFinders()).toBeUndefined()
  })

  it('should find the next counter', () => {
    const config: ConfigProps = { storageFolder: pathForFile('can_load') }
    const storage: Storage = new Storage(config)
    const payees: Payee[] = [{ id: 'P987', name: '' }, { id: 'P38', name: '' }, { id: 'P1983', name: '' }]
    expect(storage.findNextCounter(payees)).toEqual(1983 + 1)
  })
})

function pathForFile(file: string): string {
  return path.join(process.cwd(), 'tests', 'unit', 'services', 'utils', '_storage.spec', file)
}
