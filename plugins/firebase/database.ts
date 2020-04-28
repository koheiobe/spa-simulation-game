import { Plugin } from '@nuxt/types'
import firebase from './firebase'
import { ICharacter, IBattleRoom } from '~/types/store'

const db = firebase.firestore()

class Firestore {
  // #region user

  getUser(uid: string) {
    return db.collection('users').doc(uid)
  }

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
      roomId: string
      uid: string
    }
  ) {
    return db
      .collection('users')
      .doc(uid)
      .set(user)
  }

  // #endregion user

  // #region online battle room
  getBattleRoomsRef() {
    return db.collection('battles')
  }

  getBattleRoomRef(id: string) {
    return db.collection('battles').doc(id)
  }

  createBattleRoom(uid: string, name: string) {
    const battleRoom: IBattleRoom = {
      host: { uid, name },
      guest: { uid: '', name: '' },
      winnerUid: ''
    }
    return db.collection('battles').add(battleRoom)
  }

  deleteBattleRoom(battleId: string): Promise<void> {
    // TODO battleRoom内のcharacters collectionが削除できない！
    // collection内のdocを１つずつ削除するか、cloudFunctionを使って
    // まとめて削除する
    return db
      .collection('battles')
      .doc(battleId)
      .delete()
  }

  setUserBattleId(uid: string, battleId: string) {
    db.collection('users')
      .doc(uid)
      .set({ battleId }, { merge: true })
  }

  deleteUserBattleId(uid: string) {
    db.collection('users')
      .doc(uid)
      .update({
        battleId: firebase.firestore.FieldValue.delete()
      })
  }

  setBattleRoomGuest(userInfo: {
    uid: string
    name: string
    battleId: string
  }) {
    db.collection('battles')
      .doc(userInfo.battleId)
      .update({
        guest: {
          name: userInfo.name,
          uid: userInfo.uid
        }
      })
  }

  setBattleRoomWinner(battleRoomInfo: { id: string; winnerUid: string }) {
    db.collection('battles')
      .doc(battleRoomInfo.id)
      .update({ winnerUid: battleRoomInfo.winnerUid })
  }

  async isBattleRoomExist(battleId: string): Promise<boolean> {
    const battleRoom = await db
      .collection('battles')
      .doc(battleId)
      .get()
    return battleRoom.exists
  }
  // #endregion online battle room

  // #region online battle

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

  updateCharacter(battleId: string, character: ICharacter) {
    return db
      .collection('battles')
      .doc(battleId)
      .collection('characters')
      .doc(character.id)
      .set(character, { merge: true })
  }

  getCharactersRef = (battleId: string) => {
    return db
      .collection('battles')
      .doc(battleId)
      .collection('characters')
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
