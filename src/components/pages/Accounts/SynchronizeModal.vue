<template>
  <v-dialog v-model="syncModal" persistent width="50%">
    <v-btn icon class="blue--text darken-1" slot="activator">
      <v-icon>sync</v-icon>
    </v-btn>
    <v-card>
      <v-card-title>
        <span class="headline">Synchronize account with transactions</span>
      </v-card-title>
      <v-card-text>
        <v-text-field
          name="transactionsInput"
          v-model="transactionsInput"
          label="Transactions"
          textarea
          rows="15"
          autofocus
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="blue--text darken-1"
          flat
          @click.native="synchronizeWithTransactions()"
        >Synchronize</v-btn>
        <v-btn class="blue--text darken-1" flat @click.native="close()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'synchronize-modal',

  props: ['account'],

  data() {
    return {
      syncModal: false,
      transactionsInput: ''
    }
  },

  methods: {
    close() {
      this.syncModal = false
      this.transactionsInput = ''
    },
    synchronizeWithTransactions() {
      this.$cvsLoader.extractTransactions(this.transactionsInput, (transactions, err) => {
        this.syncModal = false
        if (err) {
          // TODO Do some better error handling here
          console.error(err)
        } else {
          this.$transactions.synchronizeTransactions(this.account, transactions!)
          this.$emit('saved')
        }
        this.close()
      })
    }
  }
})
</script>

<style>
</style>
