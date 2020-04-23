<template>
  <main>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs4 class="mb-3">
          <v-text-field
            append-icon="search"
            label="Search"
            single-line
            hide-details
            v-model="search"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="payees"
            :rows-per-page-items="pagination.size"
            :pagination.sync="pagination.sort"
            :search="search"
            class="elevation-3"
          >
            <template slot="items" slot-scope="props">
              <td
                class="text-xs-right grey--text text--darken-1 caption pl-1 pr-1"
              >{{ props.item.id }}</td>
              <td class="text-xs-left">{{ props.item.name }}</td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'payees',

  data() {
    return {
      headers: [
        { text: 'ID', value: 'id', align: 'right', width: '60px', class: 'pl-1 pr-1' },
        { text: 'Name', value: 'name', align: 'left' }
      ],
      pagination: {
        size: [12, 25, 50, 100],
        sort: {
          sortBy: 'name',
          descending: false
        }
      },
      search: '',
      payees: this.$storage.repo() ? this.$payees.list() : []
    }
  }
})
</script>
