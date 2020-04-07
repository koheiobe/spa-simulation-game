import { Plugin } from '@nuxt/types'
import firebase from '~/plugins/firebase'
import { ICharacter } from '~/types/store'

const db = firebase.firestore()

class Firestore {
  getUser(uid: string) {
    return db.collection('users').doc(uid)
  }

  // Login
  async isLoginUserExists(uid: string) {
    const user = await db
      .collection('users')
      .doc(uid)
      .get()

    return user.exists
  }

  setLoginUser(
    uid: string,
    user: {
      name: string
      battleId: string
      roomId: string
      uid: string
    }
  ) {
    return db
      .collection('users')
      .doc(uid)
      .set(user)
  }

  // online battle
  getBattleRooms() {
    return db.collection('battles')
  }

  createBattleRoom(uid: string, name: string) {
    return db
      .collection('battles')
      .add({ creater: { uid, name }, opponent: { uid: '', name: '' } })
  }

  setBattleId(uid: string, battleId: string) {
    db.collection('users')
      .doc(uid)
      .update({ battleId })
  }

  updateCharacters(battleId: string, characters: ICharacter[]) {
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

  getCharactersRef = (battleId: string) => {
    return db
      .collection('battles')
      .doc(battleId)
      .collection('characters')
  }

  updateCharacter(battleId: string, character: ICharacter) {
    return db
      .collection('battles')
      .doc(battleId)
      .collection('characters')
      .doc(character.id)
      .set(character, { merge: true })
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $firestore: Firestore
  }
}

const firestore: Plugin = (_, inject) => {
  inject('firestore', new Firestore())
}

export default firestore
