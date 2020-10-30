import _ from 'lodash'
import { GetterTree } from 'vuex'
import { IRootState } from '~/types/store'

export const getters: GetterTree<{}, IRootState> = {
    isDeployModeEnd: (_1, _2, _3, rootGetters) => {
        const battleRoom = rootGetters['battleRoom/battleRoom']
        if (!battleRoom) return false
        return rootGetters["helper/battleRoom/isHostOrGuest"] === 'host'
            ? battleRoom.host.isDeployModeEnd
            : battleRoom.guest.isDeployModeEnd
    },
    isHostAndGuestDeployModeEnd: (_1, _2, _3, rootGetters) => {
        const battleRoom = rootGetters['battleRoom/battleRoom']
        if (!battleRoom) return false
        return battleRoom.turn.number === 0 &&
            battleRoom.host.isDeployModeEnd &&
            battleRoom.guest.isDeployModeEnd
    },
}