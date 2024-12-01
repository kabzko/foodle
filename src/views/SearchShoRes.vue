<template>
  <ion-page>
    <header class="grid">
      <div class="col-1">
        <ion-back-button default-href="/" color="primary"></ion-back-button>
      </div>
      <div class="col-2">
        <ion-searchbar
          ref="searchRef"
          v-on:keyup.enter="SearchUsingEnter()"
          v-model="Search"
          class="searchshores"
          placeholder="Search shops & restaurants"
          show-clear-button="always"
        ></ion-searchbar>
      </div>
      <div class="col-3"></div>
    </header>

    <ion-content>
      <div v-if="Status == false && Recent.length != 0">
        <ion-list>
          <ion-list-header>
            Recent searches
          </ion-list-header>
          <div @click.prevent="SearchRecent(recent)" class="recent-list" v-for="recent of Recent" v-bind:key="recent">
            <ion-grid>
              <ion-row>
                <ion-col>
                  <ion-icon :icon="timerOutline" color="primary"></ion-icon>
                  &nbsp;
                  <span>{{ recent }}</span>
                </ion-col>
                <ion-col class="ion-text-end">
                  <ion-icon @click.stop="RemoveRecent(recent)" :icon="closeOutline" color="primary"></ion-icon>
                </ion-col>
              </ion-row>
            </ion-grid>
          </div>
        </ion-list>
      </div>
      <div v-if="Status == true && Recent.length != 0">
        <ion-list>
          <ion-list-header> You search for "{{ Search }}" </ion-list-header>
          <div class="search-list">
            <ion-card v-for="store of Stores" v-bind:key="store" @click.prevent="GotoStore(store.id)">
              <div>
                <img :src="store.orderbanner" />
              </div>
              <div class="fav-button" @click.stop="FavouriteStore(store.id, store.favour, store.favouriteId)">
                <ion-icon v-if="store.favour == 0" :icon="heartOutline" color="danger"></ion-icon>
                <ion-icon v-else :icon="heart" color="danger"></ion-icon>
              </div>
              <ion-card-header>
                <ion-card-subtitle>{{ store.streets }}</ion-card-subtitle>
                <ion-card-title>{{ store.name }}</ion-card-title>
              </ion-card-header>
            </ion-card>
          </div>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonContent,
  IonPage,
  IonBackButton,
  IonIcon,
  IonSearchbar,
  IonList,
  IonListHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
} from '@ionic/vue';
import { closeOutline, timerOutline, heartOutline, heart } from 'ionicons/icons';
import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonPage,
    IonBackButton,
    IonIcon,
    IonSearchbar,
    IonList,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonListHeader,
  },
  setup() {
    return {
      closeOutline,
      timerOutline,
      heartOutline,
      heart,
    };
  },
  async created() {
    setTimeout(() => {
      this.$refs.searchRef.$el.setFocus();
    }, 100);
    if (typeof localStorage.users !== 'undefined') {
      this.UserID = JSON.parse(localStorage.users)[0].id;
    }
    if (localStorage.recent != undefined) {
      this.BackUpRecent = JSON.parse(localStorage.recent);
      this.Recent = this.BackUpRecent;
    }
  },
  data() {
    return {
      Recent: [],
      BackUpRecent: [],
      Stores: [],
      Mix: [],
      Status: false,
      Search: '',
      UserID: '',
    };
  },
  methods: {
    SearchShopsAndRestaurant() {
      if (this.Search != '') {
        if (typeof this.BackUpRecent.find((x) => x == this.Search) == 'undefined') {
          this.BackUpRecent.reverse().push(this.Search);
          if (this.BackUpRecent.length <= 5) {
            this.Recent = this.BackUpRecent.reverse();
            localStorage.recent = JSON.stringify(this.Recent);
          } else {
            this.Recent = this.BackUpRecent.reverse().slice(0, 5);
            localStorage.recent = JSON.stringify(this.Recent);
          }
        } else {
          this.BackUpRecent.splice(this.BackUpRecent.indexOf(this.Search), 1);
          this.BackUpRecent.reverse().push(this.Search);
          if (this.BackUpRecent.length <= 5) {
            this.Recent = this.BackUpRecent.reverse();
            localStorage.recent = JSON.stringify(this.Recent);
          } else {
            this.Recent = this.BackUpRecent.reverse().slice(0, 5);
            localStorage.recent = JSON.stringify(this.Recent);
          }
        }
        this.LoadSearch();
      }
    },
    SearchRecent(search) {
      this.Search = search;
      this.Status = true;
      this.SearchShopsAndRestaurant();
    },
    SearchUsingEnter() {
      this.Status = true;
      this.SearchShopsAndRestaurant();
    },
    RemoveRecent(search) {
      this.Recent.splice(this.Recent.indexOf(search), 1);
      localStorage.recent = JSON.stringify(this.Recent);
    },
    LoadSearch() {
      Global.methods.Loading();
      setTimeout(() => {
        let stores = JSON.parse(localStorage.stores);
        let favourites = JSON.parse(localStorage.favourites);
        favourites = favourites.filter((x) => x.userid == this.UserID);
        let favouriteIds = favourites.map((x) => x.storeid);
        let searchStores = stores.filter((x) => x.name.toLowerCase().includes(this.Search.toLowerCase()));
        let excludedStores = stores.filter((x) => !x.name.toLowerCase().includes(this.Search.toLowerCase()));
        this.Stores = searchStores.concat(excludedStores);
        for (let x of this.Stores) {
          if (favouriteIds.includes(x.id)) {
            x.favour = 1;
            x.favouriteId = favourites.find((y) => y.storeid == x.id).id;
          }
        }
        Global.methods.Unloading();
      }, 250);
    },
    FavouriteStore(id, status, favourite) {
      console.log(id, status, favourite);
      if (this.UserID != '') {
        let favourites = JSON.parse(localStorage.favourites);
        if (status == 0) {
          favourites.push({
            id: favourites.length + 1,
            storeid: id,
            userid: this.UserID,
          });
        } else {
          favourites = favourites.filter((x) => x.id != favourite);
        }
        localStorage.setItem('favourites', JSON.stringify(favourites));
        this.LoadSearch();
      } else {
        this.$router.push({ name: 'Verify' });
      }
    },
    GotoStore(id) {
      this.$router.replace({ name: 'Store', params: { storeid: id } });
    },
  },
  watch: {
    Search() {
      if (this.Search == '') {
        this.Status = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
ion-list-header {
  font-weight: 600;
  font-size: 16px;
}
.recent-list {
  padding: 10px 10px;
}
.search-list {
  padding: 0 10px;
}
ion-searchbar {
  padding: 0 !important;
}
ion-card-header {
  padding: 10px 16px;
}
ion-card-title {
  margin-top: 0px;
}
.fav-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  background: white;
  border-radius: 50%;
  padding: 5px 5px 0 5px;
}
.time-box {
  position: absolute;
  left: 10px;
  top: 10px;
  background: white;
  border-radius: 5px;
  padding: 5px 5px 2px 5px;
}
ion-card {
  margin: 0px 5px 15px 5px;
}
ion-list {
  padding: 0;
}
.close {
  .close-sign {
    position: absolute;
    top: 0;
    background-color: rgba(0, 0, 0, 0.8);
    width: 100%;
    height: calc(100% - 65px);
    .close-text {
      width: 80%;
      text-align: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 3vw;
    }
  }
}
</style>
