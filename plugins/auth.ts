import firebase from '~/plugins/firebase'

export const createUserWithEmailAndPassword = (
  email: string,
  password: string
): Promise<firebase.auth.UserCredential> => {
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

export const signIn = (
  email: string,
  password: string
): Promise<firebase.auth.UserCredential> => {
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

export const deleteAccount = () => {
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

export const onAuthStateChanged = (
  func: (user: firebase.User | null) => void
) => {
  firebase.auth().onAuthStateChanged((user) => {
    func(user)
  })
}

export const signOut = () => {
  return firebase.auth().signOut()
}

// export const currentUser = (): firebase.User | null => {
//   return firebase.auth().currentUser
// }

export const currentUser = firebase.auth().currentUser
