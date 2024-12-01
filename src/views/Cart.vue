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
      <div v-if="Products?.length != 0 && Load == false">
        <div class="cart-list">
          <ion-item
            v-for="product of Products"
            v-bind:key="product"
            lines="full"
            class="cart-item"
            button
            @click.prevent="ShowCartDetail(product.id)"
          >
            <ion-grid>
              <ion-row>
                <ion-col size="2" @click.stop="OpenPopover($event, product)">
                  <div class="product-quantity">{{ product.quantity }}×</div>
                </ion-col>
                <ion-col size="7">
                  <div class="product-name">
                    {{ product.name }}
                  </div>
                </ion-col>
                <ion-col size="3">
                  <div>₱ {{ FormatPrice(product.price * product.quantity) }}</div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-item>
        </div>
      </div>
      <div v-if="Products?.length == 0 && Load == false">
        <div class="empty ion-text-center">
          <img src="../assets/EmptyCart.png" />
          <div>
            <h2>Your cart is currently empty!</h2>
          </div>
          <div class="ion-margin-bottom">
            <small>Click the button below to start browsing.</small>
          </div>
          <ion-button mode="ios" color="primary" @click="Browse()">Browse</ion-button>
        </div>
      </div>
    </ion-content>

    <ion-footer v-if="Products?.length != 0 && Load == false">
      <div class="footer">
        <ion-grid>
          <ion-row>
            <ion-col>Subtotal</ion-col>
            <ion-col>₱ {{ FormatPrice(SubTotal) }}</ion-col>
          </ion-row>
        </ion-grid>
        <ion-button mode="ios" expand="full" color="primary" @click="Checkout()">Checkout</ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script>
import {
  IonContent,
  IonFooter,
  IonTitle,
  IonPage,
  IonButton,
  IonBackButton,
  modalController,
  popoverController,
} from '@ionic/vue';
import CartDetail from './CartDetail.vue';
import Quantity from './Quantity.vue';
import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonTitle,
    IonPage,
    IonButton,
    IonBackButton,
    IonFooter,
  },
  async ionViewWillEnter() {
    if (typeof localStorage.users !== 'undefined') {
      this.UserID = JSON.parse(localStorage.users)[0].id;
    }
    this.LoadCart();
  },
  data() {
    return {
      UserID: '',
      Title: '',
      Products: [],
      SubTotal: 0,
      Total: 0,
      Load: true,
      StoreID: '',
    };
  },
  methods: {
    FormatPrice(value) {
      const val = (value / 1).toFixed(2).replace(',', '.');
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    TimeFormat(time) {
      time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
      if (time.length > 1) {
        time = time.slice(1);
        time[5] = +time[0] < 12 ? ' AM' : ' PM';
        time[0] = +time[0] % 12 || 12;
      }
      return time.join('');
    },
    LoadCart() {
      Global.methods.Loading();
      if (typeof localStorage.carts !== 'undefined' && JSON.parse(localStorage.carts).length > 0) {
        this.SubTotal = 0;
        this.Products = [];
        let carts = JSON.parse(localStorage.carts);
        carts = carts.filter((x) => x.userid == this.UserID);
        if (typeof localStorage.products !== 'undefined' && carts.length > 0) {
          let products = JSON.parse(localStorage.products);
          for (let x of carts) {
            let product = products.find((y) => y.id == x.productid);
            if (product) {
              this.Products.push({
                id: x.id,
                product_id: x.product_id,
                name: product.name,
                price: product.price,
                quantity: x.quantity,
                availability: x.availability,
                instruction: x.instruction,
              });
            }
            this.SubTotal += product.price * x.quantity;
          }
          if (typeof localStorage.stores !== 'undefined') {
            this.StoreID = carts[0].storeid;
            let stores = JSON.parse(localStorage.stores);
            this.Title = stores.find((x) => x.id == this.StoreID).name;
          }
          this.Load = false;
        } else {
          this.Load = false;
          this.Title = 'Cart';
          this.SubTotal = 0;
          this.Products = [];
        }
      } else {
        this.Load = false;
        this.Title = 'Cart';
        this.SubTotal = 0;
        this.Products = [];
      }
      setTimeout(() => {
        Global.methods.Unloading();
      }, 250);
    },
    async ShowCartDetail(id) {
      const modal = await modalController.create({
        component: CartDetail,
        cssClass: 'my-custom-class',
        componentProps: {
          cartid: id,
        },
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      if (data != undefined && data.status == 'success') {
        this.LoadCart();
      }
    },
    async OpenPopover(ev, product) {
      const popover = await popoverController.create({
        component: Quantity,
        cssClass: 'my-custom-class',
        event: ev,
        componentProps: {
          product: JSON.stringify(product),
        },
      });
      await popover.present();

      const { data } = await popover.onDidDismiss();
      if (data != undefined && data.status == 'success') {
        this.LoadCart();
      }
    },
    Checkout() {
      this.$router.push({
        name: 'Checkout',
        params: {
          cart: JSON.stringify(this.Products),
          store: this.Title,
          storeid: this.StoreID,
        },
      });
    },
    Browse() {
      this.$router.replace({ name: 'Home' });
    },
  },
};
</script>

<style lang="scss" scoped>
a {
  position: absolute;
  right: 20px;
  margin-top: 8px;
  z-index: 2;
}
.footer {
  margin: 5px 5px;
}
.subtotal {
  margin: 10px 8px;
  padding: 0 0 5px 0;
}
.cart-list {
  margin: 10px 0 15px 0;
}
.cart-item {
  margin: 10px 0 10px 0;
}
.cart-list {
  ion-item {
    margin: 0 !important;
    --padding-start: 10px !important;
    --inner-padding-end: 10px !important;
  }
  ion-grid ion-row {
    ion-col:first-child {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 !important;
    }
    ion-col:nth-child(2) {
      display: flex;
      align-items: center;
      padding: 0 !important;
    }
    ion-col:nth-child(3) {
      text-align: right;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 !important;
    }
  }
}
ion-footer {
  ion-grid ion-row ion-col:nth-child(2) {
    text-align: right;
  }
  ion-grid {
    margin-bottom: 15px;
  }
}
.empty {
  width: 75%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    height: 100px;
  }
}
.product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-quantity {
  border: 1px solid rgba(158, 158, 158, 0.5);
  padding: 5px 10px;
  background: rgb(245, 245, 245);
}
</style>
