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
// 将 axios 挂载到 Vue 的原型上,使每个组件都可以访问到 $http
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
