<template>
  <v-dialog v-model="open" persistent width="50%">
    <v-card v-if="this.transaction !== null">
      <v-card-title>
        <div>
          <span class="headline">Edit Transaction</span>
          <br />
          <span>{{ this.transaction.date }}</span>
          <br />Amount:
          <span :class="$format.colorForAmount($format.transactionAmount(this.transaction, this.account))">{{
            $format.transactionAmount(this.transaction, this.account)
          }}</span>
          <br />
          <span v-if="this.transaction.stagedDesc" class="grey--text">
            <em>{{ this.transaction.stagedDesc }}</em>
            <v-btn icon class="blue--text darken-1" @click="adaptPayeeFinderPatternField">
              <v-icon>add_circle_outline</v-icon>
            </v-btn>
          </span>
        </div>
      </v-card-title>
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs11>
            <v-autocomplete
              label="Payee"
              :items="$payees.list()"
              item-text="name"
              item-value="id"
              v-model="payeeId"
              autofocus
              v-if="!showNewPayeeField"
            ></v-autocomplete>
            <v-text-field label="New Payee" v-model="newPayeeName" v-if="showNewPayeeField"></v-text-field>
          </v-flex>
          <v-flex xs1>
            <v-btn icon class="blue--text darken-1 mt-3" @click="adaptPayeeField">
              <v-icon>compare_arrows</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs12 v-if="showPayeeFinderPatternField">
            <v-text-field
              label="Payee finder pattern"
              v-model="payeeFinderPattern"
              v-if="showPayeeFinderPatternField"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-autocomplete
              label="Category"
              :items="categories"
              item-text="fullName"
              item-value="id"
              v-model="categoryId"
              persistent-hint
              required
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12>
            <v-switch label="Unusual transaction" v-model="unusual" color="blue darken-1"></v-switch>
          </v-flex>
          <v-flex xs12>
            <v-textarea outline label="Description" rows="3" v-model="description"></v-textarea>
          </v-flex>
        </v-layout>
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
  name: 'edit-transaction-modal',

  props: ['open', 'transaction', 'account'],

  data() {
    return {
      payeeId: '',
      categoryId: '',
      description: '',
      unusual: false,
      showNewPayeeField: false,
      newPayeeName: '',
      showPayeeFinderPatternField: false,
      payeeFinderPattern: ''
    }
  },

  computed: {
    categories(): any[] {
      return _.chain(this.$categories.list())
        .map(c =>
          Object.assign({}, c, {
            fullName: this.$categories.fullName(c.id)
          })
        )
        .value()
    }
  },

  methods: {
    close() {
      this.$emit('closed')
    },
    updateTransaction() {
      const realTransaction = this.$transactions.get(this.transaction.id)
      // Get the payee
      if (this.newPayeeName) {
        let newPayee = this.$payees.addPayee(this.newPayeeName)
        realTransaction.payeeId = newPayee.id
      } else {
        realTransaction.payeeId = this.payeeId
      }
      // Let's add the payee finder if it's specified
      if (this.payeeFinderPattern !== '' && realTransaction.payeeId !== '') {
        this.$payees.addFinder(realTransaction.payeeId, this.payeeFinderPattern, this.categoryId)
      }
      // And then update transaction
      realTransaction.fromId = this.categoryId
      realTransaction.unusual = this.unusual
      realTransaction.desc = this.description
      this.$emit('saved')
    },
    adaptPayeeField() {
      this.showNewPayeeField = !this.showNewPayeeField
      if (!this.showNewPayeeField) {
        this.newPayeeName = ''
      }
    },
    adaptPayeeFinderPatternField() {
      this.showPayeeFinderPatternField = !this.showPayeeFinderPatternField
      const selection = window.getSelection()!.toString()
      if (selection === '') {
        this.payeeFinderPattern = this.transaction.stagedDesc
      } else {
        this.payeeFinderPattern = selection
      }
    }
  },

  watch: {
    transaction: function(newTransaction) {
      if (newTransaction) {
        this.categoryId = newTransaction.fromId
        this.unusual = newTransaction.unusual
        this.description = newTransaction.desc
        this.payeeId = newTransaction.payeeId
        this.showNewPayeeField = false
        this.newPayeeName = ''
        this.showPayeeFinderPatternField = false
        this.payeeFinderPattern = ''
      }
    }
  }
})
</script>
