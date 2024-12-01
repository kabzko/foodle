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
          <ion-col
            size="4"
            v-for="product of Products"
            v-bind:key="product.id"
            @click="ShowProductDetail(product.store_id, product.id)"
          >
            <div>
              <img :src="product.image" />
            </div>
            <div class="product-name">
              {{ product.name }}
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { useRoute } from 'vue-router';
import { IonContent, IonPage, IonBackButton, IonTitle, modalController } from '@ionic/vue';
import Global from '../components/Global';
import Product from '../views/Product';

export default {
  components: {
    IonContent,
    IonPage,
    IonTitle,
    IonBackButton,
  },
  setup() {
    const route = useRoute();
    const storeid = route.params.storeid;
    const category = route.params.category;
    return {
      storeid,
      category,
    };
  },
  data() {
    return {
      Products: [],
      Title: '',
    };
  },
  created() {
    this.Title = this.category;
    this.LoadProducts();
  },
  methods: {
    LoadProducts() {
      Global.methods.Loading();
      if (typeof localStorage.products !== 'undefined') {
        let products = JSON.parse(localStorage.products);
        this.Products = products.filter((x) => x.store_id == this.storeid && x.category == this.category);
      }
      setTimeout(() => {
        Global.methods.Unloading();
      }, 250);
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
img {
  border-radius: 7px;
  display: block;
}
ion-grid ion-row ion-col div:nth-child(2) {
  text-align: center;
}
.product-name {
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
