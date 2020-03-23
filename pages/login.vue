<template>
  <div :class="$style.containerWrapper">
    <div :class="$style.container">
      <div id="firebaseui-auth-container"></div>
    </div>
  </div>
</template>

<script>
import * as firebaseui from 'firebaseui'
import firebase from '~/plugins/firebase'
import 'firebaseui/dist/firebaseui.css'

// 下記サイトを参考にしつつ、自前のログインuiを作成する
// 入力フォームは名前のみでOKの予定
// https://employment.en-japan.com/engineerhub/entry/2019/06/07/103000#Authentication
export default {
  layout: 'login',
  mounted() {
    const uiConfig = {
      signInSuccessUrl: '/',
      signInOptions: [
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    }

    const ui = new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', uiConfig)
  }
}
</script>

<style lang="scss" module>
.containerWrapper {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background-color: #efefef;

  .container {
    background-color: white;
  }
}
</style>
