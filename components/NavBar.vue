<template>
  <div>
    <b-navbar toggleable="lg" :class="$style.header">
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown text="Lang" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#">ES</b-dropdown-item>
          <b-dropdown-item href="#">RU</b-dropdown-item>
          <b-dropdown-item href="#">FA</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em>{{ userName }}</em>
          </template>
          <b-dropdown-item href="#">Profile</b-dropdown-item>
          <b-dropdown-item v-if="user !== null" @click="signOut"
            >Sign Out</b-dropdown-item
          >
          <b-dropdown-item v-else @click="signIn">Sign In</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import * as db from '~/plugins/database'
import { IUser } from '~/types/store'

const ItemModule = namespace('user')

@Component
export default class NavBar extends Vue {
  @ItemModule.Getter('getUser')
  private getStoreUser!: IUser

  public user: firebase.User | null = null

  get userName() {
    return this.getStoreUser && this.getStoreUser.name
  }

  mounted() {
    this.$auth.onAuthStateChanged((user) => {
      this.user = user
      if (user) {
        this.syncFirestoreVuex(user.uid)
      } else {
        this.$store.dispatch('user/setUserAsGuest')
      }
    })
  }

  signOut() {
    this.$auth.signOut().then(() => this.$router.push('/'))
  }

  signIn() {
    this.$router.push('/login')
  }

  syncFirestoreVuex(uid: string) {
    this.$store.dispatch('user/setUserRef', db.getUser(uid))
  }
}
</script>

<style module>
.header {
  background-color: transparent;
}
</style>
