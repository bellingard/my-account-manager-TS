<template>
  <v-dialog v-model="open" persistent width="50%">
    <v-card v-if="this.transaction !== null">
      <v-card-title>
        <div>
          <span class="headline">Edit Card Payments</span>
          <br>
          <span>{{ this.transaction.date }}</span>
          <br>Amount:
          <span
            :class="$format.colorForAmount($format.transactionAmount(this.transaction, this.account))"
          >{{ $format.transactionAmount(this.transaction, this.account) }}</span>
          <br>
          <span v-if="this.transaction.stagedDesc !== null" class="grey--text">
            <i>{{ this.transaction.stagedDesc }}</i>
          </span>
        </div>
      </v-card-title>
      <v-card-text>
        <v-textarea
          outline
          name="transactionsInput"
          v-model="transactionsInput"
          label="Transactions"
          rows="15"
          autofocus
        ></v-textarea>
        <div v-if="errorMessage" class="red--text">
          <v-icon class="red--text">block</v-icon>
          {{ this.errorMessage }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="blue--text darken-1" flat @click.native="updateTransaction()">Update</v-btn>
        <v-btn class="blue--text darken-1" flat @click.native="close()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'edit-card-payments-modal',

  props: ['open', 'transaction', 'account'],

  data() {
    return {
      transactionsInput: '',
      errorMessage: null as string | null
    }
  },

  methods: {
    close() {
      this.resetFields()
      this.$emit('closed')
    },
    updateTransaction() {
      // First, sanitize the "bad" CSV that misses semi-colon
      let sanitizedCsv = this.$cvsLoader.addMissingSemiColon(this.transactionsInput)
      // And now proceed with replacements
      this.$cvsLoader.extractTransactions(sanitizedCsv, (transactions, err) => {
        if (err) {
          // TODO Do some better error handling here
          console.error(err)
          this.close()
        } else {
          this.$transactions.replaceCardPayments(this.account, this.transaction, transactions!, err => {
            if (err) {
              this.errorMessage = err.message
            } else {
              this.resetFields()
              this.$emit('saved')
            }
          })
        }
      })
    },
    resetFields() {
      this.errorMessage = null
      this.transactionsInput = ''
    }
  }
})
</script>

<style>
</style>
