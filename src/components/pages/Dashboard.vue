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
        <v-flex xs6>
          <v-switch label="Favorites Only" v-model="favoritesOnly" color="blue darken-1"></v-switch>
          <v-list two-line dense>
            <template v-for="(item, index) in accounts">
              <v-divider v-if="index > 0" :inset="true" :key="index"></v-divider>
              <v-list-tile avatar :key="item.id" :to="'/accounts/' + item.id">
                <v-list-tile-avatar>
                  <img :src="$institutions.icon(item.institutionId)">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.name"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="item.accountNumber"></v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-list-tile-action-text>{{ $format.amount($accounts.getBalance(item.id)) }} &euro;</v-list-tile-action-text>
                  <v-icon
                    class="grey--text text--lighten-1"
                  >{{ item.favorite ? 'star' : 'star_border' }}</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>
      </v-layout>
    </v-container>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'
import path from 'path'
import * as _ from 'lodash'
import { BankAccounts, BankAccount } from '../../services/bankaccounts'
import { Transactions } from '../../services/transactions'
import { Payees } from '../../services/payees'
import { Institutions } from '../../services/institutions'
import { Categories } from '../../services/categories'

export default Vue.extend({
  name: 'dashboard',
  data() {
    return {
      favoritesOnly: true,
      accountFile: '',
      selectFolder: !this.$storage.repo()
    }
  },
  computed: {
    accounts(): BankAccount[] {
      // Warn: need to rely on 'this.selectFolder' to be sure that
      // the component will get refreshed once the folder is selected
      if (this.selectFolder) {
        return []
      } else {
        return _.chain(this.$accounts.list())
          .filter(a => (this.favoritesOnly ? a.favorite : true))
          .value()
      }
    }
  },
  methods: {
    getFileName(e: any) {
      var files = e.target.files
      this.accountFile = files[0].path
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
        Vue.prototype.$institutions = new Institutions(this.$storage)
        Vue.prototype.$categories = new Categories(this.$storage)
        // and continue
        this.$appConfig.save()
        this.selectFolder = false
        this.accountFile = ''
      } catch (e) {
        console.error(e)
      }
    }
  }
})
</script>

<style>
</style>
