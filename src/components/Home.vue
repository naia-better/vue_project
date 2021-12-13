<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>xxxxx</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <!-- 侧边栏菜单区域 -->
         <el-menu
            background-color="#7AB3FF"
            text-color="#fff"
            active-text-color="#ffd04b">
            <!-- 一级菜单 -->
            <el-submenu index="1">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-location"></i>
                <!-- 文字 -->
                <span>导航一</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item index="1-1">
                <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-location"></i>
                <!-- 文字 -->
                <span>导航一</span>
              </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
      </el-aside>
      <!-- 右侧主题区域 -->
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  // 在页面刚一加载的时候,就应该显示出侧边栏信息
  created () {
    this.getMenuList()
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
      // if (res.meta.satus !== 200) return this.$message.error(('获取数据失败!'))
      console.log(res)
      // this.$message.success('获取数据成功!')
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #417CFE;
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
  background-color: #7AB3FF;
}
.el-main {
  background-color: #DCDCDC;
}
</style>
