import path from 'path'
import { CsvLoader, CsvTransaction } from '@/services/utils/csv-loader'

describe('CsvLoader Service', () => {
  const csvLoader = new CsvLoader()

  it('should parse correct CSV string - DEBIT', done => {
    const csvString = `
  Foo Bar Thing
  
  Date;Libellé;Débit Euros;Crédit Euros;
  14/09/2017;"My City -    07/09 10h41 
  Retrait Au Distributeur 
  ";10,00;
  
  `
    csvLoader.extractTransactions(csvString, (transactions, err) => {
      expect(transactions).not.toBeNull()
      expect(transactions!).toHaveLength(1)
      expect(transactions![0]).toEqual({
        date: '2017-09-14',
        label: 'My City - 07/09 10h41 Retrait Au Distributeur ',
        debit: 1000,
        credit: null
      })
      expect(transactions![0]).not.toEqual({
        date: '2017-09-14',
        label: 'My City - 07/09 10h41 Retrait Au Distributeur ZZZZZZZZ',
        debit: 1000,
        credit: null
      })
      done()
    })
  })

  it('should parse correct CSV string - CREDIT', done => {
    const csvString = `
Foo Bar Thing

Date;Libellé;Débit Euros;Crédit Euros;
14/09/2017;"My City -    07/09 10h41 
Retrait Au Distributeur 
";;12,10;

`
    csvLoader.extractTransactions(csvString, (transactions, err) => {
      expect(transactions).not.toBeNull()
      expect(transactions!).toHaveLength(1)
      expect(transactions![0]).toEqual({
        date: '2017-09-14',
        label: 'My City - 07/09 10h41 Retrait Au Distributeur ',
        debit: null,
        credit: 1210
      })
      expect(transactions![0]).not.toEqual({
        date: '2017-09-14',
        label: 'My City - 07/09 10h41 Retrait Au Distributeur ZZZZZZZZZ',
        debit: null,
        credit: 1210
      })
      done()
    })
  })

  it('should handle error when parsing wrong CSV string', done => {
    const csvString = `
Date;Libellé;Débit Euros;Crédit Euros;
14/09/2017;"My City -    07/09 10h41 
Retrait 
`
    csvLoader.extractTransactions(csvString, (transactions, err) => {
      expect(err).not.toBeNull()
      expect(transactions).toBeNull()
      done()
    })
  })

  it('should parse bad CSV from card payments', done => {
    // CSV content for card payments misses the semi-colon at the end of each line
    let csvString = `

22/09/2017;"La Bolee                           
.                                  ";44,80 
22/09/2017;"Leroy Merlin                            
.                                  ";;4,60 

`
    // let's sanitize the CSV
    csvString = csvLoader.addMissingSemiColon(csvString)
    // and now check that the result can be parsed
    csvLoader.extractTransactions(csvString, (transactions, err) => {
      expect(transactions).not.toBeNull()
      expect(transactions!).toHaveLength(2)
      expect(transactions![0]).toEqual({
        date: '2017-09-22',
        label: 'La Bolee ',
        debit: 4480,
        credit: null
      })
      expect(transactions![1]).toEqual({
        date: '2017-09-22',
        label: 'Leroy Merlin ',
        debit: null,
        credit: 460
      })
      done()
    })
  })

  it('should parse file', done => {
    csvLoader.getTransactionsFromFile(pathForFile('sample.csv'), (transactions, err) => {
      expect(transactions).not.toBeNull()
      expect(transactions!).toHaveLength(5)
      expect(transactions![0]).toEqual({
        date: '2017-09-08',
        label: 'My City - 07/09 10h41 Retrait Au Distributeur ',
        debit: 1000,
        credit: null
      })
      expect(transactions![1]).toEqual({
        date: '2017-09-07',
        label: 'CPAM Virement En Votre Faveur Xpxreference 092849349389 006379389v16 ',
        debit: null,
        credit: 1734
      })
      done()
    })
  })
})

function pathForFile(file: string): string {
  return path.join(process.cwd(), 'tests', 'unit', 'services', 'utils', '_csv-loader.spec', file)
}
