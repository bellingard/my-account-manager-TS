<template>
  <main>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-data-table
            :items="categories"
            :headers="headers"
            :rows-per-page-items="paginationSize"
            :hide-actions="true"
            class="elevation-3"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left" style="width: 300px">
                {{$categories.fullName(props.item.id)}}
                <span
                  class="text-xs-right grey--text text--darken-1 caption"
                >({{ props.item.id }})</span>
              </td>
              <template v-for="month in stats">
                <td
                  class="text-xs-center"
                  :class="$format.colorForAmount(month.details[props.item.id])"
                  style="width: 20px"
                  :key="month.id"
                >{{ month.details[props.item.id] ? $format.amount(month.details[props.item.id]) : ''}}</td>
              </template>
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
import { BankAccount, MonthlyStats } from '@/services/bankaccounts'
import { Category } from '../../services/categories'

export default Vue.extend({
  name: 'budget',

  data() {
    return {
      stats: this.$stats.budgetForPreviousYear(new Date()).splice(7),
      paginationSize: ['100']
    }
  },

  computed: {
    categories(): Object[] {
      const categories = _.chain(this.stats)
        .map(s => Object.keys(s.details!))
        .flatten()
        .union()
        .map(id => this.$categories.get(id))
        .map(c =>
          Object.assign({}, c, {
            fullName: this.$categories.fullName(c.id)
          })
        )
        .orderBy(cat => cat.fullName)
        .value()
      return categories
    },
    headers(): Object[] {
      const months = _.chain(this.stats)
        .map(s =>
          Object.assign({
            text: this.$format.month(s.date),
            value: s.date,
            align: 'center',
            sortable: false
          })
        )
        .value()
      return _.flatten([
        {
          text: 'Category',
          value: 'category',
          align: 'center',
          sortable: false
        },
        months
      ])
    }
  }
})
</script>
