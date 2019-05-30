<template>
  <main>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs4 class="pr-4">
          <v-text-field
            append-icon="search"
            label="Search"
            single-line
            hide-details
            v-model="search"
          ></v-text-field>
        </v-flex>
        <v-flex xs2>
          <v-switch label="Show hidden" v-model="showHidden" color="blue darken-1"></v-switch>
        </v-flex>
        <v-flex xs6 class="text-xs-right">
          <add-category-modal @saved="categoryAdded"></add-category-modal>
        </v-flex>

        <v-flex xs12>
          <edit-category-modal
            :open="editCategoryModal"
            :category="editCategory"
            @closed="closeCategoryModal"
            @saved="categorySaved"
          ></edit-category-modal>
          <v-data-table
            :headers="headers"
            :items="categories"
            :rows-per-page-items="pagination.size"
            :pagination.sync="pagination.sort"
            :search="search"
            class="elevation-3"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-right" style="width: 20px">
                <v-icon
                  class="state-icon grey--text"
                >{{ props.item.hidden ? 'visibility_off' : 'visibility' }}</v-icon>
              </td>
              <td class="text-xs-right grey--text text--darken-1 caption pl-1 pr-1">{{ props.item.id }}</td>
              <td class="text-xs-left">{{ props.item.fullName }}</td>
              <td class="text-xs-right">
                <span
                  :class=" props.item.subAccountIds == null && props.item.transactionCount === 0 ? 'red--text' : ''"
                >{{ props.item.transactionCount }}</span>
              </td>
              <td class="text-xs-right">
                <v-btn icon small class="mb-1" @click="openEditModal(props.item)">
                  <v-icon class="state-icon grey--text">mode_edit</v-icon>
                </v-btn>
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
import AddCategoryModal from './Categories/AddCategoryModal.vue'
import EditCategoryModal from './Categories/EditCategoryModal.vue'
import { Category } from '@/services/categories'

export default Vue.extend({
  name: 'categories',

  components: { AddCategoryModal, EditCategoryModal },

  data() {
    return {
      headers: [
        { text: '', value: 'hidden', align: 'right' },
        { text: 'ID', value: 'id', align: 'right', width: '10px', class: 'pl-1 pr-1' },
        { text: 'Name', value: 'fullName', align: 'left' },
        { text: 'Transaction Count', value: 'transactionCount', align: 'right' },
        { text: 'Actions', value: 'actions', align: 'right', sortable: false }
      ],
      pagination: {
        size: [12, 25, 50, 100],
        sort: {
          sortBy: 'fullName',
          descending: false
        }
      },
      allCategories: this.$categories.list(true) as Category[],
      search: '',
      editCategory: null as Category | null,
      editCategoryModal: false,
      showHidden: false
    }
  },

  computed: {
    categories(): any[] {
      if (this.$storage.repo()) {
        return _.chain(this.allCategories)
          .filter(c => (this.showHidden ? true : !c.hidden))
          .map(c =>
            Object.assign({}, c, {
              fullName: this.$categories.fullName(c.id),
              transactionCount: this.$transactions.listForCategory(c.id).length
            })
          )
          .value()
      }
      return []
    }
  },

  methods: {
    categoryAdded(newCategory: Category | null) {
      this.allCategories = this.$categories.list(true)
      // let's use the search to focus on the new category
      this.search = newCategory ? newCategory.name : ''
    },
    // methods to edit a category
    openEditModal(category: Category | null) {
      this.editCategory = category
      this.editCategoryModal = true
    },
    closeCategoryModal() {
      this.editCategory = null
      this.editCategoryModal = false
    },
    categorySaved() {
      this.closeCategoryModal()
      this.allCategories = this.$categories.list(true)
    }
  }
})
</script>

<style>
.state-icon {
  font-size: 15px;
}
</style>
