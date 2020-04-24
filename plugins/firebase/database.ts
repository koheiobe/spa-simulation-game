import { Plugin } from '@nuxt/types'
import firebase from './firebase'
import { ICharacter } from '~/types/store'

const db = firebase.firestore()

class Firestore {
  getUser(uid: string) {
    return db.collection('users').doc(uid)
  }

  // #region Login
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

  // #endregion Login

  // #region online battle
  getBattleRoomsRef() {
    return db.collection('battles')
  }

  createBattleRoom(uid: string, name: string) {
    return db
      .collection('battles')
      .add({ host: { uid, name }, guest: { uid: '', name: '' } })
  }

  deleteBattleRoom(battleId: string): Promise<void> {
    console.log(battleId)
    return db
      .collection('battles')
      .doc(battleId)
      .delete()
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

  // #endregion online battle
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $firestore: Firestore
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
