<template>
  <main>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs5 class="pr-4">
          <v-select
            :disabled="!this.$storage.repo()"
            :items="accounts"
            v-model="selectedAccount"
            label="Select account"
            item-text="name"
            item-value="id"
          ></v-select>
        </v-flex>
        <v-flex xs2>
          <v-switch label="Favorites" v-model="favoritesOnly" color="blue darken-1"></v-switch>
        </v-flex>
        <v-flex xs2>
          <v-switch label="Show closed" v-model="showClosed" color="blue darken-1"></v-switch>
        </v-flex>
        <v-flex xs1></v-flex>

        <v-flex xs3 v-if="selectedAccount != null" class="pr-5">
          <div>
            <div class="pb-4">
              <v-avatar size="64px">
                <img :src="$institutions.icon($accounts.get(selectedAccount).institutionId)">
              </v-avatar>
            </div>
            <div class="grey--text text--darken-1">Balance</div>
            <div class="text-xs-right headline">{{ $format.amount(accountBalance) }} &euro;</div>
            <div class="grey--text text--darken-1">Account number</div>
            <div class="text-xs-right">{{ $accounts.get(selectedAccount).accountNumber }}</div>
          </div>
          <div>
            <v-btn icon class="blue--text darken-1" @click="switchFavorite">
              <v-icon>{{ this.isFavorite ? 'star' : 'star_border' }}</v-icon>
            </v-btn>
            <synchronize-modal :account="getAccountId()" @saved="refreshAccountData"></synchronize-modal>
            <payee-finder-modal></payee-finder-modal>
          </div>
          <div class="mt-5">
            <v-text-field
              append-icon="search"
              label="Search"
              single-line
              hide-details
              v-model="search"
              class
            ></v-text-field>
          </div>
        </v-flex>

        <v-flex xs9 v-if="selectedAccount != null">
          <edit-transaction-modal
            :open="editTransactionModal"
            :transaction="editTransaction"
            :account="getAccountId()"
            @closed="closeTransactionModal"
            @saved="transactionSaved"
          ></edit-transaction-modal>
          <edit-card-payments-modal
            :open="editCardModal"
            :transaction="editTransaction"
            :account="getAccountId()"
            @closed="closeCardModal"
            @saved="transactionSaved"
          ></edit-card-payments-modal>
          <v-data-table
            :headers="headers"
            :items="transactions"
            :rows-per-page-items="pagination.size"
            :pagination.sync="pagination.sort"
            :search="search"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">
                <div
                  style="font-weight: bold; font-size: 16px; white-space: nowrap"
                >{{ $format.dateInYear(props.item.date) }}</div>
                <div>{{ $format.year(props.item.date) }}</div>
              </td>
              <td class="text-xs-left">
                <div v-if="props.item.payeeId">{{ $payees.name(props.item.payeeId) }}</div>
                <div v-if="props.item.desc !== ''">{{ props.item.desc }}</div>
                <div
                  v-if="props.item.stagedDesc !== ''"
                  :class="props.item.fromId === '' ? 'amber--text' : 'grey--text'"
                >{{ props.item.stagedDesc }}</div>
              </td>
              <td class="text-xs-center">
                <div>{{ $categories.name(props.item.fromId) }}</div>
              </td>
              <td
                class="text-xs-right"
                style="white-space: nowrap"
                :class="$format.colorForAmount($format.transactionAmount(props.item, selectedAccount))"
              >
                {{ $format.transactionAmount(props.item, selectedAccount) }}
                <v-btn icon small class="mb-1" @click="openEditModal(props.item)">
                  <v-icon
                    :class="props.item.stagedDesc ? 'state-icon amber--text' : 'state-icon grey--text'"
                  >{{ props.item.stagedDesc ? 'cached' : 'done' }}</v-icon>
                </v-btn>
                <v-snackbar
                  :timeout="2000"
                  top
                  right
                  v-model="editActionSnackbar"
                >Cannot edit bank transfer.</v-snackbar>
              </td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'
import * as _ from 'lodash'
import PayeeFinderModal from './Accounts/PayeeFinderModal.vue'
import SynchronizeModal from './Accounts/SynchronizeModal.vue'
import EditTransactionModal from './Accounts/EditTransactionModal.vue'
import EditCardPaymentsModal from './Accounts/EditCardPaymentsModal.vue'
import { BankAccount } from '@/services/bankaccounts'
import { Transaction } from '@/services/transactions'

export default Vue.extend({
  name: 'accounts',

  components: {
    PayeeFinderModal,
    SynchronizeModal,
    EditTransactionModal,
    EditCardPaymentsModal
  },

  props: ['accountId'],

  data() {
    return {
      selectedAccount: this.accountId ? this.accountId : null,
      headers: [
        { text: 'Date', value: 'date', sortable: false, align: 'left' },
        {
          text: 'Description',
          value: 'description',
          sortable: false,
          align: 'left'
        },
        {
          text: 'Category',
          value: 'category',
          sortable: false,
          align: 'center'
        },
        { text: 'Amount', value: 'amount', sortable: false, align: 'right' }
      ],
      pagination: {
        size: [12, 25, 50, 100],
        sort: {
          sortBy: 'date',
          descending: true
        }
      },
      favoritesOnly: false,
      showClosed: false,
      search: '',
      isFavorite: (this as any).getAccountId() != null ? (this as any).$accounts.get((this as any).getAccountId()).favorite : false,
      transactions: (this as any).retrieveTransactions(),
      accountBalance: (this as any).computeAccountBalance(),
      editTransaction: null as Transaction | null,
      editTransactionModal: false,
      editCardModal: false,
      editActionSnackbar: false
    }
  },

  computed: {
    accounts(): BankAccount[] {
      if (this.$storage.repo()) {
        return _.chain(this.$accounts.list(this.showClosed))
          .filter(a => (this.favoritesOnly ? a.favorite : true))
          .value()
      } else {
        return []
      }
    }
  },

  watch: {
    selectedAccount: function(newAccount) {
      this.isFavorite = this.$accounts.get(this.getAccountId()).favorite
      this.transactions = this.retrieveTransactions()
      this.accountBalance = this.computeAccountBalance()
    }
  },

  methods: {
    getAccountId(): string {
      return this.selectedAccount == null ? this.accountId : this.selectedAccount
    },
    retrieveTransactions(): Transaction[] {
      return this.getAccountId() != null ? this.$transactions.listForAccount(this.getAccountId()) : []
    },
    computeAccountBalance(): number {
      return this.getAccountId() != null ? this.$accounts.getBalance(this.getAccountId()) : 0
    },
    refreshAccountData() {
      this.transactions = this.retrieveTransactions()
      this.accountBalance = this.computeAccountBalance()
    },
    switchFavorite() {
      this.isFavorite = this.$accounts.switchFavorite(this.getAccountId())
    },
    // methods to manage the edition of transactions
    openEditModal(transaction: Transaction) {
      if (this.$transactions.isTransfer(transaction)) {
        this.editActionSnackbar = true
      } else if (this.$transactions.isCardPayments(transaction)) {
        this.openCardModal(transaction)
      } else {
        this.openTransactionModal(transaction)
      }
    },
    openTransactionModal(transaction: Transaction) {
      this.editTransaction = transaction
      this.editTransactionModal = true
    },
    closeTransactionModal() {
      this.editTransaction = null
      this.editTransactionModal = false
    },
    openCardModal(transaction: Transaction) {
      this.editTransaction = transaction
      this.editCardModal = true
    },
    closeCardModal() {
      this.editTransaction = null
      this.editCardModal = false
    },
    transactionSaved() {
      this.transactions = this.retrieveTransactions()
      this.closeTransactionModal()
      this.closeCardModal()
    }
  }
})
</script>

<style>
.state-icon {
  font-size: 15px;
}
</style>
