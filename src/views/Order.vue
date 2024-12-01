<template>
  <ion-page>
    <header class="grid">
      <div class="col-1">
        <ion-back-button default-href="/" color="primary"></ion-back-button>
      </div>
      <div class="col-2">
        <ion-title>{{ token }}</ion-title>
      </div>
      <div class="col-3"></div>
    </header>

    <ion-content>
      <ion-grid>
        <ion-row>
          <ion-col> <ion-icon :icon="homeOutline" color="primary"></ion-icon>&nbsp;Store Information </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <b>
              {{ Store }}
            </b>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-grid>
        <ion-row>
          <ion-col> <ion-icon :icon="walletOutline" color="primary"></ion-icon>&nbsp;Payment Method </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            {{ Payment }}
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-grid>
        <ion-row>
          <ion-col> <ion-icon :icon="receiptOutline" color="primary"></ion-icon>&nbsp;Order Summary </ion-col>
        </ion-row>
        <ion-row v-for="order of Order" v-bind:key="order">
          <ion-col size="2"> {{ order.quantity }}× </ion-col>
          <ion-col size="7">
            <span>{{ order.name }}</span
            ><br />
          </ion-col>
          <ion-col size="3" class="ion-text-end"> ₱ {{ FormatPrice(order.price * order.quantity) }} </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>

    <ion-footer>
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
        <ion-button v-if="Status == 'processing'" mode="ios" expand="full" @click="CancelOrder()"
          >Cancel Order</ion-button
        >
        <ion-button v-else-if="Status != 'processing'" mode="ios" expand="full" disabled>Cancel Order</ion-button>
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
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/vue';
import { receiptOutline, walletOutline, homeOutline, timerOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonFooter,
    IonTitle,
    IonPage,
    IonButton,
    IonBackButton,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
  },
  setup() {
    const route = useRoute();
    const ordertoken = route.params.ordertoken;
    return {
      receiptOutline,
      walletOutline,
      homeOutline,
      timerOutline,
      ordertoken,
    };
  },
  data() {
    return {
      Order: [],
      SubTotal: 0,
      Fare: 0,
      Total: 0,
      UserID: '',
      StoreID: '',
      Status: '',
      Express: '',
      Store: '',
      Streets: '',
      Payment: '',
      When: '',
    };
  },
  created() {
    if (typeof localStorage.users !== 'undefined') {
      this.UserID = JSON.parse(localStorage.users)[0].id;
    }
  },
  mounted() {
    this.LoadOrder();
  },
  methods: {
    FormatPrice(value) {
      const val = (value / 1).toFixed(2).replace(',', '.');
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    LoadOrder() {
      Global.methods.Loading();
      this.Order = [];
      if (typeof localStorage.orders !== 'undefined') {
        let orders = JSON.parse(localStorage.orders);
        orders = orders.filter((x) => x.userid == this.UserID && x.token == this.ordertoken);
        this.Payment = orders[0].type;
        this.Store = orders[0].store;
        this.Status = orders[0].status;
        this.StoreID = orders[0].storeid;
        orders.forEach((x) => {
         console.log(x);
          this.Order.push({
            id: x.id,
            token: x.token,
            name: x.name,
            price: x.price,
            quantity: x.quantity,
            created_at: x.datetime,
            purchasestatus: x.purchasestatus,
          });
          this.SubTotal += x.price * x.quantity;
        });
        this.Total = this.SubTotal + this.Fare;
      }
      setTimeout(() => {
        Global.methods.Unloading();
      }, 250);
    },
    CancelOrder() {
      if (typeof localStorage.orders !== 'undefined') {
        let orders = JSON.parse(localStorage.orders);
        // Filter the orders you want to update
        let filteredOrders = orders.filter((x) => x.userid == this.UserID && x.token == this.ordertoken);

        // Make your updates to the filtered items
        filteredOrders.forEach((order) => {
          order.status = 'cancelled';
        });

        // Merge back the updated items with the non-filtered items
        orders = orders.filter((x) => x.userid != this.UserID && x.token != this.ordertoken).concat(filteredOrders);

        // Save back to localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
      }
      this.LoadOrder();
    },
  },
};
</script>

<style lang="scss" scoped>
.footer {
  margin: 5px 5px;
}
ion-content ion-grid {
  margin: 10px;
  padding: 5px;
  border: 1px solid rgb(190, 190, 190);
  ion-row:first-child ion-col {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    font-size: 16px;
    text-transform: uppercase;
    font-weight: 600;
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
</style>
