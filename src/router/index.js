import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue';  
import Users from '../pages/Users.vue';
import Signin from '../pages/Signin.vue';
import Account from '../pages/Account.vue';
import {jwtDecode} from "jwt-decode";
import { tr } from 'zod/v4/locales';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/users', component: Users, meta: { requiresAuth: true } },
  { path: '/signin', component: Signin },
  { path: '/account/:id', component: Account, meta: { requiresAuth: true }}
];

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (token){
    try {
      const decoded = jwtDecode(token);
      const now = Date.now()/1000;
      if(decoded.exp && decoded.exp < now){
        localStorage.removeItem("token");
        next("/signin");
        return;
      }
    } catch (error) {
      localStorage.removeItem("token");
      next("/signin");
      return;
    }
  }
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
