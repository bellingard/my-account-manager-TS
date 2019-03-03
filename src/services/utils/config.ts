import path from 'path'
import fs from 'fs'
const jsonfile = require('jsonfile')

/*
 * Configuration properties
 */
export interface ConfigProps {
  storageFolder: string
}

/*
 * Class to manage config of the app
 */
export class Config {
  configFilePath:  string;
  props!: ConfigProps;

  private configFolderPath:  string;

  constructor(homedir: string) {
    let devSuffix = process.env.NODE_ENV === 'production' ? '' : '-DEV'
    this.configFolderPath = path.join(homedir, '.my-account-manager')
    this.configFilePath = path.join(this.configFolderPath, `config${devSuffix}.json`)
  }

  load() {
    if (fs.existsSync(this.configFilePath)) {
      this.props = jsonfile.readFileSync(this.configFilePath, 'UTF-8')
    } else {
      this.createEmptyConfig()
      this.save()
    }
  }

  save() {
    if (!fs.existsSync(this.configFolderPath)) {
      fs.mkdirSync(this.configFolderPath)
    }
    fs.writeFileSync(this.configFilePath, JSON.stringify(this.props), 'UTF-8')
  }

  private createEmptyConfig() {
    this.props = {
      storageFolder: ''
    }
  }
}
