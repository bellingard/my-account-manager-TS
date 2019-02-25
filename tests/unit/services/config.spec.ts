import path from 'path'
import os from 'os'
import fs from 'fs'
import { Config } from '@/services/config'

describe('Config Service', () => {
  // Prepare tmp dir
  const rimraf = require('rimraf')
  const mkdirs = require('mkdirs')
  const tmpDir = path.join(os.tmpdir(), 'config.spec.ts')
  const appDir = path.join(tmpDir, '.my-account-manager')
  beforeAll(() => {
    mkdirs(tmpDir)
  })
  afterAll(() => {
    rimraf.sync(tmpDir)
  })
  afterEach(() => {
    rimraf.sync(appDir)
  })

  // Do the actual tests
  const c = new Config(tmpDir)

  it('should create folder and empty file if none exists', () => {
    expect(c.configFilePath).toEqual(path.join(appDir, 'config-DEV.json'))
    c.load();
    expect(c.props.storageFolder).toEqual('')
  })

  it('should read file if it exists', () => {
    let props = { storageFolder: '/foo'}
    mkdirs(appDir)
    fs.writeFileSync(path.join(appDir, 'config-DEV.json'), JSON.stringify(props), 'UTF-8')
    c.load()
    expect(c.props.storageFolder).toEqual('/foo')
  })
})
