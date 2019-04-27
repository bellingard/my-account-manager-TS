<template>
  <v-card class="pa-2">
    <evolution-chart :accountId="accountId" :year="selectedYear" :height="300" class="mt-3"></evolution-chart>
    <v-divider light></v-divider>
    <v-card-actions>
      Yearly Evolution ({{ this.selectedYear ? this.selectedYear : 'last 12 months'}})
      <v-spacer></v-spacer>
      <v-btn icon class="blue--text darken-1" @click="previousYear">
        <v-icon>keyboard_arrow_left</v-icon>
      </v-btn>
      <v-btn icon class="blue--text darken-1" @click="nextYear">
        <v-icon>keyboard_arrow_right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import EvolutionChart from './CardEvolutionChart/EvolutionChart.vue'

export default Vue.extend({
  name: 'card-evolution-chart',

  components: { EvolutionChart },

  props: ['accountId'],

  data() {
    return {
      selectedYear: null as number | null,
      currentYear: new Date().getFullYear()
    }
  },

  methods: {
    previousYear() {
      if (this.selectedYear) {
        this.selectedYear = this.selectedYear - 1
      } else {
        this.selectedYear = this.currentYear - 1
      }
    },
    nextYear() {
      if (this.selectedYear) {
        if (this.currentYear === this.selectedYear + 1) {
          this.selectedYear = null
        } else {
          this.selectedYear = this.selectedYear + 1
        }
      }
    }
  },

  watch: {
    accountId: function(newAccountId) {
      this.selectedYear = null
    }
  }
})
</script>

<style>
</style>
