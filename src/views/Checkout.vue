<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>{{ Store }}</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content :hidden="Load">
            <ion-card class="delivery">
                <ion-grid>
                    <ion-row>
                        <ion-col size="11">
                            <div class="delivery-title">
                                <ion-icon :icon="locationOutline" color="primary"></ion-icon>
                                &nbsp;Delivery Address
                            </div>
                            <div v-if="Street != ''" class="delivery-detail">
                                <div>{{ Street }}</div>
                                <div>{{ Area }}</div>
                                <div>Note for rider: {{ Note }}</div>
                            </div>
                        </ion-col>
                        <ion-col size="1">
                            <div>
                                <ion-icon :icon="createOutline" color="primary" @click="ShowNote()"></ion-icon>
                            </div>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-card>
            <ion-card class="payment">
                <ion-grid>
                    <ion-row>
                        <ion-col size="11">
                            <div class="payment-title">
                                <ion-icon :icon="walletOutline" color="primary"></ion-icon>
                                &nbsp;Payment Method
                            </div>
                            <div class="payment-detail">
                                <span>
                                    {{ PaymentType }}
                                </span>
                            </div>
                        </ion-col>
                        <ion-col size="1">
                            <div>
                                <ion-icon :icon="createOutline" color="primary" @click="ShowPayments()"></ion-icon>
                            </div>
                        </ion-col>
                    </ion-row>
                </ion-grid>
                
            </ion-card>
            <ion-card class="cart">
                <ion-grid>
                    <ion-row>
                        <ion-col>
                            <div class="cart-title">
                                <ion-icon :icon="receiptOutline" color="primary"></ion-icon>                          
                                &nbsp;Order Summary
                            </div>
                            <div class="cart-detail">
                                <ion-grid>
                                    <ion-row v-for="product of Products" v-bind:key="product">
                                        <ion-col size="2">
                                            <div>
                                                {{ product.quantity }}×
                                            </div>
                                        </ion-col>
                                        <ion-col size="7">
                                            <div>
                                                {{ product.name }}
                                            </div>
                                        </ion-col>
                                        <ion-col size="3">
                                            <div>
                                                ₱ {{ FormatPrice((product.price + product.other) * product.quantity) }}
                                            </div>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                            </div>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-card>
        </ion-content>

        <ion-footer :hidden="Load">
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
                <ion-button v-if="ConfirmAddress == true" mode="ios" expand="full" color="primary" @click="ShowNote()">Set delivery address</ion-button>
                <ion-button v-else-if="FinalAddress == false" mode="ios" expand="full" color="primary" @click="AlertConfirmAddress()">Confirm delivery address</ion-button>
                <ion-button v-else-if="PaymentType == ''" mode="ios" expand="full" color="primary" @click="ShowPayments()">Confirm payment method</ion-button>
                <ion-button v-else mode="ios" expand="full" color="primary" @click="AlertCheck()">Place Order</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { IonContent, IonFooter, IonTitle, IonPage, IonButton, IonBackButton, IonCard, IonGrid, IonRow, IonCol, IonIcon, modalController, alertController } from "@ionic/vue";
import { addOutline, locationOutline, walletOutline, receiptOutline, createOutline } from "ionicons/icons";
import { useRoute } from "vue-router";
import Payments from "./Payments.vue";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonTitle,
        IonPage,
        IonButton,
        IonBackButton,
        IonCard,
        IonFooter,
        IonGrid, 
        IonRow, 
        IonCol,
        IonIcon
    },
    setup() {
        const route = useRoute();
        const cart = route.params.cart;
        const fares = route.params.fares;
        const store = route.params.store;
        const delivery = route.params.delivery;
        const when = route.params.when;
        const storelat = route.params.storelat;
        const storelng = route.params.storelng;
        return {
            cart,
            store,
            fares,
            delivery,
            when,
            storelat,
            storelng,
            addOutline,
            locationOutline,
            receiptOutline,
            walletOutline,
            createOutline
        }
    },
    data() {
        return {
            Payments: [],
            Store: this.store,
            Products: JSON.parse(this.cart),
            Fares: JSON.parse(this.fares),
            Total: 0,
            SubTotal: 0,
            Fare: 0,
            PaymentID: 0,
            FinalAddress: false,
            Load: true,
            ConfirmAddress: true,
            Street: "",
            Area: "",
            PaymentType: "",
            Note: "",
            UserID: "",
            Lat: "",
            Lng: "",
            DirectionsService: "",
            DirectionsDisplay: "",
        }
    },
    ionViewWillEnter() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
        this.FinalAddress = false;
        this.LoadCart();
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
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        LoadCart() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/checkout_detail", {
                userid: this.UserID
            }).then(res => {
                this.Load = false;
                if (res.data.address.length != 0) {
                    this.Street = res.data.address[0].street; 
                    this.Area = res.data.address[0].area;
                    this.Note = res.data.address[0].note;
                    this.Lat = res.data.address[0].latitude;
                    this.Lng = res.data.address[0].longitude;
                    this.ConfirmAddress = false;
                } else {
                    this.ConfirmAddress = true;
                }
                this.Payments = res.data.payment;
                this.SubTotal = 0;
                this.Products.forEach(x => {
                    this.SubTotal += (x.price + x.other) * x.quantity;
                });
                this.DirectionsService = new window.google.maps.DirectionsService;
                this.DirectionsService.route({
                    origin: this.Lat + ", " + this.Lng,
                    destination: this.storelat + ", " + this.storelng,
                    travelMode: 'DRIVING'
                }, (response) => {
                    this.Distance = Math.ceil((response.routes[0].legs[0].distance.text).replace(" km", ""));
                    if (this.Fares[0].minimum_distance < this.Distance) {
                        this.Fare = this.Fares[0].minimum_charge + ((this.Distance - 1) * this.Fares[0].increment_amount);
                    } else {
                        this.Fare = this.Fares[0].minimum_charge;
                    }
                    this.Total = this.SubTotal + Number(this.Fare);
                });
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        async ShowPayments() {
            const modal = await modalController.create({
                component: Payments,
                cssClass: "my-custom-class",
                componentProps: {
                    payment: JSON.stringify(this.Payments),
                },
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data != undefined && data.status == "cdc") {
                this.LoadCart();
                this.PaymentType = "Credit/Debit Card";
            } else if (data != undefined && data.status == "cod") {
                this.LoadCart();
                this.PaymentType = "Cash on Delivery";
            } else if (data != undefined && data.status == "gcash") {
                this.LoadCart();
                this.PaymentType = "Gcash";
            }
            this.PaymentID = data.id;
        },
        ShowNote() {
            this.$router.push({ name: "Delivery", params: { storelat: this.storelat, storelng: this.storelng } });
        },
        PlaceOrder() {
            let distance = this.LatLngToKM(this.storelat, this.storelng, this.Lat, this.Lng);
            if (distance <= 50) {
                Global.methods.Loading();
                axios.post(Global.methods.GetURL() + "/place_order", {
                    userid: this.UserID,
                    paymentid: this.PaymentID,
                    note: this.Note,
                    fare: this.Fare,
                    shipFrom: this.Store,
                    shipTo: this.Street + " " + this.Area,
                    cart: this.cart,
                    lat: this.Lat,
                    lng: this.Lng,
                    delivery: this.delivery,
                    when: this.when,
                }).then(() => {
                    this.$router.replace({ name: "Success" });
                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    setTimeout(() => {
                        Global.methods.Unloading();
                    }, 100);
                });
            } else {
                this.AlertDelivery();
            }
        },
        async AlertCheck() {
            const alert = await alertController.create({
                cssClass: "my-custom-class",
                message: "Do you wish to place your order?",
                buttons: [
                    {
                        text: "No",
                        role: "cancel",
                        cssClass: "secondary"
                    },
                    {
                        text: "Yes",
                        handler: () => {
                            this.PlaceOrder();
                        },
                    },
                ],
            });
            await alert.present();
        },
        async AlertConfirmAddress() {
            const alert = await alertController.create({
                cssClass: "my-custom-class",
                message: "Do you wish to be deliver here?",
                buttons: [
                    {
                        text: "No",
                        role: "cancel",
                        cssClass: "secondary",
                        handler: () => {
                            this.ShowNote();
                        },
                    },
                    {
                        text: "Yes",
                        handler: () => {
                            this.FinalAddress = true;
                        },
                    },
                ],
            });
            await alert.present();
        },
        async AlertDelivery() {
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
    },
})
</script>

<style lang="scss" scoped>
    .footer {
        margin: 5px 5px;
    }
    ion-footer {
        ion-grid ion-row ion-col:nth-child(2) {
            text-align: right;
        }
        ion-grid {
            margin-bottom: 15px;
        }
    }
    ion-item {
        --padding-start: 0 !important;
        --inner-padding-end: 0 !important;
    }
    .delivery {
        padding: 5px;
        ion-grid ion-row {
            ion-col:nth-child(1) {
                .delivery-title {
                    display: block;
                    margin-bottom: 15px;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    color: #000000;
                    ion-icon {
                        font-size: 18px;
                    }
                }
                .delivery-detail {
                    display: block;
                    padding-left: 8px;
                    div {
                        padding: 2px 0;
                        color: #000000;
                    }
                    div:nth-child(1) {
                        font-weight: 600;
                    }
                }
            }
            ion-col:nth-child(2) {
                padding-top: 0;
                display: flex;
                align-items: flex-start;
                div {
                    margin-left: auto;
                    font-size: 24px;
                }
            }
        }
    }
    .payment {
        padding: 5px;
        ion-grid ion-row {
            ion-col:nth-child(1) {
                .payment-title {
                    display: block;
                    margin-bottom: 15px;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    color: #000000;
                    ion-icon {
                        font-size: 18px;
                    }
                }
                .payment-detail {
                    display: block;
                    padding-left: 4px;
                    color: #000000;
                }
            }
            ion-col:nth-child(2) {
                padding-top: 0;
                display: flex;
                align-items: flex-start;
                div {
                    margin-left: auto;
                    font-size: 24px;
                }
            }
        }
    }
    .cart {
        padding: 5px;
        .cart-title {
            display: block;
            margin-bottom: 15px;
            font-size: 16px;
            display: flex;
            align-items: center;
            color: #000000;
            ion-icon {
                font-size: 18px;
            }
        }
        .cart-detail {
            ion-grid ion-row {
                ion-col {
                    color: #000000;
                    display: flex;
                    align-items: flex-start;
                }
                ion-col:nth-child(3) div {
                    margin-left: auto;
                }
            }
        }
    }
</style>