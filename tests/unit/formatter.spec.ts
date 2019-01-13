import Formatter from '@/utils/formatter'
import { expect } from 'chai'

const f = new Formatter()

describe('Formatter', () => {
  it('should return year', () => {
    let date = '2017-08-14'
    expect(f.year(date)).to.equal('2017')
  })

  it('should return date in year', () => {
    let date = '2017-08-14'
    expect(f.dateInYear(date)).to.equal('14 Août')
  })

  it('should format amount', () => {
    expect(f.amount(12345)).to.equal('123.45')
  })

  it('should provide color for amount', () => {
    let red = 'red--text'
    let green = 'green--text'
    expect(f.colorForAmount(1)).to.equal(green)
    expect(f.colorForAmount(-1)).to.equal(red)
  })

  it('should return path for institution icons', () => {
    expect(f.institutionIcon('foo')).to.equal('static/institutions/foo.png')
  })

  //   it('should correctly display transaction amount depending on which account it is displaye in', () => {
  //     let t = {
  //       amount: 1,
  //       fromId: 'from',
  //       toId: 'to'
  //     }
  //     expect(f.transactionAmount(t, 'from')).to.equal('-0.01')
  //     expect(f.transactionAmount(t, 'to')).to.equal('0.01')
  //   })

  //   it('should tell if transaction is a card payments', () => {
  //     let t = {
  //       stagedDesc: 'Depenses Carte du mois de Juillet'
  //     }
  //     expect(f.isCardPayments(t)).is.equal(true)
  //     t = {
  //       desc: 'Depenses Carte du mois de Juillet'
  //     }
  //     expect(f.isCardPayments(t)).is.equal(false)
  //     t = {
  //       stagedDesc: 'Depenses Noel'
  //     }
  //     expect(f.isCardPayments(t)).is.equal(false)
  //   })

  //   it('should display label for transfer transactions', () => {
  //     // no transfer
  //     let f = new Formatter({
  //       isTransfer(t) {
  //         return false
  //       }
  //     })
  //     expect(f.transferLabel({}, '')).is.equal('PROBLEM: this transaction is not a transfer.')

  //     // transferts
  //     f = new Formatter({
  //       isTransfer(t) {
  //         return true
  //       },
  //       category(id) {
  //         return {
  //           name: id
  //         }
  //       }
  //     })
  //     let t = {
  //       amount: 1,
  //       fromId: 'from',
  //       toId: 'to'
  //     }
  //     expect(f.transferLabel(t, 'to')).is.equal('Virement depuis from')
  //     expect(f.transferLabel(t, 'from')).is.equal('Virement vers to')
  //     t = {
  //       amount: -1,
  //       fromId: 'from',
  //       toId: 'to'
  //     }
  //     expect(f.transferLabel(t, 'to')).is.equal('Virement vers from')
  //     expect(f.transferLabel(t, 'from')).is.equal('Virement depuis to')
  //   })

  //   it('should return payee name', () => {
  //     let f = new Formatter({
  //       payee(id) {
  //         if (id === '1') {
  //           return {
  //             name: 'foo'
  //           }
  //         } else {
  //           return null
  //         }
  //       }
  //     })
  //     expect(f.payeeName('1')).is.equal('foo')
  //     expect(f.payeeName('2')).is.equal('-- payee? --')
  //   })

  //   it('should return category name', () => {
  //     let f = new Formatter({
  //       categories: {
  //         '1': {
  //           id: '1',
  //           name: 'cat'
  //         }
  //       },
  //       bankAccounts: {
  //         '2': {
  //           id: '2',
  //           name: 'bank'
  //         }
  //       },
  //       category(id) {
  //         return this.categories[id]
  //       },
  //       bankAccount(id) {
  //         return this.bankAccounts[id]
  //       }
  //     })
  //     expect(f.categoryName('1')).is.equal('cat')
  //     expect(f.categoryName('2')).is.equal('bank')
  //     expect(f.categoryName('3')).is.equal('-- category? --')
  //   })

  //   it('should return full category name', () => {
  //     let f = new Formatter({
  //       categories: {
  //         '1': {
  //           id: '1',
  //           name: 'cat',
  //           parentId: '2'
  //         },
  //         '2': {
  //           id: '2',
  //           name: 'parent'
  //         }
  //       },
  //       bankAccounts: {},
  //       category(id) {
  //         return this.categories[id]
  //       },
  //       bankAccount(id) {
  //         return this.bankAccounts[id]
  //       }
  //     })
  //     expect(f.categoryFullName('1')).is.equal('parent > cat')
  //     expect(f.categoryFullName('2')).is.equal('parent')
  //     expect(f.categoryFullName('3')).is.equal('-- category? --')
  //   })
})
