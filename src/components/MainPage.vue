<template>
  <v-app dark>
    <nav-bar></nav-bar>

    <v-toolbar app fixed clipped-left class="blue darken-1">
      <v-avatar>
        <img src="../assets/logo.png">
      </v-avatar>
      <v-toolbar-title>My Account Manager</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/">
        <v-icon>home</v-icon>
      </v-btn>
      <v-snackbar
        :timeout="2000"
        top
        right
        v-model="cantSaveSnackbar"
      >Cannot save: some staged transactions don't have a category.</v-snackbar>
      <v-btn icon :loading="saveStatus" :disabled="saveStatus" @click.native="save()">
        <v-icon>save</v-icon>
      </v-btn>
    </v-toolbar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import NavBar from './NavBar.vue'

export default Vue.extend({
  name: 'MainPage',

  components: { NavBar },

  data() {
    return {
      saveStatus: false,
      cantSaveSnackbar: false
    }
  },

  methods: {
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
    }
  }
})
</script>

<style>
</style>
