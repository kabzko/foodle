import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.scss';

import { stores, favourites, products, carts, orders } from './initialDatas';

const app = createApp(App)
  .use(IonicVue)
  .use(router);

router.beforeEach((to, from, next) => {
  localStorage.setItem('stores', JSON.stringify(stores));
  localStorage.setItem('products', JSON.stringify(products));
  if (typeof localStorage.orders === 'undefined') {
    localStorage.setItem('orders', JSON.stringify(orders));
  }
  if (typeof localStorage.carts === 'undefined') {
    localStorage.setItem('carts', JSON.stringify(carts));
  }
  if (typeof localStorage.favourites === 'undefined') {
    localStorage.setItem('favourites', JSON.stringify(favourites));
  }
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    next();
  } else {
    next();
  }
});

router.isReady().then(() => {
  app.mount('#app');
});
