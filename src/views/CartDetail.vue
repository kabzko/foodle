<template>
  <ion-page>
    <header class="grid">
      <div class="col-1">
        <ion-buttons>
          <ion-button @click="CloseModal()">
            <ion-icon slot="icon-only" :icon="closeOutline" color="primary"></ion-icon>
          </ion-button>
        </ion-buttons>
      </div>
      <div class="col-2"></div>
      <div class="col-3"></div>
    </header>

    <ion-content :hidden="Load">
      <div class="productimage">
        <img :src="Avatar" />
      </div>
      <ion-card-header>
        <ion-card-title>{{ Product.name }}</ion-card-title>
        <ion-card-subtitle>₱ {{ FormatPrice(Product.price) }}</ion-card-subtitle>
      </ion-card-header>
      <hr v-if="Product.description != ''" />
      <div class="description" v-if="Product.description != ''">
        <span>{{ Product.description }}</span>
      </div>
      <div class="instruct">
        <ion-radio-group v-model="Availability">
          <ion-list>
            <ion-list-header>
              Availability
            </ion-list-header>
          </ion-list>
          <ion-item lines="none">
            <ion-label>Remove it from my order if none</ion-label>
            <ion-radio slot="start" value="Remove it from my order if none" checked></ion-radio>
          </ion-item>
          <ion-item lines="none">
            <ion-label>Cancel the entire order if none</ion-label>
            <ion-radio slot="start" value="Cancel the entire order if none"></ion-radio>
          </ion-item>
          <ion-item lines="none">
            <ion-label>Call me if none</ion-label>
            <ion-radio slot="start" value="Call me if none"></ion-radio>
          </ion-item>
        </ion-radio-group>
        <ion-list>
          <ion-list-header>
            Special Instructions
          </ion-list-header>
          <ion-textarea v-model="Instruction" placeholder="eg. I`m allergic to mayo or etc."></ion-textarea>
        </ion-list>
      </div>
      <div class="addcart">
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-item lines="none">
                <ion-input class="ion-text-center" v-model="Quantity"></ion-input>
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-button mode="ios" expand="full" @click="UpdateCart()" color="primary">Update</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonContent,
  IonPage,
  IonCardSubtitle,
  IonIcon,
  IonCardTitle,
  IonCardHeader,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonTextarea,
  IonInput,
  modalController,
  toastController,
} from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonPage,
    IonCardSubtitle,
    IonIcon,
    IonCardTitle,
    IonCardHeader,
    IonList,
    IonRadio,
    IonRadioGroup,
    IonTextarea,
    IonInput,
  },
  props: {
    cartid: String,
  },
  setup() {
    return {
      closeOutline,
    };
  },
  data() {
    return {
      Product: [],
      Availability: '',
      Instruction: '',
      Quantity: '',
      Load: true,
      Avatar: '',
    };
  },
  created() {
    this.LoadProduct();
  },
  methods: {
    FormatPrice(value) {
      const val = (value / 1).toFixed(2).replace(',', '.');
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    LoadProduct() {
      Global.methods.Loading();
      if (typeof localStorage.carts !== 'undefined') {
        let carts = JSON.parse(localStorage.carts);
        if (typeof localStorage.products !== 'undefined') {
          let products = JSON.parse(localStorage.products);
          let cart = carts.find((x) => x.id == this.cartid);
          this.Product = products.find((x) => x.id == cart.productid);
          this.Load = false;
          this.Availability = cart.availability;
          this.Instruction = cart.instruction;
          this.Quantity = cart.quantity;
          this.Avatar = this.Product.image;
        }
      }
      setTimeout(() => {
        Global.methods.Unloading();
      }, 250);
    },
    CloseModal() {
      modalController.dismiss();
    },
    UpdateCart() {
      if (this.Quantity && this.Quantity > 0) {
        Global.methods.Loading();
        let carts = JSON.parse(localStorage.carts);
        let cart = carts.find((x) => x.id == this.cartid);
        cart.quantity = this.Quantity;
        cart.availability = this.Availability;
        cart.instruction = this.Instruction;
        localStorage.setItem('carts', JSON.stringify(carts));
        setTimeout(() => {
          Global.methods.Unloading();
          setTimeout(() => {
            modalController.dismiss({ status: 'success' });
          }, 100);
        }, 250);
      } else {
        this.openToast('Please enter a valid quantity.');
      }
    },
    async openToast(message) {
      const toast = await toastController.create({
        message: message,
        duration: 3000,
        position: 'bottom',
      });
      return toast.present();
    },
  },
};
</script>

<style lang="scss" scoped>
.productimage {
  margin: 10px;
}
.addcart {
  margin: 20px 10px;
}
.description {
  margin: 20px 15px;
}
.description span {
  font-size: 12px;
  color: rgb(110, 110, 110);
}
ion-card-subtitle {
  --color: rgb(80, 80, 80);
}
ion-list-header {
  padding: 0 !important;
  border-bottom: 1px solid #c8c7cc;
  font-size: 16px !important;
}
ion-list-header ion-label {
  margin: 6px 0 !important;
}
ion-card-header {
  padding: 16px 11px 0 11px;
}
.choices,
.instruct {
  margin: 0 12px;
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
ion-grid ion-row ion-col {
  display: flex;
  align-items: center;
  ion-item {
    border: 1px solid #c8c7cc;
    border-radius: 10px;
    margin: 10px 0;
  }
}
ion-grid ion-row ion-col:nth-child(2) {
  ion-button {
    width: 100%;
  }
}
</style>
