<template>
  <div class="login">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/avatar.jpeg" alt="avatar" />
      </div>
      <el-form
        ref="loginForm"
        :rules="loginFormRules"
        :model="loginForm"
        class="login_form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <!-- prefix-icon="el-icon-user iconfont icon-user" -->
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
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
  name: 'login',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    resetLoginForm() {
      this.$refs.loginForm.resetFields();
    },
    login() {
      // 表单预验证
      this.$refs.loginForm.validate(async valid => {
        // console.log(valid);
        if (!valid) return;
        const res = await this.$http.post('login', this.loginForm);
        // if (res.meta.status !== 200) {
        //   return this.$message.error('登录失败');
        // }
        // admin 123456
        // this.$message.success('登录成功');
        // 将登录成功后的 token 保存到客户端的 sessionStorage 里
        // 项目中其他 api 必须登录之后才能访问
        // token 只应在当前网站打开期间生效，所以 token 保存在 sessionStorage 中

        if (!res.data) return;
        this.$message.success(res.meta.msg);
        window.sessionStorage.setItem('token', res.data.token);

        this.$router.push('/home');
      });
    }
  }
};
</script>

<style lang="stylus" scoped>
.login
  width: 100%
  height: 100%
  background-color: #2b4b6b
  .login_box
    width: 450px
    height: 300px
    background-color: #fff
    border-radius: 3px
    position: absolute
    left: 50%
    top: 50%
    // margin-left -225px
    // margin-top -150px
    transform: translate(-50%, -50%)
    position: relative
    .avatar_box
      position: absolute
      box-sizing: border-box
      left: 50%
      top: -65px
      transform: translateX(-50%)
      padding: 5px
      width: 130px
      height: 130px
      border: 1px solid #eee
      border-radius: 50%
      box-shadow: 0 0 10px #999
      background-color: #fff
      img
        width: 100%
        height: 100%
        border-radius: 50%
    .login_form
      position: absolute
      left: 50px
      right: 50px
      bottom: 0
      .btns
        display: flex
        justify-content: flex-end
</style>
