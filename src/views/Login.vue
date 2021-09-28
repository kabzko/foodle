<template>
    <ion-page>
        <ion-footer>
            <div class="login-footer">
                <ion-button mode="ios" expand="full" color="tertiary" @click="LoginWithFacbook()">Continue with Facebook</ion-button>
                <ion-button mode="ios" expand="full" color="primary" @click="GotoVerify()">Continue with SMS</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { IonFooter, IonPage, IonButton, modalController, toastController } from "@ionic/vue";

export default({
    components: {
        IonFooter,
        IonPage,
        IonButton
    },
    methods: {
        LoginWithFacbook() {
            this.openToast("This feature is still on development, Sorry for the inconvenience.");
        },
        GotoVerify() {
            modalController.dismiss();
            this.$router.push({ "name": "Verify"});
        },
        async openToast(message) {
            const toast = await toastController.create({
                    message: message,
                    duration: 3000
                });
            return toast.present();
        },
    },
})
</script>

<style scoped>
    .login-footer {
        margin: 5px 5px;
    }
    ion-button {
        margin: 5px 0;
    }
</style>