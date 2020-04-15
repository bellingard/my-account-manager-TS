import path from 'path'
import { CsvLoader } from '@/services/utils/csv-loader'
import { BankReportReader, BankReport } from '@/services/utils/bank-report-reader'

describe('BankReportReader Service', () => {
  const reportReader = new BankReportReader(new CsvLoader())

  it('should parse file', async () => {
    const bankReport: BankReport = await reportReader.getBankReportFromFile(pathForFile('account-report.csv'))
    expect(bankReport.balance).toEqual(174578)
    expect(bankReport.cardTransactionsToReplace).toHaveLength(4)
    expect(bankReport.transactions).toHaveLength(36 + 11 + 14 + 35 + 31)
  })

  it('should get Fab CC content', () => {
    const content =
      ' bar\n  MR FABRICE BELLINGARD - Titulaire;\n   some content here\n     \nMLLE CELINE SAPUTO - Titulaire;\n foo  '
    expect(reportReader.extractFabCc(content)).toEqual('MR FABRICE BELLINGARD - Titulaire;\n   some content here')
  })

  it('should get Celine CC content', () => {
    const content =
      ' bar\n  MR FABRICE BELLINGARD - Titulaire;\n   some content here\n     \nMLLE CELINE SAPUTO - Titulaire;\n foo  '
    expect(reportReader.extractCelineCc(content)).toEqual('MLLE CELINE SAPUTO - Titulaire;\n foo')
  })

  it('should extract LAST month content', () => {
    const content =
      'Encours débité le 31 mars 2020;-5.91 €\n    some content\n    \nEncours débité le 28 février 2020;-983.41 €\n bar\n foo   '
    expect(reportReader.extractLastMonthContent(content)).toEqual(
      'Encours débité le 31 mars 2020;-5.91 €\n    some content'
    )
  })

  it('should extract PREVIOUS month content', () => {
    const content =
      'Encours débité le 31 mars 2020;-5.91 €\n    some content\n    \nEncours débité le 28 février 2020;-983.41 €\n bar\n foo   '
    expect(reportReader.extractPreviousMonthContent(content)).toEqual(
      'Encours débité le 28 février 2020;-983.41 €\n bar\n foo'
    )
  })

  it('should parse balance', () => {
    expect(reportReader.extractBalance(';\n   \nSolde au 05/04/2020 1 745,78 €\n   \n;Encours')).toEqual(174578)
  })

  it('should parse outstanding', () => {
    expect(
      reportReader.extractOutstanding('MR FAB\n\nEncours débité le 31 mars 2020;-267.32 €\n\nDate;Libellé')
    ).toEqual(26732)
  })
})

function pathForFile(file: string): string {
  return path.join(process.cwd(), 'tests', 'unit', 'services', 'utils', '_bank-report-reader.spec', file)
}
