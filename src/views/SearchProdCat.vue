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
          placeholder="Search products"
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
            <ion-card
              v-for="product of Products"
              v-bind:key="product"
              @click.prevent="GotoProduct(product.store_id, product.id)"
            >
              <img :src="product.image" height="120" />
              <ion-card-header>
                <ion-card-subtitle>₱ {{ FormatPrice(product.price) }}</ion-card-subtitle>
                <ion-card-title>{{ product.name }}</ion-card-title>
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
  IonIcon,
  IonSearchbar,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
} from '@ionic/vue';
import { closeOutline, timerOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonPage,
    IonIcon,
    IonSearchbar,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
  },
  setup() {
    const route = useRoute();
    const storeid = route.params.storeid;
    return {
      storeid,
      closeOutline,
      timerOutline,
    };
  },
  async created() {
    setTimeout(() => {
      this.$refs.searchRef.$el.setFocus();
    }, 100);
    if (localStorage.recentprod != undefined) {
      this.BackUpRecent = JSON.parse(localStorage.recentprod);
      this.Recent = this.BackUpRecent;
    }
  },
  data() {
    return {
      Recent: [],
      BackUpRecent: [],
      Search: '',
      Status: false,
      UserID: '',
      Products: [],
      URL: Global.methods.GetURL(),
    };
  },
  methods: {
    FormatPrice(value) {
      const val = (value / 1).toFixed(2).replace(',', '.');
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    SearchProducts() {
      if (this.Search != '') {
        if (typeof this.BackUpRecent.find((x) => x == this.Search) == 'undefined') {
          this.BackUpRecent.reverse().push(this.Search);
          if (this.BackUpRecent.length <= 5) {
            this.Recent = this.BackUpRecent.reverse();
            localStorage.recentprod = JSON.stringify(this.Recent);
          } else {
            this.Recent = this.BackUpRecent.reverse().slice(0, 5);
            localStorage.recentprod = JSON.stringify(this.Recent);
          }
        } else {
          this.BackUpRecent.splice(this.BackUpRecent.indexOf(this.Search), 1);
          this.BackUpRecent.reverse().push(this.Search);
          if (this.BackUpRecent.length <= 5) {
            this.Recent = this.BackUpRecent.reverse();
            localStorage.recentprod = JSON.stringify(this.Recent);
          } else {
            this.Recent = this.BackUpRecent.reverse().slice(0, 5);
            localStorage.recentprod = JSON.stringify(this.Recent);
          }
        }
        this.LoadSearch();
      }
    },
    SearchRecent(search) {
      this.Search = search;
      this.Status = true;
      this.SearchProducts();
    },
    SearchUsingEnter() {
      this.Status = true;
      this.SearchProducts();
    },
    RemoveRecent(search) {
      this.Recent.splice(this.Recent.indexOf(search), 1);
      localStorage.recentprod = JSON.stringify(this.Recent);
    },
    LoadSearch() {
      Global.methods.Loading();
      if (typeof localStorage.products !== 'undefined') {
        let products = JSON.parse(localStorage.products);
        this.Products = products.filter(
          (x) => x.store_id == this.storeid && x.name.toLowerCase().includes(this.Search.toLowerCase())
        );
      }
      setTimeout(() => {
        Global.methods.Unloading();
      }, 250);
    },
    GotoProduct(storeid, productid) {
      this.$router.replace({ name: 'Product', params: { storeid: storeid, productid: productid } });
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
img {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
ion-searchbar {
  padding: 0 !important;
}
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
ion-card-header {
  padding: 10px 16px;
}
ion-card-title {
  margin-top: 5px;
}
ion-list {
  padding: 0;
}
ion-card-header {
  padding-top: 0px;
}
</style>
