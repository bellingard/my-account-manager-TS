export interface BankAccount {
  id: string
  name: string
  closed: boolean
  favorite: boolean
  accountNumber: string
  institutionId: string
  parentId: string
}

// TODO => Move bank account ID on the format Bxxxx to make our life easier
//      => And therefore make some sanity check to be sure that the data has been migrated

