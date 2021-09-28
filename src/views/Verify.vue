<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button @click="Verify()" mode="ios" color="primary">
                        Continue
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <div class="mobile">
                <ion-item lines="none">
                    <ion-label position="floating">Mobile</ion-label>
                    <mask-input refid="simnumber" mask="tel" input="numeric" ph="(+63)"></mask-input>
                </ion-item>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonButtons, IonButton, IonItem, IonBackButton, modalController } from "@ionic/vue";
import MaskInput from "../components/MaskInput.vue";

export default({
    components: {
        IonContent,
        IonPage,
        IonButton,
        IonButtons,
        IonItem,
        IonBackButton,
        MaskInput
    },
    data() {
        return {
            Status: true,
            Simnumber: "",
        }
    },
    methods: {
        CloseModal() {
            modalController.dismiss();
        },
        Verify() {
            if (MaskInput.methods.getData("simnumber").length == 18) {
                this.$router.push({ name: "VerifyCode", params: { mobile: MaskInput.methods.getData("simnumber") } });
            }
        }
    }
})
</script>

<style scoped>
    .mobile {
        padding: 16px 16px;
    }
    .mobile ion-item {
        border: 1px solid #c8c7cc;
        border-radius: 10px;
    }
</style>