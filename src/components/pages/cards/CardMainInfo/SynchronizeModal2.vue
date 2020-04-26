<template>
  <v-dialog v-model="syncModal" persistent width="50%">
    <v-btn icon class="blue--text darken-1" slot="activator">
      <v-icon>note_add</v-icon>
    </v-btn>
    <v-card>
      <v-card-title>
        <span class="headline">Synchronize account with transactions from file</span>
      </v-card-title>
      <v-card-text>
        <v-icon class="mr-4">folder_open</v-icon>
        <input v-on:change="getFileName" id="accountFile" type="file" />
        <br />
        <br />
        {{ this.accountFile }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="blue--text darken-1"
          flat
          @click.native="synchronizeWithTransactions()"
          :disabled="this.accountFile === ''"
          >Synchronize</v-btn
        >
        <v-btn class="blue--text darken-1" flat @click.native="close()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { BankReport } from '../../../../services/utils/bank-report-reader'

export default Vue.extend({
  name: 'synchronize-modal2',

  props: ['account'],

  data() {
    return {
      syncModal: false,
      accountFile: ''
    }
  },

  methods: {
    close() {
      this.syncModal = false
    },
    getFileName(e: any) {
      const files = e.target.files
      this.accountFile = files[0].path
    },
    synchronizeWithTransactions() {
      this.$bankReportReader
        .getBankReportFromFile(this.accountFile)
        .then((bankReport: BankReport) => {
          this.$transactions.synchronizeTransactions(this.account, bankReport.transactions)
          if (this.$accounts.getBalance(this.account) === bankReport.balance) {
            // All good, great!
            this.$emit('saved')
          } else {
            // The expected balance is not the updated one. There is a problem.
            const errorMessage = `The expected balance from the bank is ${bankReport.balance}, which does not match the new balance.`
            this.$emit('saved', errorMessage)
          }
        })
        .catch((reason: any) => {
          console.error(reason)
        })
      this.close()
    }
  }
})
</script>
