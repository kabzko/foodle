<template>
  <ion-page>
    <header class="grid">
      <div class="col-1">
        <ion-menu-button autoHide="false" color="primary"></ion-menu-button>
      </div>
      <div class="col-2">
        <ion-title> </ion-title>
      </div>
      <div class="col-3">
        <ion-buttons>
          <ion-button router-link="/cart">
            <ion-icon slot="icon-only" :icon="bagOutline" color="primary"></ion-icon>
          </ion-button>
          <ion-badge v-if="Cart != ''" color="primary">{{ Cart }}</ion-badge>
        </ion-buttons>
      </div>
    </header>

    <ion-content>
      <router-link :to="{ name: 'SearchShoRes' }">
        <ion-searchbar placeholder="Search shops & restaurants" disabled></ion-searchbar>
      </router-link>
      <div class="offers-sliders" v-if="NearMeList?.length != 0">
        <ion-grid>
          <ion-row class="offers-title">
            <ion-col class="slide-title">Near Me</ion-col>
            <ion-col>
              <router-link :to="{ name: 'Stores', params: { type: 'nearme' } }">View all</router-link>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-slides pages="false" :options="slideOpts">
          <ion-slide v-for="near of NearMeList" v-bind:key="near.id">
            <router-link :to="{ name: 'Store', params: { storeid: near.id } }">
              <div class="store-container">
                <div>
                  <img :src="near.storethumbnail" />
                </div>
                <div class="store-name">
                  {{ near.name }}
                </div>
              </div>
            </router-link>
          </ion-slide>
        </ion-slides>
      </div>
      <div class="offers-sliders" v-if="UserID != '' && Favourites.length != 0">
        <ion-grid>
          <ion-row class="offers-title">
            <ion-col>My Favourites</ion-col>
            <ion-col>
              <router-link :to="{ name: 'Stores', params: { type: 'favourite' } }">View all</router-link>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-slides pages="false" :options="slideOpts">
          <ion-slide v-for="favourite of Favourites" v-bind:key="favourite.id">
            <router-link :to="{ name: 'Store', params: { storeid: favourite.id } }">
              <div class="store-container">
                <div>
                  <img :src="favourite.storethumbnail" />
                </div>
                <div class="store-name">
                  {{ favourite.name }}
                </div>
              </div>
            </router-link>
          </ion-slide>
        </ion-slides>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonContent,
  IonPage,
  IonTitle,
  IonSearchbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonSlide,
  IonSlides,
  alertController,
} from '@ionic/vue';
import { bagOutline } from 'ionicons/icons';

import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonPage,
    IonTitle,
    IonSearchbar,
    IonIcon,
    IonButtons,
    IonButton,
    IonMenuButton,
    IonSlide,
    IonSlides,
  },
  setup() {
    const slideOpts = {
      // spaceBetween: 10,
      slidesPerView: 3,
      freeMode: true,
    };
    return {
      slideOpts,
      bagOutline,
    };
  },
  data() {
    return {
      NearMeList: [],
      Favourites: [],
      UserID: '',
      Cart: '0',
    };
  },
  created() {
    if (typeof localStorage.users !== 'undefined') {
      this.UserID = JSON.parse(localStorage.users)[0].id;
    }
  },
  ionViewWillEnter() {
    if (this.NearMeList.length == 0) {
      this.LoadHome();
    } else {
      this.Reload();
    }
  },
  methods: {
    LoadHome() {
      Global.methods.Loading();
      if (typeof localStorage.carts !== 'undefined') {
        let carts = JSON.parse(localStorage.carts);
        this.Cart = carts.filter((x) => x.userid == this.UserID).length.toString();
      }
      this.NearMeList = [];
      this.Favourites = [];
      setTimeout(() => {
        if (typeof localStorage.stores !== 'undefined') {
          this.NearMeList = JSON.parse(localStorage.stores);
        }
        if (typeof localStorage.favourites !== 'undefined') {
          let favourites = JSON.parse(localStorage.favourites);
          for (let favourite of favourites) {
            let store = this.NearMeList.find((x) => x.id == favourite.storeid && x.userid == this.UserID);
            if (store) {
              this.Favourites.push(store);
            }
          }
        }
        Global.methods.Unloading();
      }, 250);
    },
    Reload() {
      if (typeof localStorage.carts !== 'undefined') {
        let carts = JSON.parse(localStorage.carts);
        this.Cart = carts.filter((x) => x.userid == this.UserID).length.toString();
      }
      this.NearMeList = [];
      this.Favourites = [];
      if (typeof localStorage.stores !== 'undefined') {
        this.NearMeList = JSON.parse(localStorage.stores);
      }
      setTimeout(() => {
        if (typeof localStorage.favourites !== 'undefined') {
          let favourites = JSON.parse(localStorage.favourites);
          for (let favourite of favourites) {
            let store = this.NearMeList.find((x) => x.id == favourite.storeid && x.userid == this.UserID);
            if (store) {
              this.Favourites.push(store);
            }
          }
        }
      }, 250);
    },
    async ChangeAddress() {
      const alert = await alertController.create({
        cssClass: 'my-custom-class',
        message: 'Do you wish to change your location?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Yes',
            handler: () => {
              this.$router.push({ name: 'Coordinator' });
            },
          },
        ],
      });
      await alert.present();
    },
  },
};
</script>

<style lang="scss" scoped>
.divslides {
  margin: 10px;
}
img {
  border-radius: 7px;
  display: block;
}
.offers-sliders {
  margin: 15px 10px;
}
.sc-ion-searchbar-md-h {
  margin: 15px 0 !important;
  padding: 0 10px !important;
}
.searchbar-disabled.sc-ion-searchbar-md-h {
  opacity: 1 !important;
}
ion-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 10px;
  --padding-top: 3px !important;
  --padding-bottom: 2px !important;
  --padding-start: 4px !important;
  --padding-end: 4px !important;
}
.close-text {
  width: 26vw;
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 5px;
  padding: 5px;
  font-size: 3vw;
  text-align: center;
  font-weight: 600;
}
ion-grid {
  ion-row:nth-child(1) ion-col:nth-child(1) {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }
  ion-row:nth-child(1) ion-col:nth-child(2) {
    display: flex;
    align-items: center;
    justify-content: flex-end !important;
  }
}
.store-container {
  margin: 0 5px;
  width: 29vw;
}
.store-name {
  color: black;
  margin-top: 5px;
  font-size: 14px;
  height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
