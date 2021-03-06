<template>
  <div>
    <b-navbar toggleable="lg" :class="$style.header">
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em>{{ userName }}</em>
          </template>
          <b-dropdown-item v-if="user !== null" @click="signOut">Sign Out</b-dropdown-item>
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
    this.$auth.onAuthStateChanged(async (user) => {
      this.user = user
      if (user) {
        this.syncFirestoreVuex(user.uid)
      } else {
        try {
          const sessionUserJson = sessionStorage.getItem('user')
          if (sessionUserJson) {
            this.$store.commit('user/setUser', JSON.parse(sessionUserJson))
          } else {
            const guest = await this.$store.dispatch('user/setUserAsGuest')
            sessionStorage.setItem('user', JSON.stringify(guest))
          }
        } catch (e) {
          console.error(e)
          sessionStorage.removeItem('user')
        }
      }
    })
  }

  beforeDestroy() {
    sessionStorage.setItem('user', JSON.stringify(this.getStoreUser))
  }

  signOut() {
    this.$auth.signOut().then(() => this.$router.push('/'))
  }

  signIn() {
    this.$router.push('/login')
  }

  syncFirestoreVuex(uid: string) {
    this.$store.dispatch('user/setUserRef', this.$firestore.getUser(uid))
  }
}
</script>

<style module>
.header {
  background-color: transparent;
}
</style>
