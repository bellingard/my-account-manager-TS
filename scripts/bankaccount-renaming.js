const _ = require('lodash')
const jsonfile = require('jsonfile')
const fs = require('fs')

const repoFilePath = '<path>/Comptes.json'
const repo = jsonfile.readFileSync(repoFilePath, 'UTF-8')

// Converts all BankAccount IDs from 'Axx' to 'Bxx' pattern
// TODO => would be great to do this for categories too ('Axx' -> 'Cxx')
const accounts = _.values(repo.bankAccounts)
const accountIds = _.chain(accounts).map(a => a.id).value()
let repoAsString = fs.readFileSync(repoFilePath, 'UTF-8')
accountIds.forEach(id => {
  const newId = 'B' + id.substring(1)
  repoAsString = repoAsString.replace(new RegExp(`"${id}"`, 'g'), `"${newId}"`)
})

const outputFilePath = '<path>/Comptes-OUT.json'
fs.writeFileSync(outputFilePath, repoAsString, 'UTF-8')
