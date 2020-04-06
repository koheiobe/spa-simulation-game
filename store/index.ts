import { vuexfireMutations } from 'vuexfire'

export const state = () => ({
  version: '1.0.0'
})

export const mutations = {
  ...vuexfireMutations
}
