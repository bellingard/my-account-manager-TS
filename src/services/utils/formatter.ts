import { Transaction } from '../transactions'

export default class Formatter {
  year(date: string) {
    return date.substring(0, 4)
  }

  dateInYear(date: string) {
    return `${date.substring(8, 10)} ${this.month(date)}`
  }

  // Displays amounts (that are stored multiplied by 100) with 2 decimals
  amount(value: number) {
    return (value / 100).toFixed(2)
  }

  // Gives the color for the amount (red for debit, green for credit)
  colorForAmount(amount: number) {
    return amount < 0 ? 'red--text' : 'green--text'
  }

  // Displays amount of the given transaction when displayed in the given account
  transactionAmount(transaction: Transaction, accountId: string) {
    return this.amount(accountId === transaction.toId ? transaction.amount : -transaction.amount)
  }

  month(date: string): string {
    const m = date.substring(5, 7)
    switch (m) {
      case '01':
        return 'Janvier'
      case '02':
        return 'Février'
      case '03':
        return 'Mars'
      case '04':
        return 'Avril'
      case '05':
        return 'Mai'
      case '06':
        return 'Juin'
      case '07':
        return 'Juillet'
      case '08':
        return 'Août'
      case '09':
        return 'Septembre'
      case '10':
        return 'Octobre'
      case '11':
        return 'Novembre'
      case '12':
        return 'Décembre'
      default:
        return 'Unknown Month...'
    }
  }
}
