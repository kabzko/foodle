<template>
  <ion-page>
    <header class="grid">
      <div class="col-1">
        <ion-back-button default-href="/" color="primary"></ion-back-button>
      </div>
      <div class="col-2"></div>
      <div class="col-3">
        <ion-buttons>
          <ion-button @click="VerifyCode()" mode="ios" color="primary">
            Confirm
          </ion-button>
        </ion-buttons>
      </div>
    </header>

    <ion-content>
      <div class="container">
        <div class="ion-text-center">
          <p>Your verification code is sent by SMS to</p>
          <p>{{ Simnumber }}</p>
        </div>
        <div>
          <ion-item lines="none" class="ion-text-center">
            <mask-input refid="verifycode" mask="cpf" input="numeric" ph="* * * * * *"></mask-input>
          </ion-item>
        </div>
        <div class="ion-text-center">
          <p v-if="Countdown == false">Did not receive the code? <a href="#" @click.prevent="SendCode()">Resend</a></p>
          <p v-if="Countdown == true">Please wait {{ Timeout }}s to resend</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonPage, IonButtons, IonButton, IonBackButton, IonItem, toastController } from '@ionic/vue';
import { useRoute } from 'vue-router';
import MaskInput from '../components/MaskInput.vue';
import Global from '../components/Global';

export default {
  components: {
    IonContent,
    IonPage,
    IonButton,
    IonButtons,
    IonBackButton,
    IonItem,
    MaskInput,
  },
  setup() {
    const route = useRoute();
    const mobile = route.params.mobile;
    return {
      mobile,
    };
  },
  data() {
    return {
      GeneratedCode: '',
      Simnumber: this.mobile,
      Timeout: 60,
      Countdown: true,
      InputCode: '',
      Accounts: [],
    };
  },
  mounted() {
    this.SendCode();
    if (typeof localStorage.accounts !== 'undefined') {
      this.Accounts = JSON.parse(localStorage.accounts);
    }
  },
  methods: {
    SendCode() {
      this.Timeout = 60;
      this.Countdown = true;
      let timer = setInterval(() => {
        this.Timeout = this.Timeout - 1;
        if (this.Timeout == 0) {
          this.Countdown = false;
          clearInterval(timer);
        }
      }, 1000);
      this.GeneratedCode = 123456;
      Global.methods.Loading();
      setTimeout(() => {
        Global.methods.Unloading();
      }, 250);
    },
    VerifyCode() {
      if (MaskInput.methods.getData('verifycode').replace(/\s/g, '') != '') {
        if (MaskInput.methods.getData('verifycode').replace(/\s/g, '') == this.GeneratedCode) {
          Global.methods.Loading();
          let account = this.Accounts.find(
            (account) =>
              account.mobile ==
              this.Simnumber.replace(/[()]/g, '')
                .replace(/\s/g, '')
                .replace('+', '')
          );
          setTimeout(() => {
            Global.methods.Unloading();
            if (account == undefined) {
              this.$router.replace({ name: 'Register', params: { mobile: this.Simnumber } });
            } else {
              this.$router.replace({ name: 'Password', params: { mobile: this.Simnumber } });
            }
          }, 250);
        } else {
          this.openToast('Invalid code.');
        }
      } else {
        this.openToast('Invalid code.');
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

<style scoped>
.container {
  margin: 50px 0;
}
#verifycode {
  font-size: 30px;
}
</style>
