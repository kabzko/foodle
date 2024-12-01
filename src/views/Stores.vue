<template>
  <ion-page>
    <header class="grid">
      <div class="col-1">
        <ion-back-button default-href="/" color="primary"></ion-back-button>
      </div>
      <div class="col-2">
        <ion-title>{{ Title }}</ion-title>
      </div>
      <div class="col-3"></div>
    </header>

    <ion-content>
      <ion-grid>
        <ion-row>
          <ion-col size="4" v-for="(store, index) of Stores" v-bind:key="store + index">
            <router-link :to="{ name: 'Store', params: { storeid: store.id } }">
              <div>
                <div>
                  <img :src="store.storethumbnail" />
                </div>
                <div class="store-name">
                  {{ store.name }}
                </div>
              </div>
            </router-link>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { useRoute } from 'vue-router';
import { IonContent, IonPage, IonTitle, IonBackButton } from '@ionic/vue';
import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonPage,
    IonTitle,
    IonBackButton,
  },
  setup() {
    const route = useRoute();
    const type = route.params.type;
    return {
      type,
    };
  },
  async created() {
    if (typeof localStorage.users !== 'undefined') {
      this.UserID = JSON.parse(localStorage.users)[0].id;
    }
    if (this.type == 'nearme') {
      this.Title = 'Near Me';
    } else {
      this.Title = 'My Favourites';
    }
    this.LoadStores();
  },
  data() {
    return {
      Stores: [],
      Title: '',
      UserID: '',
      CurrentTime: '',
    };
  },
  methods: {
    TimeFormat(time) {
      time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
      if (time.length > 1) {
        const timeparts = time.slice(1);
        const meridiem = timeparts[0] < 12 ? ' AM' : ' PM';
        return ('0' + (timeparts[0] % 12 || 12)).slice(-2) + timeparts[1] + timeparts[2] + meridiem;
      }
    },
    LoadStores() {
      Global.methods.Loading();
      setTimeout(() => {
        if (this.type == 'nearme') {
          if (typeof localStorage.stores !== 'undefined') {
            this.Stores = JSON.parse(localStorage.stores);
          }
        } else {
          if (typeof localStorage.stores !== 'undefined') {
            let stores = JSON.parse(localStorage.stores);
            let favourites = JSON.parse(localStorage.favourites);
            let favouriteIds = favourites.map((x) => x.storeid);
            this.Stores = stores.filter((store) => favouriteIds.includes(store.id));
          }
        }
        Global.methods.Unloading();
      }, 250);
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  border-radius: 7px;
  display: block;
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
.store-name {
  color: black;
  text-align: center;
  margin-top: 5px;
  font-size: 14px;
  height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
