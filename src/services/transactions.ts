export interface Transaction {
  id: string
  date: string
  amount: number
  desc: string
  toId: string
  fromId: string
  payeeId?: string
}
