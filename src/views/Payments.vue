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
            <div class="col-2">
                <ion-title>Payment Type</ion-title>
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button @click="Continue()" mode="ios" color="primary" :disabled="Status">
                        Continue
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <ion-list>
                <ion-radio-group v-model="Selected">
                    <ion-item lines="none" v-for="payment of Payments" v-bind:key="payment">
                        <ion-label>{{ payment.type }}</ion-label>
                        <ion-radio slot="start" :value="payment.type" color="primary" :disabled="payment.disable"></ion-radio>
                    </ion-item>
                </ion-radio-group>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonIcon, IonList, IonRadio, IonRadioGroup, modalController } from "@ionic/vue";
import { closeOutline } from "ionicons/icons";

export default({
    components: {
        IonContent,
        IonPage,
        IonIcon,
        IonList,
        IonRadio, 
        IonRadioGroup
    },
    props: {
        payment: String,
    },
    setup() {
        return {
            closeOutline
        }  
    },
    data() {
        return {
            Payments: JSON.parse(this.payment),
            Selected: null,
            Status: true
        }
    },
    methods: {
        Continue() {
            if (this.Selected == "Cash on Delivery") {
                modalController.dismiss({
                    id: 1,
                    status: "cod"
                });
            } else if (this.Selected == "Credit/Debit Card") {
                modalController.dismiss({
                    id: 2,
                    status: "cdc"
                });
            } else if (this.Selected == "Gcash") {
                modalController.dismiss({
                    id: 3,
                    status: "gcash"
                });
            }
        },
        CloseModal() {
            modalController.dismiss();
        }
    },
    watch: {
        Selected() {
            if (this.Selected != null) {
                this.Status = false;
            }
        },  
    }
})
</script>

<style scoped>
    
</style>