import firebase from '~/plugins/firebase'

const db = firebase.firestore()

export const getUser = (uid: string) => db.collection('users').doc(uid)

export const isLoginUserExists = async (uid: string) => {
  const user = await db
    .collection('users')
    .doc(uid)
    .get()

  return user.exists
}
export const setLoginUser = (
  uid: string,
  user: {
    name: string
    battleId: string
    roomId: string
  }
) =>
  db
    .collection('users')
    .doc(uid)
    .set(user)
