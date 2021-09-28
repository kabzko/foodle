<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
               <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                 <ion-title>
                    Address
                </ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content>
            <div v-if="Address.length != 0" class="address-list">
                <ion-list>
                    <ion-item button lines="full" v-for="address of Address" v-bind:key="address" @click.prevent="SelectAddress(address.id, address.latitude, address.longitude)">
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
                                    <ion-button v-if="address.id != 0" @click.stop="ShowAddressDetails(address.id)" class="trash-btn">
                                        <ion-icon slot="icon-only" :icon="pencil" color="primary"></ion-icon>
                                    </ion-button>
                                    <ion-button v-else disabled class="trash-btn">
                                        <ion-icon slot="icon-only" :icon="pencil" color="primary"></ion-icon>
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
                    <p>You haven't saved any address yet!</p>
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
import { IonPage, IonContent, IonFooter, IonTitle, IonBackButton, IonButton, IonList, IonIcon, modalController, alertController } from "@ionic/vue";
import { pencil, locationOutline } from "ionicons/icons";
import { useRoute } from "vue-router";
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
        const route = useRoute();
        const storelat = route.params.storelat;
        const storelng = route.params.storelng;
        return {
            storelat,
            storelng,
            pencil,
            locationOutline
        }
    },
    data() {
        return {
            UserID: "",
            Address: [],
            Lat: "",
            Lng: ""
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
        LatLngToKM(lat1, lng1, lat2, lng2) {
            let r = 6371;
            let p1 = lat1 * Math.PI/180;
            let p2 = lat2 * Math.PI/180;
            let dp = (lat2-lat1) * Math.PI/180;
            let dl = (lng2-lng1) * Math.PI/180;
            let a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            let d = r * c;
            return d;
        },
        LoadAddress() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/address", {
                userid: this.UserID
            }).then(res => {
                this.Address = res.data;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        SelectAddress(id, lat, lng) {
            let distance = this.LatLngToKM(this.storelat, this.storelng, lat, lng);
            if (distance <= 50) {
                axios.post(Global.methods.GetURL() + "/address_select", {
                    userid: this.UserID,
                    addressid: id
                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    setTimeout(() => {
                        Global.methods.Unloading();
                        this.$router.back();
                    }, 100);
                });
            } else {
                this.AlertCheck();
            }
        },
        async ShowAddressDetails(id) {
            const modal = await modalController.create({
                component: Relocation,
                cssClass: "my-custom-class",
                componentProps: {
                    addressid: id,
                    storelat: this.storelat,
                    storelng: this.storelng,
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
                    coordlng: this.Lng,
                    storelat: this.storelat,
                    storelng: this.storelng,
                }
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data.status == "success") {
                this.LoadAddress();
            }
        },
        async AlertCheck() {
            const alert = await alertController.create({
                cssClass: "my-custom-class",
                message: "This restaurant doesn't delivery to this address.",
                buttons: [
                    {
                        text: "Ok",
                        role: "cancel",
                        cssClass: "secondary"
                    },
                ],
            });
            await alert.present();
        },
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
            align-items: flex-start;
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