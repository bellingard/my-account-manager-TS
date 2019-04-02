import Vue from 'vue'
import Router from 'vue-router'
import MainPage from './components/MainPage.vue'
import Dashboard from './components/pages/Dashboard.vue'
import Accounts from './components/pages/Accounts.vue'
import Categories from './components/pages/Categories.vue'
import Settings from './components/pages/Settings.vue'
import PayeeFinders from './components/pages/PayeeFinders.vue'
import Payees from './components/pages/Payees.vue'
import Institutions from './components/pages/Institutions.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: MainPage,
      children: [
        {
          path: '/',
          component: Dashboard
        },
        {
          path: 'accounts/:accountId',
          component: Accounts,
          props: true
        },
        {
          path: 'accounts',
          component: Accounts,
          props: true
        },
        {
          path: 'categories',
          component: Categories
        },
        {
          path: 'institutions',
          component: Institutions
        },
        {
          path: 'payees',
          component: Payees
        },
        {
          path: 'payeefinders',
          component: PayeeFinders
        },
        {
          path: 'settings',
          component: Settings
        }
      ]
    },
    // And the default routes
    {
      path: '*',
      redirect: '/'
    }
  ]
})
