import firebase from '~/plugins/firebase'

export function getCurrentLoginUser(): Promise<firebase.User | null> {
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
      resolve(user)
    })
  })
}

export function logout() {
  return firebase.auth().signOut()
}
