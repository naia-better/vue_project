import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import '../src/assets/fonts/iconfont.css'

// 导入 axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://vueshop.pixiv.download/api/private/v1/'
// 需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
// 通过 axios 请求拦截器添加 token,保证拥有获取数据的权限(在 Vue.prototype.$http = axios 之前)
axios.interceptors.request.use(config => {
  // 手动为 header添加 携带Authorization的token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须返回 config,固定写法
  return config
})
// 将 axios 挂载到 Vue 的原型上,使每个组件都可以访问到 $http
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
