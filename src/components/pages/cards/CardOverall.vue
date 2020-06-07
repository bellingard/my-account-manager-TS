<template>
  <v-card class="pa-2">
    <em>Balance:</em>
    <div class="text-xs-left headline">{{ this.balance }} &euro;</div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'card-overall',

  computed: {
    balance(): string {
      return this.$format.amount(this.$accounts.getOverallBalance())
    }
  }
})
</script>
