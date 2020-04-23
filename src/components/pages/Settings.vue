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
      reloadStatus: false
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
