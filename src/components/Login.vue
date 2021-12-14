<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 实现登录表单的重置,需要给先表单定义 ref="loginFormRef"
    resetLoginForm () {
      // console.log(this)
      // 这个重置函数在element-ui中有定义,直接使用 resetFields
      this.$refs.loginFormRef.resetFields()
    },
    // 表单登录前的预验证
    login () {
      this.$refs.loginFormRef.validate(async vaild => {
        // vaild 返回的是一个布尔值
        // console.log(vaild)
        if (!vaild) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error(('登录失败!'))
        this.$message.success('登录成功!')
        // console.log(res)
        // 1. 将登录成功的 Token 保存到 sessionStorage 中
        //   1.1 项目中除了登录之外的其他API,必须在登录之后才能访问
        //   1.2 token 只应该在当前网站打开期间有效,所以存储在 sessionStorage(会话级别)
        // 2. 通过编程式导航跳转到后台主页,路由地址式 /home
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
  height: 100%;
  background-color: #2b4b6b;
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    // 实现一个盒子垂直居中
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar_box{
      // z-index: 999;
      width: 130px;
      height: 130px;
      border: 1px solid rgb(121, 73, 45);
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 15px rgb(54, 52, 52);
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
}
.btns{
  display: flex;
  justify-content: flex-end;
}
.login_form{
  position: absolute;
  bottom: 0;
  padding: 0 20px;
  width: 100%;
  // 表单区域如果超出，可用 box-sizing: border-box;
  box-sizing: border-box;
}
</style>
// 解决版本过高不兼容的情况在命令行上以管理员身份输入npm install less@3.9.0 less-loader@4.1.0 --save-dev
