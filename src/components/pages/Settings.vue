<template>
  <main>
    <div>
      <v-btn
        class="grey darken-3"
        :loading="reloadStatus"
        :disabled="reloadStatus"
        @click.native="reload()"
      >
        Reload
        <v-icon right>file_upload</v-icon>
      </v-btn>
    </div>
    <div>
      <v-snackbar
        :timeout="2000"
        top
        right
        v-model="cantSaveSnackbar"
      >Cannot save: some staged transactions don't have a category.</v-snackbar>
      <v-btn
        class="grey darken-3"
        :loading="saveStatus"
        :disabled="saveStatus"
        @click.native="save()"
      >
        Save
        <v-icon right>save</v-icon>
      </v-btn>
    </div>
    <div>
      <v-btn class="grey darken-3" @click.native="shrinkCategories()">
        Shrink Categories
        <v-icon right>compare_arrows</v-icon>
      </v-btn>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'settings',

  data() {
    return {
      reloadStatus: false,
      saveStatus: false,
      cantSaveSnackbar: false
    }
  },

  methods: {
    reload() {
      this.reloadStatus = true
      this.$storage.reload(err => {
        if (err) {
          console.error(err)
        }
        this.reloadStatus = false
      })
    },

    save() {
      if (this.$transactions.hasUnclassifiedStagedTransaction()) {
        this.cantSaveSnackbar = true
      } else {
        this.saveStatus = true
        this.$transactions.confirmTransactions()
        this.$storage.save(err => {
          if (err) {
            console.error(err)
          }
          this.saveStatus = false
        })
      }
    },

    shrinkCategories() {
      this.$categories.list(true).forEach(category => {
        const count = this.$transactions.listForCategory(category.id).length
        if (category.subAccountIds == null && count === 0) {
          delete this.$storage.repo().categories[category.id]
        }
      })
    }
  }
})
</script>

<style>
</style>
