<template>
  <main>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs4>
          <v-text-field
            append-icon="search"
            label="Search"
            single-line
            hide-details
            v-model="search"
            class
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="finders"
            :rows-per-page-items="pagination.size"
            :search="search"
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">{{ props.item.expr }}</td>
              <td class="text-xs-right">
                {{ props.item.cat }}
                <br>
                <strong>{{$categories.name(props.item.cat)}}</strong>
              </td>
              <td class="text-xs-right">
                {{ props.item.payee }}
                <br>
                <strong>{{$payees.name(props.item.payee)}}</strong>
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
        { text: 'Expression', value: 'expression', sortable: false, align: 'left' },
        { text: 'Category', value: 'category', sortable: false },
        { text: 'Payee', value: 'payee', sortable: false }
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
