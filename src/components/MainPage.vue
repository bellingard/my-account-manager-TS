<template>
  <v-app dark>
    <nav-bar></nav-bar>

    <top-bar></top-bar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import TopBar from './TopBar.vue'
import NavBar from './NavBar.vue'

export default Vue.extend({
  name: 'MainPage',

  components: { TopBar, NavBar }
})
</script>
