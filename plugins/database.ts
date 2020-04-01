import firebase from '~/plugins/firebase'
import { ICharacter } from '~/types/store'

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

// online battle
export const getBattleRooms = {}
export const createBattleRoom = () => {
  db.collection('battles').doc(battleId)
}
export const updateCharacters = (
  battleId: string,
  characters: ICharacter[]
) => {
  const batch = db.batch()
  const battleCharacterRef = db
    .collection('battles')
    .doc(battleId)
    .collection('characters')
  if (characters.length === 0) return
  characters.forEach((character) => {
    batch.set(
      battleCharacterRef.doc(String(character.id)),
      {
        ...character
      },
      { merge: true }
    )
  })
  try {
    batch.commit()
  } catch (e) {
    console.error('firestoreの初期化に失敗しました', e)
  }
}

export const getCharactersRef = (battleId: string) => {
  return db
    .collection('battles')
    .doc(battleId)
    .collection('characters')
}

export const updateCharacter = (battleId: string, character: ICharacter) => {
  return db
    .collection('battles')
    .doc(battleId)
    .collection('characters')
    .doc(character.id)
    .set(character, { merge: true })
}
