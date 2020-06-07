<template>
  <v-toolbar app fixed clipped-left class="blue darken-1">
    <v-avatar>
      <img src="../assets/logo.png" alt="My Account Manager Logo" />
    </v-avatar>
    <v-toolbar-title>My Account Manager</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-snackbar :timeout="2000" top right v-model="cantSaveSnackbar"
      >Cannot save: some staged transactions don't have a category.</v-snackbar
    >
    <v-snackbar :timeout="2000" top right v-model="cantUploadSnackbar"
      >Cannot upload: some staged transactions don't have a category.</v-snackbar
    >
    <v-snackbar top right :color="this.messageColor" :timeout="this.messageTimeout" v-model="showMessage">
      {{ this.message }}
      <v-btn text @click="showMessage = false">Close</v-btn></v-snackbar
    >
    <v-btn icon to="/">
      <v-icon>home</v-icon>
    </v-btn>
    <v-btn icon :loading="saveStatus" @click.native="save()">
      <v-icon>save</v-icon>
    </v-btn>
    <v-btn icon :loading="uploadStatus" @click.native="commitAndUpload()">
      <v-icon>cloud_upload</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'top-bar',

  data() {
    return {
      saveStatus: false,
      cantSaveSnackbar: false,
      uploadStatus: false,
      cantUploadSnackbar: false,
      showMessage: false,
      messageTimeout: 0,
      messageColor: '',
      message: ''
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
          this.saveStatus = false
          this.showMessage = true
          if (err) {
            this.message = `Error while saving: ${err.message}`
            this.messageTimeout = 0
            this.messageColor = 'error'
          } else {
            this.message = 'Success!'
            this.messageTimeout = 2000
            this.messageColor = 'info'
          }
        })
      }
    },
    commitAndUpload() {
      if (this.$transactions.hasUnclassifiedStagedTransaction()) {
        this.cantUploadSnackbar = true
      } else {
        this.uploadStatus = true
        this.$storage.commitAndUpload(err => {
          this.uploadStatus = false
          this.showMessage = true
          if (err) {
            this.message = `Error while uploading: ${err.message}`
            this.messageTimeout = 0
            this.messageColor = 'error'
          } else {
            this.message = 'Upload successful!'
            this.messageTimeout = 2000
            this.messageColor = 'info'
          }
        })
      }
    }
  }
})
</script>
