<template>
  <!-- element ui 第四个布局容器 -->
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>电商管理后台</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-menu" @click="toogleCollapse">
          <i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div>
        <!--unique-opened 只展开一个，collapse 折叠，collapse-transition 折叠动画，
        router 为真开启路由菜单模式，跳转到菜单绑定的 index -->
        <el-menu
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          default-active="2"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409bff"
        >
          <!-- 一级 index 区分一级菜单，值为字符串-->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconsList[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <i class="el-icon-menu"></i>
              <span>{{ subItem.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsList: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠菜单
      isCollapse: false
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    // 获取权限菜单
    async getMenuLIst() {
      const res = await this.$http.get('menus');
      console.log(res);
      this.menuList = res.data;
    },
    toogleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    handleOpen() {},
    handleClose() {}
  },
  created() {
    this.getMenuLIst();
  }
};
</script>

<style lang="stylus" scoped>
.home-container
  height: 100%
.el-header
  padding-left 10px
  background-color: #373d41
  display: flex
  justify-content: space-between
  align-items: center
  color: #fff
  line-height 60px
  img
    width: 50px
.el-aside
  background-color: #333744
  .el-menu
    border-right none
.el-main
  background-color: #eaedf1
.iconfont
  margin-right 10px
.toggle-menu
  background-color #4a5064
  font-size 16px
  line-height 30px
  text-align center
  letter-spacing .2em
  cursor pointer
  color #fff
</style>
