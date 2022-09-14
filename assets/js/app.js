import Vue from 'vue';

import App from './components/App.vue';

import Vuesax from 'vuesax';

import 'vuesax/dist/vuesax.css'; //Vuesax styles

Vue.use(Vuesax, {
  // options here
});

const app = new Vue({
  el: '#app',
  render: (createElement) => createElement(App),
});
