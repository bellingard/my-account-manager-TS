import os from 'os'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import { Config } from './services/utils/config'
import Storage from './services/utils/storage'
import { BankAccounts } from './services/bankaccounts'
import { Transactions } from './services/transactions'
import { Payees } from './services/payees'
import { Institutions } from './services/institutions'
import { Categories } from './services/categories'
import Formatter from './services/utils/formatter'
import { CsvLoader } from './services/utils/csv-loader'
import { Stats } from './services/stats'
import { BankReportReader } from './services/utils/bank-report-reader'

Vue.config.productionTip = false

Vue.prototype.$format = new Formatter()
Vue.prototype.$cvsLoader = new CsvLoader()
Vue.prototype.$bankReportReader = new BankReportReader(Vue.prototype.$cvsLoader)
Vue.prototype.$appConfig = new Config(os.homedir())
const appConfig = Vue.prototype.$appConfig
appConfig.load()
Vue.prototype.$storage = new Storage(appConfig.props)
const storage = Vue.prototype.$storage
// storage might not be initialized here if it's the first time the app is launched
if (storage.repo()) {
  Vue.prototype.$payees = new Payees(storage)
  const payees = Vue.prototype.$payees
  Vue.prototype.$transactions = new Transactions(storage, payees)
  const transactions = Vue.prototype.$transactions
  Vue.prototype.$accounts = new BankAccounts(storage, transactions)
  Vue.prototype.$stats = new Stats(storage, transactions, Vue.prototype.$accounts)
  Vue.prototype.$institutions = new Institutions(storage)
  Vue.prototype.$categories = new Categories(storage)
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
