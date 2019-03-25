import Storage from '@/services/utils/storage'
import { Institutions } from '@/services/institutions'

// Mock Storage
const mockRepo = {
  institutions: {
    I303: { id: 'I303', name: 'Institution 303' },
    I424: { id: 'I424', name: 'Institution 424' },
    I545: { id: 'I545', name: 'Institution 545' }
  }
}
jest.mock('@/services/utils/storage', () => {
  return jest.fn().mockImplementation(() => {
    return {
      repo: () => {
        return mockRepo
      }
    }
  })
})

// And start the tests
const institutions = new Institutions(new Storage({ storageFolder: '' }))

describe('Institutions', () => {
  it('should list institutions', () => {
    expect(institutions.list()).toHaveLength(3)
  })

  it('should get institution from ID', () => {
    expect(institutions.get('I303')).toEqual({ id: 'I303', name: 'Institution 303' })
    expect(institutions.get('unknown_ID')).toBeUndefined()
  })

  it('should return path for institution icons', () => {
    expect(institutions.icon('foo')).toEqual('/institutions/foo.png')
  })
})
