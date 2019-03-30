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
      <v-icon>help</v-icon>
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
  components: { NavBar }
})
</script>

<style>
</style>
