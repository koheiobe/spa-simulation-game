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

// battle
export const initDBCharacters = (
  userId: string,
  battleId: string,
  characters: ICharacter[]
) => {
  const batch = db.batch()
  const battleCharacterRef = db
    .collection('battles')
    .doc(battleId)
    .collection(userId)
  if (characters.length === 0) return
  characters.forEach((character) => {
    batch.set(battleCharacterRef.doc(String(character.id)), {
      name: character.name,
      hp: character.hp,
      attack: character.attackPoint,
      defense: character.defense,
      critical: character.critical,
      luck: character.luck,
      speed: character.speed,
      level: character.level,
      moveDistance: character.moveDistance,
      id: character.id,
      latLng: character.latLng,
      lastLatLng: character.lastLatLng,
      actionState: character.actionState
    })
  })
  try {
    batch.commit()
  } catch (e) {
    console.error('firestoreの初期化に失敗しました', e)
  }
}

export const getCharactersRef = (battleId: string, userId: string) => {
  return db
    .collection('battles')
    .doc(battleId)
    .collection(userId)
}
