import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import '../src/assets/fonts/iconfont.css'
// 导入vue-table-with-tree-grid
import TableTree from 'vue-table-with-tree-grid'
// 导入富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入 nprogress 包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入 axios
import axios from 'axios'

// 配置请求的根路径
// axios.defaults.baseURL = 'http://vueshop.pixiv.download/api/private/v1/'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
// 通过 axios 请求拦截器添加 token,保证拥有获取数据的权限(在 Vue.prototype.$http = axios 之前)
// 在 request 拦截器中展示进度条 NProgress.start();
axios.interceptors.request.use(config => {
  NProgress.start()
  // 手动为 header添加 携带Authorization的token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须返回 config,固定写法
  return config
})
// 在 response 拦截器中,隐藏进度条 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
// 将 axios 挂载到 Vue 的原型上,使每个组件都可以访问到 $http
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TableTree)

// 进行全局的挂载
Vue.use(VueQuillEditor)

// 定义一个格式化时间的全局过滤器
Vue.filter('dateFormat', function (originValue) {
  const dt = new Date(originValue)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
