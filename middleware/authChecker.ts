import { Middleware } from '@nuxt/types'

const authChecker: Middleware = ({ route, store, redirect }) => {
  // オンライン対戦機能はログインしていなければ使用できない
  if (
    /\/battle\/online.*/.test(route.path) &&
    (store.state.user.loginUser.uid === undefined ||
      store.state.user.loginUser.uid.length <= 0)
  ) {
    redirect('/')
  }
}

export default authChecker
