import { Categories, Category } from '@/services/categories'
import Storage from '@/services/utils/storage'

// Mock Storage
const mockRepo = {
  categories: {
    A1: { id: 'A1', name: 'Expenses', subAccountIds: ['A27', 'A60'] },
    A27: { id: 'A27', name: 'Food', parentId: 'A1', subAccountIds: ['A28', 'A29'] },
    A28: { id: 'A28', name: 'Resto', parentId: 'A27' },
    A29: { id: 'A29', name: 'Supermarket', parentId: 'A27' },
    A63: { id: 'A63', name: 'Sport', parentId: 'A60', hidden: true }
  }
}
jest.mock('@/services/utils/storage', () => {
  return jest.fn().mockImplementation(() => {
    return {
      repo: () => {
        return mockRepo
      },
      findNextCounter: () => {
        return 61
      }
    }
  })
})

// And start the tests
const categories = new Categories(new Storage({ storageFolder: '' }))

describe('Categories', () => {
  it('should list non hidden categories by default', () => {
    expect(categories.list()).toHaveLength(4)
  })

  it('should be able to list all categories', () => {
    expect(categories.list(true)).toHaveLength(5)
  })

  it('should get category from ID', () => {
    expect(categories.get('A29')).toEqual({ id: 'A29', name: 'Supermarket', parentId: 'A27' })
    expect(categories.get('unknown_ID')).toBeUndefined()
  })

  it('should give name from ID', () => {
    expect(categories.name('A1')).toEqual('Expenses')
    expect(categories.name('unknown')).toEqual('-- category? --')
  })

  it('should give full name from ID', () => {
    expect(categories.fullName('A1')).toEqual('Expenses')
    expect(categories.fullName('A28')).toEqual('Expenses > Food > Resto')
  })

  it('should add new category', () => {
    let newCat = categories.addCategory('Travel', 'A1')
    expect(newCat).toEqual({ id: 'A61', name: 'Travel', parentId: 'A1' })
    expect(categories.list(true)).toHaveLength(6)
    expect(categories.list()).toEqual(expect.arrayContaining([newCat]))
    const parentCat = categories.get('A1')
    expect(parentCat.subAccountIds).toEqual(expect.arrayContaining(['A61']))

    // and now let's add a category with a parent which does not have sub accounts yet
    newCat = categories.addCategory('Business Travel', 'A61')
    expect(newCat).toEqual({ id: 'A62', name: 'Business Travel', parentId: 'A61' })
    expect(categories.get('A61')).toEqual({ id: 'A61', name: 'Travel', parentId: 'A1', subAccountIds: ['A62'] })
  })
})
