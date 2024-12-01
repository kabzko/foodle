<template>
  <ion-page>
    <header class="grid">
      <div class="col-1">
        <ion-back-button default-href="/" color="primary"></ion-back-button>
      </div>
      <div class="col-2">
        <ion-title>{{ Store }}</ion-title>
      </div>
      <div class="col-3"></div>
    </header>

    <ion-content :hidden="Load">
      <ion-card class="payment">
        <ion-grid>
          <ion-row>
            <ion-col size="11">
              <div class="payment-title">
                <ion-icon :icon="walletOutline" color="primary"></ion-icon>
                &nbsp;Payment Method
              </div>
              <div class="payment-detail">
                <span>
                  {{ PaymentType }}
                </span>
              </div>
            </ion-col>
            <ion-col size="1">
              <div>
                <ion-icon :icon="createOutline" color="primary" @click="ShowPayments()"></ion-icon>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card>
      <ion-card class="cart">
        <ion-grid>
          <ion-row>
            <ion-col>
              <div class="cart-title">
                <ion-icon :icon="receiptOutline" color="primary"></ion-icon>
                &nbsp;Order Summary
              </div>
              <div class="cart-detail">
                <ion-grid>
                  <ion-row v-for="product of Products" v-bind:key="product">
                    <ion-col size="2">
                      <div>{{ product.quantity }}×</div>
                    </ion-col>
                    <ion-col size="7">
                      <div>
                        {{ product.name }}
                      </div>
                    </ion-col>
                    <ion-col size="3">
                      <div>₱ {{ FormatPrice(product.price * product.quantity) }}</div>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card>
    </ion-content>

    <ion-footer :hidden="Load">
      <div class="footer">
        <ion-grid>
          <ion-row>
            <ion-col>Subtotal</ion-col>
            <ion-col>₱ {{ FormatPrice(SubTotal) }}</ion-col>
          </ion-row>
          <ion-row>
              <ion-col>Delivery Fee</ion-col>
              <ion-col>
                  <span v-if="Fare != 0">₱ {{ FormatPrice(Fare) }}</span>
                  <span v-else>Free</span>
              </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>Total <small>(VAT incl)</small></ion-col>
            <ion-col>₱ {{ FormatPrice(Total) }}</ion-col>
          </ion-row>
        </ion-grid>
        <ion-button v-if="PaymentType == ''" mode="ios" expand="full" color="primary" @click="ShowPayments()"
          >Confirm payment method</ion-button
        >
        <ion-button v-else mode="ios" expand="full" color="primary" @click="AlertCheck()">Place Order</ion-button>
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
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  modalController,
  alertController,
} from '@ionic/vue';
import { addOutline, locationOutline, walletOutline, receiptOutline, createOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import Payments from './Payments.vue';
import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonTitle,
    IonPage,
    IonButton,
    IonBackButton,
    IonCard,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
  },
  setup() {
    const route = useRoute();
    const cart = route.params.cart;
    const store = route.params.store;
    const storeid = route.params.storeid;
    return {
      cart,
      store,
      storeid,
      addOutline,
      locationOutline,
      receiptOutline,
      walletOutline,
      createOutline,
    };
  },
  data() {
    return {
      Payments: [
        {
          type: 'Cash on Delivery',
          disable: false,
        },
      ],
      Store: this.store,
      Products: JSON.parse(this.cart),
      Total: 0,
      SubTotal: 0,
      Fare: 0,
      PaymentID: 0,
      Load: true,
      PaymentType: '',
      UserID: '',
      OrderBanner: '',
      StoreID: this.storeid,
    };
  },
  ionViewWillEnter() {
    if (typeof localStorage.users !== 'undefined') {
      this.UserID = JSON.parse(localStorage.users)[0].id;
    }
    this.LoadCart();
  },
  methods: {
    FormatPrice(value) {
      const val = (value / 1).toFixed(2).replace(',', '.');
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
            let stores = JSON.parse(localStorage.stores);
            this.OrderBanner = stores.find((x) => x.id == this.StoreID).orderbanner;
          }
          this.Load = false;
          this.Total = this.SubTotal * 1.12;
        } else {
          this.Load = false;
          this.SubTotal = 0;
          this.Products = [];
        }
      } else {
        this.Load = false;
        this.SubTotal = 0;
        this.Products = [];
      }
      setTimeout(() => {
        Global.methods.Unloading();
      }, 250);
    },
    async ShowPayments() {
      const modal = await modalController.create({
        component: Payments,
        cssClass: 'my-custom-class',
        componentProps: {
          payment: JSON.stringify(this.Payments),
        },
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      if (data != undefined && data.status == 'cod') {
        this.LoadCart();
        this.PaymentType = 'Cash on Delivery';
      }
      this.PaymentID = data.id;
    },
    PlaceOrder() {
      Global.methods.Loading();
      let orders = JSON.parse(localStorage.orders);
      let token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      for (let x of this.Products) {
        orders.push({
          id: orders.length + 1,
          token: token,
          userid: this.UserID,
          storeid: this.StoreID,
          datetime: new Date(),
          name: x.name,
          price: x.price,
          quantity: x.quantity,
          orderbanner: this.OrderBanner,
          status: 'processing',
          type: this.PaymentType,
          store: this.Store,
        });
      }
      localStorage.setItem('orders', JSON.stringify(orders));
      setTimeout(() => {
        if (typeof localStorage.carts !== 'undefined') {
          let carts = JSON.parse(localStorage.carts);
          carts = carts.filter((x) => x.userid != this.UserID);
          localStorage.setItem('carts', JSON.stringify(carts));
        }
        Global.methods.Unloading();
        this.$router.replace({ name: 'Success' });
      }, 250);
    },
    async AlertCheck() {
      const alert = await alertController.create({
        cssClass: 'my-custom-class',
        message: 'Do you wish to place your order?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Yes',
            handler: () => {
              this.PlaceOrder();
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
.footer {
  margin: 5px 5px;
}
ion-footer {
  ion-grid ion-row ion-col:nth-child(2) {
    text-align: right;
  }
  ion-grid {
    margin-bottom: 15px;
  }
}
ion-item {
  --padding-start: 0 !important;
  --inner-padding-end: 0 !important;
}
.delivery {
  padding: 5px;
  ion-grid ion-row {
    ion-col:nth-child(1) {
      .delivery-title {
        display: block;
        margin-bottom: 15px;
        font-size: 16px;
        display: flex;
        align-items: center;
        color: #000000;
        ion-icon {
          font-size: 18px;
        }
      }
      .delivery-detail {
        display: block;
        padding-left: 8px;
        div {
          padding: 2px 0;
          color: #000000;
        }
        div:nth-child(1) {
          font-weight: 600;
        }
      }
    }
    ion-col:nth-child(2) {
      padding-top: 0;
      display: flex;
      align-items: flex-start;
      div {
        margin-left: auto;
        font-size: 24px;
      }
    }
  }
}
.payment {
  padding: 5px;
  ion-grid ion-row {
    ion-col:nth-child(1) {
      .payment-title {
        display: block;
        margin-bottom: 15px;
        font-size: 16px;
        display: flex;
        align-items: center;
        color: #000000;
        ion-icon {
          font-size: 18px;
        }
      }
      .payment-detail {
        display: block;
        padding-left: 4px;
        color: #000000;
      }
    }
    ion-col:nth-child(2) {
      padding-top: 0;
      display: flex;
      align-items: flex-start;
      div {
        margin-left: auto;
        font-size: 24px;
      }
    }
  }
}
.cart {
  padding: 5px;
  .cart-title {
    display: block;
    margin-bottom: 15px;
    font-size: 16px;
    display: flex;
    align-items: center;
    color: #000000;
    ion-icon {
      font-size: 18px;
    }
  }
  .cart-detail {
    ion-grid ion-row {
      ion-col {
        color: #000000;
        display: flex;
        align-items: flex-start;
      }
      ion-col:nth-child(3) div {
        margin-left: auto;
      }
    }
  }
}
</style>
