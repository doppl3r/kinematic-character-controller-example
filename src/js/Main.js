import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from '../vue/App.vue'
import i18n from './i18n.js';
import Routes from './Routes.js'

/*
  Router history modes
  - createWebHashHistory: #/home
  - createWebHistory: /home
  - createMemoryHistory: /home

  createWebHashHistory works great with Electron because it expects
  an index.html file, allowing /index.html#/home to work.
*/

const router = createRouter({
  history: createWebHashHistory(),
  routes: Routes
});

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mount('#app');