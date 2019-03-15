import * as _ from 'lodash'
import Storage from './utils/storage'

export interface Category {
  id: string
  name: string
  parentId?: string
  subAccountIds?: string[]
  hidden?: boolean
}

export class Categories {
  private readonly storage: Storage
  private counter: number

  constructor(storage: Storage) {
    this.storage = storage
    // include hidden categories to find the next counter
    this.counter = storage.findNextCounter(this.list(true))
  }

  /**
   * Returns the list of categories
   * @param listHidden if true, lists all the categories, even the hidden (not used any longer) ones
   */
  list(listHidden = false): Category[] {
    const categories = _.values(this.storage.repo().categories)
    return _.chain(categories)
      .filter(a => (listHidden ? true : !a.hidden))
      .value()
  }

  /**
   * Returns the category for the given ID if it exists.
   * @param id
   */
  get(id: string): Category | undefined {
    return this.storage.repo().categories[id]
  }

  /**
   * Adds a new category with the given name and a parent category
   * @param categoryName
   * @param parentCategoryId
   */
  addCategory(categoryName: string, parentCategoryId: string): Category {
    // let's create the new category
    const catId = this.nextCategoryID()
    const category = {
      id: catId,
      name: categoryName,
      parentId: parentCategoryId
    }
    this.storage.repo().categories[catId] = category
    // we also need to reference this category in its parent too
    const parentCategory = this.storage.repo().categories[parentCategoryId]
    if (!parentCategory.subAccountIds) {
      parentCategory.subAccountIds = []
    }
    parentCategory.subAccountIds.push(catId)
    // and finally return the category
    return category
  }

  private nextCategoryID() {
    const nextCounter = this.counter
    // increase the counter for next ID
    this.counter++
    // and return the new counter, with the appropriate format 'P3782034'
    return 'A' + nextCounter
  }
}
