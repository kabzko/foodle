<template>
  <ion-page>
    <header class="grid">
      <div class="col-1">
        <ion-back-button default-href="/" color="primary"></ion-back-button>
      </div>
      <div class="col-2">
        <ion-title>{{ StoreName }}</ion-title>
      </div>
      <div class="col-3">
        <ion-buttons>
          <ion-button @click="FavouriteStore()">
            <ion-icon v-if="Favourite == 0" slot="icon-only" :icon="heartOutline" color="danger"></ion-icon>
            <ion-icon v-else slot="icon-only" :icon="heart" color="danger"></ion-icon>
          </ion-button>
        </ion-buttons>
      </div>
    </header>

    <ion-content>
      <div>
        <div class="storeimage">
          <img :src="StoreAvatar" />
        </div>
        <router-link :to="{ name: 'SearchProdCat', params: { storeid: storeid } }">
          <ion-searchbar placeholder="Search products" disabled></ion-searchbar>
        </router-link>
        <div class="category-sliders" v-for="(category, index) of CategoryList" v-bind:key="index">
          <ion-grid>
            <ion-row>
              <ion-col>{{ category }}</ion-col>
              <ion-col>
                <router-link :to="{ name: 'Products', params: { storeid: storeid, category: category } }">View all</router-link>
              </ion-col>
            </ion-row>
          </ion-grid>
          <ion-slides pager="false" :options="slideOpts">
            <ion-slide
              v-for="product of FilterCategory(category)"
              v-bind:key="product.id"
              @click="ShowProductDetail(product.store_id, product.id)"
            >
              <div class="product-container">
                <div class="product-image">
                  <img :src="product.image" />
                </div>
                <div class="product-name">
                  {{ product.name }}
                </div>
              </div>
            </ion-slide>
          </ion-slides>
        </div>
      </div>
    </ion-content>
    <ion-footer v-if="Cart != 0">
      <div class="store">
        <ion-button mode="ios" expand="full" router-link="/cart" color="primary">View Cart ({{ Cart }})</ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script>
import { useRoute } from 'vue-router';
import {
  IonContent,
  IonPage,
  IonBackButton,
  IonButtons,
  IonButton,
  IonSearchbar,
  IonTitle,
  IonFooter,
  IonSlide,
  IonSlides,
  modalController,
} from '@ionic/vue';
import { heart, heartOutline } from 'ionicons/icons';
import Global from '../components/Global';
import Product from '../views/Product';

export default {
  components: {
    IonContent,
    IonPage,
    IonButtons,
    IonButton,
    IonSearchbar,
    IonTitle,
    IonBackButton,
    IonFooter,
    IonSlide,
    IonSlides,
  },
  setup() {
    const slideOpts = {
      // spaceBetween: 10,
      slidesPerView: 3,
      freeMode: true,
    };
    const route = useRoute();
    const storeid = route.params.storeid;
    return {
      slideOpts,
      storeid,
      heart,
      heartOutline,
    };
  },
  data() {
    return {
      Cart: 0,
      StoreName: '',
      CategoryList: [],
      ProductList: [],
      Favourite: 0,
      UserID: '',
      StoreAvatar: '',
      URL: Global.methods.GetURL(),
    };
  },
  async created() {
    if (typeof localStorage.users !== 'undefined') {
      this.UserID = JSON.parse(localStorage.users)[0].id;
    }
    this.LoadStore();
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
    LoadStore() {
      Global.methods.Loading();
      if (typeof localStorage.stores !== 'undefined') {
        let stores = JSON.parse(localStorage.stores);
        let store = stores.find((x) => x.id == this.storeid);
        if (store) {
          this.StoreAvatar = store.storebanner;
          this.StoreName = store.name;
        }
      }
      if (typeof localStorage.favourites !== 'undefined') {
        let favourites = JSON.parse(localStorage.favourites);
        let favourite = favourites.find((x) => x.storeid == this.storeid && x.userid == this.UserID);
        if (favourite) {
          this.Favourite = favourite.id;
        }
      }
      if (typeof localStorage.products !== 'undefined') {
        let products = JSON.parse(localStorage.products);
        let filteredProducts = products.filter((x) => x.store_id == this.storeid);
        if (filteredProducts) {
          this.ProductList = filteredProducts;
        }
        this.CategoryList = [...new Set(filteredProducts.map((x) => x.category))];
      }
      if (typeof localStorage.cart !== 'undefined') {
        let cart = JSON.parse(localStorage.cart);
        let cartitem = cart.find((x) => x.store_id == this.storeid);
        if (cartitem) {
          this.Cart = cart.length;
        }
      }
      setTimeout(() => {
        Global.methods.Unloading();
      }, 250);
    },
    FilterCategory(category) {
      return this.ProductList.filter((x) => x.category == category);
    },
    FavouriteStore() {
      if (this.UserID != '') {
        let favourites = JSON.parse(localStorage.favourites);
        if (this.Favourite == 0) {
          const favourite = {
            id: favourites.length + 1,
            storeid: this.storeid,
            userid: this.UserID,
          };
          favourites.push(favourite);
          this.Favourite = favourite.id;
        } else {
          favourites = favourites.filter((x) => x.id != this.Favourite);
          this.Favourite = 0;
        }
        localStorage.setItem('favourites', JSON.stringify(favourites));
        this.LoadStore();
      } else {
        this.$router.push({ name: 'Verify' });
      }
    },
    async ShowProductDetail(storeid, productid) {
      const modal = await modalController.create({
        component: Product,
        cssClass: 'my-custom-class',
        componentProps: {
          storeid: storeid,
          productid: productid,
        },
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      if (data != undefined && data.status == 'success') {
        this.LoadStore();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.storeimage {
  margin: 10px;
  img {
    display: block;
  }
}
.product-image {
  img {
    border-radius: 7px;
    display: block;
  }
}
.sc-ion-searchbar-md-h {
  padding: 10px 10px !important;
}
.category-sliders {
  margin: 15px 10px;
}
.store {
  margin: 5px 5px;
}
.searchbar-disabled.sc-ion-searchbar-md-h {
  opacity: 1 !important;
}
.product-container {
  margin: 0 5px;
  width: 29vw;
}
.product-name {
  color: black;
  margin-top: 5px;
  font-size: 14px;
  height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.close-text {
  width: 55vw;
  position: absolute;
  top: 28vw;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  background: rgb(0, 0, 0, 0.8);
  border-radius: 5px;
  font-size: 7vw;
  text-align: center;
  padding: 5px;
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
</style>
