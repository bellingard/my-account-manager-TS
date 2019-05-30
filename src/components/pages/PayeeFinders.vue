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
            :items="finders"
            :rows-per-page-items="pagination.size"
            :search="search"
            class="elevation-3"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">{{ props.item.expr }}</td>
              <td class="text-xs-right">
                {{$categories.name(props.item.cat)}}
                <br>
                <span class="text-xs-right grey--text text--darken-1 caption">{{ props.item.cat }}</span>
              </td>
              <td class="text-xs-right">
                {{$payees.name(props.item.payee)}}
                <br>
                <span class="text-xs-right grey--text text--darken-1 caption">{{ props.item.payee }}</span>
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

export default Vue.extend({
  name: 'payeefinders',

  data() {
    return {
      headers: [
        { text: 'Expression', value: 'expr', sortable: false, align: 'left' },
        { text: 'Category', value: 'cat', sortable: false, align: 'right' },
        { text: 'Payee', value: 'payee', sortable: false, align: 'right' }
      ],
      pagination: {
        size: [12, 25, 50, 100]
      },
      search: '',
      finders: this.$storage.repo() ? this.$payees.finders() : []
    }
  }
})
</script>

<style>
</style>
