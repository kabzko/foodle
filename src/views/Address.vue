<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>Address</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content :hidden="Load">
            <div v-if="Address.length != 0" class="address-list">
                <ion-list>
                    <ion-item button lines="full" v-for="address of Address" v-bind:key="address" @click.prevent="ShowAddressDetails(address.id)">
                        <ion-grid>
                            <ion-row>
                                <ion-col size="1">
                                    <div>
                                        <ion-icon slot="icon-only" :icon="locationOutline" color="primary"></ion-icon>
                                    </div>
                                </ion-col>
                                <ion-col size="10">
                                    <div class="type">
                                        <small><b>{{ (address.type).toUpperCase() }}</b></small>
                                    </div>
                                    <div class="street">
                                        <span>{{ address.street }}</span>
                                    </div>                       
                                    <div class="address">
                                        <small>{{ address.area }}</small>
                                    </div>                       
                                    <div class="note">
                                        <small>Note: {{ address.note }}</small>
                                    </div>                  
                                </ion-col>
                                <ion-col size="1">
                                    <ion-button @click.stop="DeleteAddress(address.id)" class="trash-btn">
                                        <ion-icon slot="icon-only" :icon="trashOutline" color="primary"></ion-icon>
                                    </ion-button>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-item>
                </ion-list>
            </div>
            <div v-else>
                <div class="empty ion-text-center">
                    <img src="../assets/EmptyAddress.png">
                    <div>
                        <h2>You haven't saved any address yet!</h2>
                    </div>
                    <div class="ion-margin-bottom">
                        <small>Click the button below to add your new shipping address.</small>
                    </div>
                    <ion-button mode="ios" color="primary" @click="NewAddress()">Add new address</ion-button>
                </div>
            </div>
        </ion-content>

        <ion-footer v-if="Address.length != 0">
            <div class="footer-btn">
                <ion-button mode="ios" expand="full" color="primary" @click="NewAddress()">Add new address</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonFooter, IonTitle, IonBackButton, IonButton, IonList, IonIcon, modalController } from "@ionic/vue";
import { trashOutline, locationOutline } from "ionicons/icons";
import Location from "./Location.vue";
import Relocation from "./Relocation.vue";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonPage,
        IonTitle,
        IonContent,
        IonBackButton,
        IonButton,
        IonFooter,
        IonList,
        IonIcon
    },
    setup() {
        return {
            trashOutline,
            locationOutline
        }
    },
    data() {
        return {
            UserID: "",
            Address: [],
            Load: true,
            Lat: "",
            Lng: "",
        }
    },
    created() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
        this.Lat = JSON.parse(localStorage.mycoordinates)[0].lat;
        this.Lng = JSON.parse(localStorage.mycoordinates)[0].lng;
        this.LoadAddress();
    },
    methods: {
        LoadAddress() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/address", {
                userid: this.UserID
            }).then(res => {
                this.Load = false;
                this.Address = [];
                this.Address = res.data;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        DeleteAddress(id) {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/address_delete", {
                addressid: id
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    this.LoadAddress();
                    Global.methods.Unloading();
                }, 100);
            });
        },
        async ShowAddressDetails(id) {
            const modal = await modalController.create({
                component: Relocation,
                cssClass: "my-custom-class",
                componentProps: {
                    addressid: id
                }
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data.status == "success") {
                this.LoadAddress();
            }
        },
        async NewAddress() {
            const modal = await modalController.create({
                component: Location,
                cssClass: "my-custom-class",
                componentProps: {
                    coordlat: this.Lat,
                    coordlng: this.Lng
                }
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data.status == "success") {
                this.LoadAddress();
            }
        }
    }
})
</script>

<style lang="scss" scoped>
    .footer-btn {
        margin: 5px;
    }
    ion-item {
        --padding-start: 0 !important;
        --inner-padding-end: 0 !important;
    }
    ion-list {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
    .trash-btn {
        padding: 0 !important;
        --background: transparent;
        --padding-start: 0;
        --padding-end: 0;
        --padding-top: 0;
        --padding-bottom: 0;
        --box-shadow: 0;
        margin-left: auto;
        margin-right: auto;
    }
    .address-list ion-grid ion-row {
        ion-col {
            padding: 10px 5px;
        }
        ion-col:nth-child(1) {
            display: flex;
            justify-content: center;
            div {
                font-size: 22px;
                margin-top: 0.4vh;
            }
        }
        ion-col:nth-child(3) {
            display: flex;
            align-items: center;
        }
    }
    .street, .address, .note {
        font-size: 14px;
    }
    .empty {
        width: 75%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    img {
        height: 100px;
    }
</style>