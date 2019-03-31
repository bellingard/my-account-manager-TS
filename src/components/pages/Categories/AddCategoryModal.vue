<template>
  <v-dialog v-model="categoryModal" persistent width="50%">
    <v-btn icon class="blue--text darken-1" slot="activator">
      <v-icon>add_circle_outline</v-icon>
    </v-btn>
    <v-card>
      <v-card-title>
        <span class="headline">Add Category</span>
      </v-card-title>
      <v-card-text>
        <v-text-field label="Name" v-model="name" required autofocus></v-text-field>
        <v-autocomplete
          label="Sub-category of"
          :items="$categories.list()"
          item-text="name"
          item-value="id"
          v-model="parentCategoryId"
          :hint="$categories.fullName(this.parentCategoryId)"
          persistent-hint
          required
        ></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="blue--text darken-1" flat @click.native="addCategory()">Add</v-btn>
        <v-btn class="blue--text darken-1" flat @click.native="close()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'add-category-modal',

  data() {
    return {
      categoryModal: false,
      name: '',
      parentCategoryId: ''
    }
  },

  methods: {
    close() {
      this.categoryModal = false
      this.name = ''
      this.parentCategoryId = ''
    },
    addCategory() {
      if (this.name !== '' && this.parentCategoryId !== '') {
        let newCategory = this.$categories.addCategory(this.name, this.parentCategoryId)
        this.$emit('saved', newCategory)
        this.close()
      }
    }
  }
})
</script>

<style>
</style>
