import Formatter from '@/services/utils/formatter'

const f = new Formatter()

describe('Formatter', () => {
  it('should return year', () => {
    const date = '2017-08-14'
    expect(f.year(date)).toEqual('2017')
  })

  it('should return date in year', () => {
    const date = '2017-08-14'
    expect(f.dateInYear(date)).toEqual('14 Août')
  })

  it('should format amount', () => {
    expect(f.amount(12345)).toEqual('123.45')
  })

  it('should provide color for amount', () => {
    const red = 'red--text'
    const green = 'green--text'
    expect(f.colorForAmount(1)).toEqual(green)
    expect(f.colorForAmount(-1)).toEqual(red)
  })

  it('should correctly display transaction amount depending on which account it is displaye in', () => {
    const t = {
      amount: 1,
      fromId: 'from',
      toId: 'to',
      date: '',
      desc: '',
      id: '',
      payeeId: ''
    }
    expect(f.transactionAmount(t, 'from')).toEqual('-0.01')
    expect(f.transactionAmount(t, 'to')).toEqual('0.01')
  })

  it('should return month', () => {
    expect(f.month('2017-01-01')).toEqual('Janvier')
    expect(f.month('2017-02-01')).toEqual('Février')
    expect(f.month('2017-03-01')).toEqual('Mars')
    expect(f.month('2017-04-01')).toEqual('Avril')
    expect(f.month('2017-05-01')).toEqual('Mai')
    expect(f.month('2017-06-01')).toEqual('Juin')
    expect(f.month('2017-07-01')).toEqual('Juillet')
    expect(f.month('2017-08-01')).toEqual('Août')
    expect(f.month('2017-09-01')).toEqual('Septembre')
    expect(f.month('2017-10-01')).toEqual('Octobre')
    expect(f.month('2017-11-01')).toEqual('Novembre')
    expect(f.month('2017-12-01')).toEqual('Décembre')
    expect(f.month('')).toEqual('Unknown Month...')
  })
})
