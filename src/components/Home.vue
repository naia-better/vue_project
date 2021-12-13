<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 退出功能的实现原理：基于 token的方式实现退出比较简单，只需要销毁本地的 token 即可，这样后续的请求就不会携带 token，必须重新登录生成一个新的 token 才可以访问
    logout () {
      // 清空 token
      window.sessionStorage.clear()
      // 强制跳转到登录界面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
