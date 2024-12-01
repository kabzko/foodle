<template>
  <ion-app>
    <ion-menu content-id="main" type="overlay" swipeGesture="false">
      <ion-content>
        <ion-list>
          <ion-list-header v-if="UserID != ''">{{ Name }}</ion-list-header>
          <ion-menu-toggle auto-hide="false">
            <ion-item button lines="none" router-link="/orders" v-if="UserID != ''">Orders</ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle auto-hide="false">
            <ion-item button lines="none" router-link="/helpcenter" v-if="UserID != ''">Help Center</ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle auto-hide="false" @click="Logout()">
            <ion-item button lines="none" v-if="UserID != ''">Log out</ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle auto-hide="false" @click="LoginCreate()">
            <ion-item button class="login-btn" lines="none" v-if="UserID == ''">Login / Create Account</ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main"></ion-router-outlet>
  </ion-app>
</template>

<script>
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonMenuToggle,
  IonItem,
  menuController,
} from '@ionic/vue';
import Global from './components/Global.vue';

export default {
  components: {
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonItem,
  },
  async created() {
    if (typeof localStorage.users !== 'undefined') {
      this.UserID = JSON.parse(localStorage.users)[0].id;
      this.Name = JSON.parse(localStorage.users)[0].firstname + ' ' + JSON.parse(localStorage.users)[0].lastname;
    }
  },
  data() {
    return {
      UserID: '',
      Name: '',
    };
  },
  methods: {
    async LoginCreate() {
      this.$router.push({ name: 'Verify' });
    },
    Logout() {
      menuController.close();
      Global.methods.Loading();
      localStorage.removeItem('users');
      setTimeout(() => {
        Global.methods.Unloading();
        location.reload();
      }, 1000);
    },
  },
};
</script>

<style scoped>
ion-list {
  padding: 20px 10px;
}
ion-list-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-primary);
}
.login-btn {
  font-size: 18px;
  font-weight: 600;
  --color: var(--ion-color-primary);
  --color-hover: var(--ion-color-primary-tint) !important;
}
</style>
