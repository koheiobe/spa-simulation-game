import { GetterTree } from 'vuex'
import { HostOrGuest, IRootState } from '~/types/store'

export const getters: GetterTree<{}, IRootState> = {
  isHostOrGuest: (_1, _2, _3, rootGetters): HostOrGuest | '' => {
    return rootGetters['battleRoom/battleRoom']
      ? rootGetters['battleRoom/battleRoom'].host.uid ===
        rootGetters['user/getUser'].uid
        ? 'host'
        : 'guest'
      : ''
  },
  isMyTurn: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['battleRoom/battleRoom']
      ? rootGetters['battleRoom/battleRoom'].turn.uid ===
      rootGetters['user/getUser'].uid
      : false
  }
}
