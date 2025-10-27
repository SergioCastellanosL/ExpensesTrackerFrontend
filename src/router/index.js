import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue';  
import Users from '../pages/Users.vue';
import Signin from '../pages/Signin.vue';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/users', component: Users, meta: { requiresAuth: true } },
  { path: '/signin', component: Signin }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/signin");
    return;
  }

  if (to.path === "/signin" && token) {
    next("/");
    return;
  }

  next();
});

export default router
