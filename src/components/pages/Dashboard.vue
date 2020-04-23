<template>
  <main>
    <v-dialog v-if="!this.$storage.repo()" v-model="selectFolder" persistent width="50%">
      <v-card>
        <v-card-title>
          <div>
            <span class="headline">Open Your Account File</span>
          </div>
        </v-card-title>
        <v-card-text class="ml-4">
          <v-icon class="mr-4">folder_open</v-icon>
          <input v-on:change="getFileName" id="accountFile" type="file">
          <br>
          <br>
          {{ this.accountFile }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" flat @click.native="loadData()">Open</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs3>
          <v-switch label="Favorites Only" v-model="favoritesOnly" color="blue darken-1"></v-switch>
          <template v-for="item in accounts">
            <card-main-info
              :key="item.id"
              :accountId="item.id"
              :overview="true"
              @synced="refreshAccounts"
              class="ma-2"
            ></card-main-info>
          </template>
        </v-flex>
      </v-layout>
    </v-container>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'
import path from 'path'
import * as _ from 'lodash'
import CardMainInfo from './cards/CardMainInfo.vue'
import { BankAccounts, BankAccount } from '@/services/bankaccounts'
import { Transactions } from '@/services/transactions'
import { Payees } from '@/services/payees'
import { Institutions } from '@/services/institutions'
import { Categories } from '@/services/categories'
import { Stats } from '../../services/stats'

export default Vue.extend({
  name: 'dashboard',

  components: { CardMainInfo },

  data() {
    return {
      favoritesOnly: true,
      accountFile: '',
      allAccounts: this.$storage.repo() ? this.$accounts.list() : [],
      selectFolder: !this.$storage.repo()
    }
  },

  computed: {
    accounts(): BankAccount[] {
      return _.chain(this.allAccounts)
        .filter(a => (this.favoritesOnly ? a.favorite : true))
        .value()
    }
  },

  methods: {
    getFileName(e: any) {
      const files = e.target.files
      this.accountFile = files[0].path
    },

    refreshAccounts() {
      this.allAccounts = this.$accounts.list()
    },

    loadData() {
      this.$appConfig.props.storageFolder = path.dirname(this.accountFile)
      try {
        this.$storage.init()
        // init all the services
        Vue.prototype.$payees = new Payees(this.$storage)
        const payees = Vue.prototype.$payees
        Vue.prototype.$transactions = new Transactions(this.$storage, payees)
        const transactions = Vue.prototype.$transactions
        Vue.prototype.$accounts = new BankAccounts(this.$storage, transactions)
        Vue.prototype.$stats = new Stats(this.$storage, transactions, Vue.prototype.$accounts)
        Vue.prototype.$institutions = new Institutions(this.$storage)
        Vue.prototype.$categories = new Categories(this.$storage)
        // and continue
        this.$appConfig.save()
        this.accountFile = ''
        this.refreshAccounts()
      } catch (e) {
        console.error(e)
      }
    }
  }
})
</script>
