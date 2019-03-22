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
  get(id: string): Category {
    return this.storage.repo().categories[id]
  }

  /**
   * Returns the name of the category based on its ID
   * @param id
   */
  name(id: string): string {
    const category = this.get(id)
    return category == null ? '-- category? --' : category.name
  }

  /**
   * Returns the name of the category, with name of all parent categories
   * @param id
   */
  fullName(id: string): string {
    const categoryName = this.name(id)
    const parentId = this.get(id) && this.get(id).parentId
    if (parentId) {
      return `${this.fullName(parentId)} > ${categoryName}`
    } else {
      return categoryName
    }
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
    // and return the new counter, with the appropriate format 'A3782034'
    return 'A' + nextCounter
  }
}
