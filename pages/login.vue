<template>
  <div :class="$style.containerWrapper">
    <div :class="$style.container">
      <b-form @submit="onSubmit">
        <b-form-group
          id="input-group-1"
          label="メールアドレス"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="email"
            type="email"
            required
            placeholder=""
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-2" label="パスワード" label-for="input-2">
          <b-form-input
            id="input-2"
            v-model="password"
            required
            placeholder=""
          ></b-form-input>
        </b-form-group>

        <b-form-group
          v-if="isCreateAccount"
          id="input-group-2"
          label="名前"
          label-for="input-2"
        >
          <b-form-input
            id="input-2"
            v-model="name"
            required
            placeholder=""
          ></b-form-input>
        </b-form-group>
        <div v-if="!isCreateAccount">
          <b-button type="submit" variant="primary">ログイン</b-button>
          <p>
            アカウントを作成する場合<a @click="toggleIsCreateAccount">こちら</a>
          </p>
        </div>
        <div v-if="isCreateAccount">
          <b-button type="submit" variant="primary">登録</b-button>
          <p>ログインする場合<a @click="toggleIsCreateAccount">こちら</a></p>
        </div>
        <p v-if="errorMessage" :class="$style.errorMessage">
          {{ errorMessage }}
        </p>
      </b-form>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import { isLoginUserExists, setLoginUser } from '~/plugins/database'

@Component({
  layout: 'login'
})
export default class Login extends Vue {
  public isCreateAccount: boolean = false
  public email: string = ''
  public password: string = ''
  public name: string = ''
  public errorMessage: string = ''

  toggleIsCreateAccount() {
    this.isCreateAccount = !this.isCreateAccount
  }

  async onSubmit(evt: any) {
    evt.preventDefault()
    const userCredential = this.isCreateAccount
      ? await this.$auth
          .createUserWithEmailAndPassword(this.email, this.password)
          .catch((err) => {
            this.onErrorAuth(err)
          })
      : await this.$auth.signIn(this.email, this.password).catch((err) => {
          this.onErrorAuth(err)
        })
    if (userCredential === undefined || userCredential.user === null) return
    const uid = userCredential.user.uid
    if ((await isLoginUserExists(uid)) === false) {
      console.log('running setLoginUser')
      setLoginUser(uid, {
        name: this.name,
        battleId: '',
        roomId: '',
        uid
      })
    }
    this.$router.push('/')
  }

  onErrorAuth(err: any) {
    switch (err.code) {
      case 'auth/user-not-found':
        this.errorMessage = 'アカウントが存在しません'
        break
      case 'auth/wrong-password':
        this.errorMessage = 'パスワードが違います'
        break
      case 'auth/email-already-in-use':
        this.errorMessage = 'メールアドレスがすでに使用されています'
        break
      case 'auth/weak-password':
        this.errorMessage = 'パスワードは6桁以上で設定してください'
        break
      default:
        this.errorMessage = `${
          this.isCreateAccount ? 'アカウント作成' : 'ログイン'
        }に失敗しました。管理者に連絡してください。`
    }
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
    padding: 16px;
    border-radius: 4px;

    p {
      font-size: 12px;
      a {
        color: blue;
        cursor: pointer;
      }
    }
  }

  .errorMessage {
    color: red;
  }
}
</style>
