<template>
  <v-card class="pa-2">
    <v-layout>
      <v-flex xs3>
        <v-avatar size="64px" class="mb-2">
          <img :src="icon">
        </v-avatar>
      </v-flex>
      <v-flex xs9>
        <v-card-text>
          <div class="text-xs-right headline">{{ this.balance }} &euro;</div>
          <div
            class="text-xs-right grey--text text--darken-1 caption"
            v-if="this.accountNumber"
          >Account n° {{ this.accountNumber }}</div>
        </v-card-text>
      </v-flex>
    </v-layout>
    <v-divider light></v-divider>
    <v-card-actions>
      Actions
      <v-spacer></v-spacer>
      <v-btn icon class="blue--text darken-1" @click="switchFavorite">
        <v-icon>{{ this.isFavorite ? 'star' : 'star_border' }}</v-icon>
      </v-btn>
      <synchronize-modal :account="accountId" @saved="refreshAccountData"></synchronize-modal>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import SynchronizeModal from './CardMainInfo/SynchronizeModal.vue'

export default Vue.extend({
  name: 'card-main-info',

  components: { SynchronizeModal },

  props: ['accountId'],

  data() {
    return {
      // Hack to force recomputation of the balance
      forceRecompute: 0
    }
  },

  computed: {
    icon(): string {
      return this.$institutions.icon(this.$accounts.get(this.accountId).institutionId)
    },
    balance(): string {
      this.forceRecompute
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
    refreshAccountData() {
      this.forceRecompute++
      this.$emit('synced')
    },
    switchFavorite() {
      this.$accounts.switchFavorite(this.accountId)
    }
  }
})
</script>

<style>
</style>
