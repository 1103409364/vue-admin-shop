import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('../components/Home.vue') },
  { path: '/login', component: () => import('../components/Login.vue') }
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
