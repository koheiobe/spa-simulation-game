import Vue from 'vue'

declare module '*.vue' {
  export default Vue
}

// nuxtのconsole上でbvToastのエラーが出てしまうため定義。
declare module 'vue/types/vue' {
  interface Vue {
    $bvToast: any
  }
}
