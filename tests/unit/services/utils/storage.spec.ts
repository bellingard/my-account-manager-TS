import path from 'path'
import Storage from '@/services/utils/storage'
import { ConfigProps } from '@/services/utils/config'
import { Payee } from '@/services/payees'

describe('Storage Service', () => {
  it('should load and reload info from files', () => {
    let config: ConfigProps = { storageFolder: pathForFile('can_load') }
    let storage: Storage = new Storage(config)
    expect(storage.repo()).toEqual({ account: 'foo' })
    expect(storage.payeeFinders()).toEqual({ finder: 'bar' })
    // reload
    storage.reload((err: Error | null) => {
      expect(storage.repo()).toEqual({ account: 'foo' })
      expect(storage.payeeFinders()).toEqual({ finder: 'bar' })
    })
  })

  it('should raise error when cannot load', () => {
    let config: ConfigProps = { storageFolder: pathForFile('cannot_load') }
    let storage: Storage = new Storage(config)
    expect(storage.repo()).toBeUndefined()
    expect(storage.payeeFinders()).toBeUndefined()
  })

  it('should find the next counter', () => {
    let config: ConfigProps = { storageFolder: pathForFile('can_load') }
    let storage: Storage = new Storage(config)
    let payees: Payee[] = [{ id: 'P987', name: '' }, { id: 'P38', name: '' }, { id: 'P1983', name: '' }]
    expect(storage.findNextCounter(payees)).toEqual(1983 + 1)
  })
})

function pathForFile(file: string): string {
  return path.join(process.cwd(), 'tests', 'unit', 'services', 'utils', '_storage.spec', file)
}
