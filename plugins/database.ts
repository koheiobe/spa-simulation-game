import firebase from '~/plugins/firebase'
import Character from '~/class/character/playableCharacter'

const db = firebase.firestore()

export const getUser = (uid: string) => db.collection('users').doc(uid)

// Login
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
    uid: string
  }
) =>
  db
    .collection('users')
    .doc(uid)
    .set(user)

// battle
export const initBattleCharacters = (
  userId: string,
  characters: Character[]
) => {
  const batch = db.batch()
  const battleCharacterRef = db
    .collection('battles')
    .doc()
    .collection(userId)
  characters.forEach((character) => {
    if (character === undefined) return

    batch.set(battleCharacterRef.doc(String(character.id)), {
      status: {
        attack: character.attackPoint
      }
    })
  })
  try {
    batch.commit()
  } catch (e) {
    console.error('firestoreの初期化に失敗しました', e)
  }
}
