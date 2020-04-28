<template>
  <v-card class="pa-2">
    <v-layout>
      <v-flex xs3 class="text-xs-center">
        <v-avatar size="50px" class="mb-2 mt-2">
          <img :src="icon" alt="Bank Icon" />
        </v-avatar>
      </v-flex>
      <v-flex xs9>
        <v-card-text>
          <div class="text-xs-right headline">{{ this.balance }} &euro;</div>
          <div class="text-xs-right grey--text text--darken-1 caption" v-if="this.accountNumber">
            Account n° {{ this.accountNumber }}
          </div>
        </v-card-text>
      </v-flex>
    </v-layout>
    <v-divider light></v-divider>
    <v-card-actions v-if="this.overview">
      <v-spacer></v-spacer>
      <em class="mr-1">{{ this.name }}</em>
      <v-btn icon :to="'/accounts/' + this.accountId">
        <v-icon>keyboard_arrow_right</v-icon>
      </v-btn>
    </v-card-actions>
    <v-card-actions v-if="!this.overview">
      Actions
      <v-spacer></v-spacer>
      <v-btn icon class="blue--text darken-1" @click="switchFavorite">
        <v-icon>{{ this.isFavorite ? 'star' : 'star_border' }}</v-icon>
      </v-btn>
      <synchronize-modal :account="accountId" @saved="refreshAccountData"></synchronize-modal>
      <synchronize-from-file-modal :account="accountId" @saved="refreshAccountData"></synchronize-from-file-modal>
      <v-snackbar top right color="error" :timeout="0" v-model="nonMatchingBalances">
        {{ this.nonMatchingBalancesMessage }}
        <v-btn text @click="nonMatchingBalances = false">Close</v-btn></v-snackbar
      >
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import SynchronizeModal from './CardMainInfo/SynchronizeModal.vue'
import SynchronizeFromFileModal from './CardMainInfo/SynchronizeFromFileModal.vue'

export default Vue.extend({
  name: 'card-main-info',

  components: { SynchronizeModal, SynchronizeFromFileModal },

  props: ['accountId', 'overview'],

  data() {
    return {
      // Hack to force recomputation of the balance
      forceRecompute: 0,
      nonMatchingBalances: false,
      nonMatchingBalancesMessage: ''
    }
  },

  computed: {
    icon(): string {
      return this.$institutions.icon(this.$accounts.get(this.accountId).institutionId)
    },
    name(): string {
      return this.$accounts.get(this.accountId).name
    },
    balance(): string {
      if (this.forceRecompute > 0) {
        // this is just used to force refresh
      }
      return this.$format.amount(this.$accounts.getBalance(this.accountId))
    },
    accountNumber(): string {
      return this.$accounts.get(this.accountId).accountNumber
    },
    isFavorite(): boolean {
      return this.$accounts.get(this.accountId).favorite
    }
  },

  methods: {
    refreshAccountData(errorMessage: string) {
      if (errorMessage) {
        this.nonMatchingBalancesMessage = errorMessage
        this.nonMatchingBalances = true
      }
      this.forceRecompute++
      this.$emit('synced')
    },
    switchFavorite() {
      this.$accounts.switchFavorite(this.accountId)
    }
  }
})
</script>
