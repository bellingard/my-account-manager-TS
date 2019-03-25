<template>
  <v-navigation-drawer app permanent fixed clipped :mini-variant="mini">
    <div :class="miniIconStyle">
      <v-toolbar-side-icon @click.stop="mini = !mini" class="grey--text"></v-toolbar-side-icon>
    </div>

    <div v-if="mini === false" class="pa-5 text-xs-center">
      <strong>My Account Manager</strong>
      <br>
      v. {{ this.appVersion }}
    </div>

    <v-divider></v-divider>
    <v-list dense>
      <v-list-tile to="/dashboards">
        <v-list-tile-action>
          <v-icon>dashboard</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Dashboards</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-subheader class="mt-2 grey--text text--darken-1">MANAGE</v-subheader>
    <v-list dense>
      <v-list-tile v-for="item in manageItems" :key="item.text" :to="item.to">
        <v-list-tile-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ item.text }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-subheader class="mt-2 grey--text text--darken-1">ADMIN</v-subheader>
    <v-list dense>
      <v-list-tile to="/payeefinders">
        <v-list-tile-action>
          <v-icon>compare_arrows</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Payee Finders</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to="/settings">
        <v-list-tile-action>
          <v-icon>settings</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Settings</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'nav-bar',
  data() {
    return {
      appVersion: require('../../package.json').version,
      mini: true,
      manageItems: [
        { icon: 'attach_money', text: 'Accounts', to: '/accounts' },
        { icon: 'group_work', text: 'Categories', to: '/categories' },
        { icon: 'account_balance', text: 'Institutions', to: '/institutions' },
        { icon: 'people', text: 'Payees', to: '/payees' }
      ]
    }
  },
  computed: {
    miniIconStyle() {
      return this.mini ? 'text-xs-center' : ''
    }
  }
}
</script>

<style>
</style>
