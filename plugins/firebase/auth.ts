import { Plugin } from '@nuxt/types'
import firebase from '~/plugins/firebase'

class FirebaseAuth {
  createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          resolve(userCredential)
        })
        .catch(function(error) {
          console.error(
            '新規ユーザー作成に失敗しました。',
            error.code,
            error.message
          )
          reject(error)
        })
    })
  }

  signIn(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    return new Promise((resolve, reject) => {
      return firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          resolve(userCredential)
        })
        .catch((error) => {
          console.error('サインインに失敗しました。', error)
          reject(error)
        })
    })
  }

  deleteAccount() {
    const user = firebase.auth().currentUser
    console.log(user)
    if (user === null) return
    user
      .delete()
      .then(function() {
        // User deleted.
      })
      .catch(function(error) {
        // An error happened.
        console.error(error)
      })
  }

  onAuthStateChanged(func: (user: firebase.User | null) => void) {
    firebase.auth().onAuthStateChanged((user) => {
      func(user)
    })
  }

  signOut() {
    return firebase.auth().signOut()
  }

  // currentUser = (): firebase.User | null => {
  //   return firebase.auth().currentUser
  // }

  currentUser() {
    return firebase.auth().currentUser
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $auth: FirebaseAuth
  }
}

const firebaseAuth: Plugin = (_, inject) => {
  inject('auth', new FirebaseAuth())
}

export default firebaseAuth
