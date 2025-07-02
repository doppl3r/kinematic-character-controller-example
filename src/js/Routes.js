import PageKinematic from '../vue/PageKinematic.vue'

/*
  Vue Router is used to change page components using URL paths. This solution 
  reduces the need for multiple v-if conditions in the App.vue file.

  Usage: See Main.js file
*/

export default [
  {
    name: 'home',
    path: '/',
    redirect: '/kinematic'
  },
  {
    name: 'kinematic',
    path: '/kinematic',
    component: PageKinematic
  }
];