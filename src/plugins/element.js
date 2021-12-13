import Vue from 'vue'
import { Button, Form, FormItem, Input, Message, Container, Aside, Main, Header, Menu, Submenu, MenuItemGroup, MenuItem } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Header)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)

// 需要全局挂载到 vue的原型上
Vue.prototype.$message = Message
