<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统/span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
        <!-- 动态的实现侧边栏的展开与折叠，绑定iscollapse来解决，通过改变 宽 来实现 -->
      <el-aside :width="iscollapse ? '64px' : '200px'" >
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
         <el-menu
            background-color="#212121"
            text-color="#fff"
            active-text-color="#2C79FC"
            unique-opened :collapse="iscollapse"
            :collapse-transition="false"
            router
            :default-active="activePath"> // router 为每个二级菜单开启路由跳转
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
              <!-- 每一个菜单栏，都应该有一个独属于自己的 index值，这样展开就不会影响其他菜单栏了。注意：只接受字符串 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文字 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
                  <!-- :index="'/'+ subItem.path" 当作跳转地址。注意：需要手动加 / -->
              <el-menu-item :index="'/'+ subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+ subItem.path)">
                <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文字 -->
                <span>{{subItem.authName}}</span>
              </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
      </el-aside>
      <!-- 右侧主题区域 -->
      <el-main>
        <!-- 路由的占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      // 每个侧边栏的图标
      iconsObj: {
        // eslint-disable-next-line quote-props
        '125': 'iconfont icon-users',
        // eslint-disable-next-line quote-props
        '103': 'iconfont icon-tijikongjian',
        // eslint-disable-next-line quote-props
        '101': 'iconfont icon-shangpin',
        // eslint-disable-next-line quote-props
        '102': 'iconfont icon-danju',
        // eslint-disable-next-line quote-props
        '145': 'iconfont icon-baobiao'
      },
      // 侧边栏的展开与折叠
      iscollapse: false,
      activePath: ''
    }
  },
  // 在页面刚一加载的时候,就应该显示出侧边栏信息
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出功能的实现原理：基于 token的方式实现退出比较简单，只需要销毁本地的 token 即可，这样后续的请求就不会携带 token，必须重新登录生成一个新的 token 才可以访问
    logout () {
      // 清空 token
      window.sessionStorage.clear()
      // 强制跳转到登录界面
      this.$router.push('/login')
    },
    // 获取菜单列表数据
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      console.log(res)
      this.menulist = res.data
      // console.log(this.menulist)
    },
    // 点击按钮，实现侧边栏的折叠与展开
    toggleCollapse () {
      this.iscollapse = !this.iscollapse
    },
    // 保存激活的二级菜单的链接状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      // 解决用户列表一开始没有被激活的bug
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #282C34;
  display: flex;
  // 左右贴边
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  .el-button {
    border-radius: 10px;
  }
  > div {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 20px;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #212121;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #DCDCDC;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #353A44;
  font-size: 10px;
  text-align: center;
  line-height: 24px;
  color: #fff;
  // 让|||之间有间距
  letter-spacing: 0.2rem;
  // 鼠标放上去变成小手
  cursor: pointer;
}
</style>
