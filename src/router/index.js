import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/home' },
  // {
  //   path: '/home',
  //   component: () => import('../components/Home.vue'),
  //   redirect: '/home/welcome',
  //   children: [
  //     {
  //       path: '/home/welcome',
  //       component: () => import('../components/Main.vue')
  //     }
  //   ]
  // },
  {
    path: '/home',
    component: () => import('../components/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: () => import('../components/Main.vue')
      },
      {
        path: '/users',
        component: () => import('../components/user/Users.vue')
      },
      {
        path: '/roles',
        component: () => import('../components/power/Roles.vue')
      },
      {
        path: '/rights',
        component: () => import('../components/power/Rights.vue')
      },
      {
        path: '/goods',
        component: () => import('../components/goods/List.vue')
      },
      {
        path: '/goods/add',
        component: () => import('../components/goods/Add.vue')
      },
      {
        path: '/categories',
        component: () => import('../components/goods/Cate.vue')
      },
      {
        path: '/params',
        component: () => import('../components/goods/Params.vue')
      },
      {
        path: '/orders',
        component: () => import('../components/order/Order.vue')
      },
      {
        path: '/reports',
        component: () => import('../components/report/Report.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('../components/Login.vue')
  }
];

const router = new VueRouter({
  routes
});
// 为路由对象添加导航守卫，to 去哪个路径，from 从哪来，next 去哪
router.beforeEach((to, form, next) => {
  if (to.path === '/login') return next();

  const token = window.sessionStorage.getItem('token');
  if (!token) return next('/login');
  next();
});

export default router;
