const _ = require('lodash')
const jsonfile = require('jsonfile')
const fs = require('fs')

const mainPath = '/Users/bellingard/Repos/_PERSO_/my-accounts'
const repo = jsonfile.readFileSync(mainPath + '/Comptes.json', 'UTF-8')
let repoAsString = fs.readFileSync(mainPath + '/Comptes.json', 'UTF-8', 'UTF-8')
const payeeFinders = jsonfile.readFileSync(mainPath + '/PayeeFinder.json', 'UTF-8')
let findersAsString = fs.readFileSync(mainPath + '/PayeeFinder.json', 'UTF-8')

// Converts all BankAccount IDs from 'Axx' to 'Bxx' pattern
const accounts = _.values(repo.bankAccounts)
const accountIds = _.chain(accounts)
  .map(a => a.id)
  .value()
accountIds.forEach(id => {
  const newId = 'B' + id.substring(1)
  repoAsString = repoAsString.replace(new RegExp(`"${id}"`, 'g'), `"${newId}"`)
})

// Converts all Category IDs from 'Axx' to 'Cxx'
const categories = _.values(repo.categories)
const categoryIds = _.chain(categories)
  .map(a => a.id)
  .value()
categoryIds.forEach(id => {
  const newId = 'C' + id.substring(1)
  repoAsString = repoAsString.replace(new RegExp(`"${id}"`, 'g'), `"${newId}"`)
  findersAsString = findersAsString.replace(new RegExp(`"${id}"`, 'g'), `"${newId}"`)
})

// And saves the files
fs.writeFileSync(mainPath + '/Comptes-OUT.json', repoAsString, 'UTF-8')
fs.writeFileSync(mainPath + '/PayeeFinder-OUT.json', findersAsString, 'UTF-8')

// And remove non-existing categories
const updatedRepo = jsonfile.readFileSync(mainPath + '/Comptes-OUT.json', 'UTF-8')
const updatedCategories = _.values(updatedRepo.categories)
const updatedCategoryIds = _.chain(updatedCategories)
  .map(a => a.id)
  .value()
updatedCategories.forEach(cat => {
  const subAccounts = cat.subAccountIds
  if (subAccounts) {
    subAccounts.slice(0).forEach(id => {
      if (!updatedCategoryIds.includes(id) && id.startsWith('A')) {
        const index = subAccounts.indexOf(id)
        subAccounts.splice(index, 1)
      }
    })
    if (subAccounts.length === 0) {
      delete cat.subAccountIds
    }
  }
})
fs.writeFileSync(mainPath + '/Comptes-OUT.json', JSON.stringify(updatedRepo), 'UTF-8')
