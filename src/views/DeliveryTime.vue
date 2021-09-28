<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-buttons>
                    <ion-button @click="CloseModal()">
                        <ion-icon slot="icon-only" :icon="close" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button @click="SetDelivery()">
                        <ion-icon slot="icon-only" :icon="checkmark" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
        </header>
        <ion-content>
            <ion-item>
            <ion-label>Delivery Date</ion-label>
            <ion-select v-model="DeliveryDate" interface="action-sheet">
                <ion-select-option value="1">{{ "Today, " + Month() + " " + new Date().getDate() }}</ion-select-option>
                <ion-select-option value="2">{{ "Tomorrow, " + Month() + " " + (Number(new Date().getDate()) + 1) }}</ion-select-option>
                <ion-select-option value="3">{{ TomorrowOtherDay() + ", " + Month() + " " + (Number(new Date().getDate()) + 2) }}</ion-select-option>
            </ion-select>
            </ion-item>
            <ion-item>
                <ion-label>Delivery Time</ion-label>
                <ion-datetime v-model="DeliveryTime" display-format="HH:mm" :hour-values="Time" minute-values="0,15,30,45"></ion-datetime>
            </ion-item>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonButtons, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime, modalController } from "@ionic/vue";
import { checkmark, close } from "ionicons/icons";

export default ({
    components: {
        IonContent,
        IonPage, 
        IonButtons,
        IonButton,
        IonItem, 
        IonLabel, 
        IonSelect, 
        IonSelectOption, 
        IonDatetime,
    },
    setup() {
        return {
            checkmark,
            close,
        }
    },
    data() {
        return {
            Time: [],
            DeliveryDate: "1",
            DeliveryTime: (new Date().getHours() + 1) + ":00",
            DeliveryType: "",
        }
    },
    mounted() {
        console.log()
        if (this.DeliveryDate == "1") {
            let Hours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
            this.Time = Hours.slice(new Date().getHours(), 22);
        } 
    },
    methods: {
        Month() {
            let Month = ["Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return Month[new Date().getMonth()];
        },
        TomorrowOtherDay() {
            let Day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Staturday"];
            return Day[new Date().getDay() + 2];
        },
        SetDelivery() {
            if (this.DeliveryDate == 1) {
                this.DeliveryType = "Today, " + this.DeliveryTime;
            } else if (this.DeliveryDate == 2) {
                this.DeliveryType = "Tomorrow, " + this.DeliveryTime;
            } else {
                this.DeliveryType = this.TomorrowOtherDay() + ", " + this.DeliveryTime;
            }
            modalController.dismiss({
                status: "success",
                delivery: this.DeliveryType,
            })
        },
        CloseModal() {
            modalController.dismiss();
        },
    },
    watch: {
        DeliveryDate() {
            if (this.DeliveryDate == 1) {
                let Hours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
                this.Time = Hours.slice(new Date().getHours(), 22);
            } else if (this.DeliveryDate == 2) {
                let Hours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
                this.Time = Hours.slice(7, 22);
            } else {
                let Hours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
                this.Time = Hours.slice(7, 22);
            }
        }
    }
})
</script>

<style lang="scss" scoped>

</style>