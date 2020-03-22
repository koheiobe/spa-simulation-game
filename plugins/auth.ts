import firebase from '~/plugins/firebase'

export function getCurrentLoginUser() {
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
      resolve(user || false)
    })
  })
}

export function logout() {
  return firebase.auth().signOut()
}
