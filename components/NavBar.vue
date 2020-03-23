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
            <em>User</em>
          </template>
          <b-dropdown-item href="#">Profile</b-dropdown-item>
          <b-dropdown-item href="#">Sign Out</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import * as auth from '~/plugins/auth'

@Component
export default class NavBar extends Vue {
  async mounted() {
    const user = await auth.getCurrentLoginUser()
    console.log(user)
    // ログインしてなかったらログイン画面へ
    if (!user) {
      this.logout()
      return null
    }
    // ユーザーemailが存在しなければゲストとして一時的にログインさせる
    if (user.email === '' || user.email === null) {
      // this.setLoginUser({
      //   name: 'Guest',
      //   email: ''
      // })
      return null
    }
  }

  logout() {
    auth.logout().then(() => this.$router.push('/'))
  }
}
</script>

<style module>
.header {
  background-color: transparent;
}
</style>
