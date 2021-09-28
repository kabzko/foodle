<template>
    <ion-content>
        <ion-grid>
            <ion-row>
                <ion-col size="3">
                    <div class="quantityinput">
                        <ion-input type="number" v-model="ProductQuantity" debounce="1000" @ionChange="UpdateQuantity()" readonly></ion-input>
                    </div>
                </ion-col>
                <ion-col size="3">
                    <div class="ion-text-center" @click="MinusQuantity()">
                        <ion-icon :icon="removeOutline" color="primary"></ion-icon>
                    </div>
                </ion-col>
                <ion-col size="3">
                    <div class="ion-text-center" @click="AddQuantity()">
                        <ion-icon :icon="addOutline" color="primary"></ion-icon>
                    </div>
                </ion-col>
                <ion-col size="3">
                    <div class="ion-text-center" @click="RemoveProduct()">
                        <ion-icon :icon="trashOutline" color="primary"></ion-icon>
                    </div>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-content>
</template>

<script>
import { IonContent, IonIcon, IonInput, popoverController } from "@ionic/vue";
import { trashOutline, addOutline, removeOutline } from "ionicons/icons";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: { 
        IonContent,
        IonIcon,
        IonInput
    },
    props: {
        product: String,
    },
    setup() {
        return {
            trashOutline,
            addOutline,
            removeOutline
        }
    },
    data() {
        return {
            CartID: JSON.parse(this.product).id,
            ActualProductQuantity: JSON.parse(this.product).quantity,
            ProductQuantity: JSON.parse(this.product).quantity,
            Timer: null
        }
    },
    methods: {
        AddQuantity() {
            if (this.ProductQuantity <= 98) {
                this.ProductQuantity++;
            }
        },
        MinusQuantity() {
            if (this.ProductQuantity >= 2) {
                this.ProductQuantity--;
            }
        },
        UpdateQuantity() {
            if (this.ProductQuantity != this.ActualProductQuantity) {
                axios.post(Global.methods.GetURL() + "/cart_update", {
                    cartid: this.CartID,
                    quantity: this.ProductQuantity
                }).then(() => {
                    popoverController.dismiss({
                        status: "success"
                    });
                }); 
            }
        },
        RemoveProduct() {
            axios.post(Global.methods.GetURL() + "/cart_remove", {
                cartid: this.CartID,
            }).then(() => {
                popoverController.dismiss({
                    status: "success"
                });
            }); 
        }
    }
});
</script>

<style scoped>
    ion-col div {
        font-size: 24px;
    }
    ion-col {
        padding: 9px 5px 5px 5px !important;
    }
</style>