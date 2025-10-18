import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue';  
import Users from '../pages/Users.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/users', component: Users }   // new route
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
