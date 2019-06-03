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

        <v-flex xs3 v-if="selectedAccount != null" class="pr-2">
          <card-main-info :accountId="selectedAccount" @synced="refreshAccount"></card-main-info>
          <card-evolution-chart
            :accountId="selectedAccount"
            class="mt-2"
            @monthSelected="monthSelected"
          ></card-evolution-chart>
          <div class="mt-2">
            <v-card class="pa-2">
              <v-text-field
                append-icon="search"
                label="Search"
                single-line
                hide-details
                v-model="search"
                @focus="prefillSearch"
              ></v-text-field>
              <v-switch
                label="Hide classified transactions"
                v-model="nonClassifiedOnly"
                color="blue darken-1"
              ></v-switch>
              <v-chip
                v-model="filterByMonthChip"
                close
                label
                outline
                small
                @input="filterByMonthChip = false; filterByMonth = ''"
              >{{this.filterByMonth}}</v-chip>
            </v-card>
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
            class="elevation-3"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">
                <div
                  style="font-weight: bold; font-size: 16px; white-space: nowrap"
                >{{ $format.dateInYear(props.item.date) }}</div>
                <div>{{ $format.year(props.item.date) }}</div>
              </td>
              <td class="text-xs-left">
                <div v-if="props.item.payeeId">{{ props.item.payeeName }}</div>
                <div v-if="props.item.desc !== ''">{{ props.item.desc }}</div>
                <div
                  v-if="props.item.stagedDesc !== ''"
                  :class="props.item.fromId === '' ? 'amber--text' : 'grey--text'"
                >{{ props.item.stagedDesc }}</div>
              </td>
              <td class="text-xs-center">
                <div
                  v-if="isTransfer(props.item)"
                >Transfer ({{ selectedAccount === props.item.fromId ? $accounts.name(props.item.toId) : $accounts.name(props.item.fromId)}})</div>
                <div v-else>{{ props.item.categoryName }}</div>
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
import CardMainInfo from './cards/CardMainInfo.vue'
import CardEvolutionChart from './cards/CardEvolutionChart.vue'
import EditTransactionModal from './Accounts/EditTransactionModal.vue'
import EditCardPaymentsModal from './Accounts/EditCardPaymentsModal.vue'
import { BankAccount } from '@/services/bankaccounts'
import { Transaction, Transactions } from '@/services/transactions'

export default Vue.extend({
  name: 'accounts',

  components: {
    CardMainInfo,
    CardEvolutionChart,
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
          // value must be "payeeName" here if we want the search to work...
          value: 'payeeName',
          sortable: false,
          align: 'left'
        },
        {
          text: 'Category',
          value: 'categoryName',
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
      favoritesOnly: true,
      showClosed: false,
      search: '',
      nonClassifiedOnly: false,
      filterByMonth: '',
      filterByMonthChip: false,
      allTransactions: (this as any).retrieveAllTransactions(),
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
    },
    transactions(): Transaction[] {
      if (this.getAccountId() != null) {
        return _.chain(this.allTransactions)
          .filter(t => (this.nonClassifiedOnly ? this.$transactions.isUnclassifiedStaged(t) : true))
          .filter(t =>
            this.filterByMonth === ''
              ? true
              : t.date >= this.filterByMonth + '-00' && t.date < this.filterByMonth + '-32'
          )
          .map(t =>
            Object.assign({}, t, {
              payeeName: t.payeeId ? this.$payees.name(t.payeeId) : '',
              categoryName: this.$categories.name(t.fromId)
            })
          )
          .value()
      }
      return []
    }
  },

  watch: {
    selectedAccount: function(newAccount) {
      this.allTransactions = this.retrieveAllTransactions()
    }
  },

  methods: {
    getAccountId(): string {
      return this.selectedAccount == null ? this.accountId : this.selectedAccount
    },
    prefillSearch() {
      this.search = window.getSelection()!.toString()
    },
    refreshAccount() {
      this.allTransactions = this.retrieveAllTransactions()
    },
    retrieveAllTransactions(): Transaction[] {
      return this.getAccountId() != null ? this.$transactions.listForAccount(this.getAccountId()) : []
    },
    isTransfer(t: Transaction) {
      return Transactions.isTransfer(t)
    },
    computeAccountBalance(): number {
      return this.getAccountId() != null ? this.$accounts.getBalance(this.getAccountId()) : 0
    },
    // methods to manage the edition of transactions
    openEditModal(transaction: Transaction) {
      if (Transactions.isTransfer(transaction)) {
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
      this.allTransactions = this.retrieveAllTransactions()
      this.closeTransactionModal()
      this.closeCardModal()
    },
    monthSelected(month: string) {
      this.filterByMonth = month
      this.filterByMonthChip = true
    }
  }
})
</script>

<style>
.state-icon {
  font-size: 15px;
}
</style>
