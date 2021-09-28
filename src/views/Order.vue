<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>{{ token }}</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-icon :icon="homeOutline" color="primary"></ion-icon>&nbsp;Store Information
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <b>
                            {{ Store }}
                        </b>
                        <br>
                        <span>
                            {{ Streets }}
                        </span>
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-icon :icon="timerOutline" color="primary"></ion-icon>&nbsp;Shipping Information
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        {{ When }}
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-icon :icon="walletOutline" color="primary"></ion-icon>&nbsp;Payment Method
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        {{ Payment }}
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-icon :icon="receiptOutline" color="primary"></ion-icon>&nbsp;Order Summary
                    </ion-col>
                </ion-row>
                <ion-row v-for="order of Order" v-bind:key="order">
                    <ion-col size="2">
                        {{ order.quantity }}×
                    </ion-col>
                    <ion-col size="7">
                        <span>{{ order.name }}</span><br>
                        <span v-for="(choice, index) of order.selected_choices" v-bind:key="choice">
                            <span v-if="order.selected_choices.length > 1">
                                <small v-if="index != (order.selected_choices.length - 1)">{{ choice + ", " }}</small>
                                <small v-else>{{ " and " + choice + "." }}</small>
                            </span>
                            <span v-else>
                                <small>{{ choice + "." }}</small>
                            </span>
                        </span>
                    </ion-col>
                    <ion-col size="3" class="ion-text-end">
                        ₱ {{ FormatPrice(order.price * order.quantity) }}
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>

        <ion-footer>
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
                <ion-button v-if="Express == 'Express' && Status == 'Pending'" mode="ios" expand="full" disabled>Cancel Order</ion-button>
                <ion-button v-else-if="Express == 'Express' && Status == 'Process'" mode="ios" expand="full" disabled>Cancel Order</ion-button>
                <ion-button v-else-if="Express != 'Express' && Status == 'Pending'" mode="ios" expand="full" @click="CancelOrder()">Cancel Order</ion-button>
                <ion-button v-else mode="ios" expand="full" @click="CheckingCart()">Reorder</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { IonContent, IonFooter, IonTitle, IonPage, IonButton, IonBackButton, IonGrid, IonRow, IonCol, IonIcon, alertController } from "@ionic/vue";
import { receiptOutline, walletOutline, homeOutline, timerOutline } from "ionicons/icons";
import { useRoute } from "vue-router";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonFooter,
        IonTitle,
        IonPage,
        IonButton,
        IonBackButton,
        IonGrid,
        IonRow,
        IonCol,
        IonIcon
    },
    setup() {
        const route = useRoute();
        const orderid = route.params.orderid;
        return {
            receiptOutline,
            walletOutline,
            homeOutline,
            timerOutline,
            orderid,
        }
    },
    data() {
        return {
            Order: [],
            SubTotal: 0,
            Fare: 0,
            Total: 0,
            UserID: "",
            StoreID: "",
            Status: "",
            Express: "",
            Store: "",
            Streets: "",
            Payment: "",
            When: "",
        }
    },
    created() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
    },
    mounted() {
        this.LoadOrder();
    },
    methods: {
        TimeFormat(time) {
            time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
            if (time.length > 1) {
                const timeparts = time.slice(1);
                const meridiem = timeparts[0] < 12 ? ' AM' : ' PM'
                return ('0' + (timeparts[0] % 12 || 12)).slice(-2) + timeparts[1] + timeparts[2] + meridiem;
            }
        },
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        LoadOrder() {
            Global.methods.Loading();
            setTimeout(() => {
                axios.post(Global.methods.GetURL() + "/order_detail", {
                    orderid: this.orderid
                }).then(res => {
                    this.Order = [];
                    this.Payment = res.data[0].type;
                    this.Store = res.data[0].store;
                    this.Streets = res.data[0].streets;
                    this.Fare = res.data[0].fare;
                    this.Status = res.data[0].orderstatus;
                    this.Express = res.data[0].delivery;
                    this.When = typeof (res.data[0].when).split(", ")[1] === "undefined" ? (res.data[0].when).split(", ")[0] : (res.data[0].when).split(", ")[0] + ", " + this.TimeFormat(res.data[0].when.split(", ")[1]);
                    this.StoreID = res.data[0].storeid;
                    res.data.forEach(x => {
                        let total = 0;
                        let text = [];
                        if (x.selected_choices != "") {
                            JSON.parse(x.selected_choices).forEach(y => {
                                y.choices.forEach(z => {
                                    if (z.checked == "true") {
                                        total += Number(z.price);
                                        text.push(z.name);
                                    }
                                });
                            });
                        }
                        this.Order.push({
                            id: x.id,
                            token: x.token,
                            name: x.name,
                            selected_choices: text,
                            price: (x.price + total),
                            quantity: x.quantity,
                            created_at: x.datetime,
                            purchasestatus: x.purchasestatus,
                        });
                        this.SubTotal += (x.price + total) * x.quantity;
                    });
                    this.Total = this.SubTotal + this.Fare;
                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    setTimeout(() => {
                        Global.methods.Unloading();
                    }, 100);
                });
            }, 500);
        },
        async AlertCheckCart() {
            const alert = await alertController.create({
                cssClass: "my-custom-class",
                message: "You have already selected different restaurant. If you continue your cart and selecting well be removed. Do you wish to continue?",
                buttons: [
                    {
                        text: "No",
                        role: "cancel",
                        cssClass: "secondary"
                    },
                    {
                        text: "Yes",
                        handler: () => {
                            this.EmptyCart();
                        },
                    },
                ],
            });
            await alert.present();
        },
        EmptyCart() {
            axios.post(Global.methods.GetURL() + "/cart_empty", {
                userid: this.UserID,
            }).then(res => {
                if (res.data == 1) {
                    this.ReOrder();
                }
            });
        },
        CheckingCart() {
            axios.post(Global.methods.GetURL() + "/check_cart", {
                userid: this.UserID,
                storeid: this.StoreID,
            }).then(res => {
                if (res.data == 0) {
                    this.ReOrder();
                } else {
                    this.AlertCheckCart();
                }
            }).catch(err => {
                console.log(err);
            });
        },
        ReOrder() {
            axios.post(Global.methods.GetURL() + "/re_oder", {
                orderid: this.orderid
            }).then(res => {
                if (res.data == 1) {
                    this.$router.replace({ name: "Cart" });
                }
            }).catch(err => {
                console.log(err);
            });
        },
        CancelOrder() {
            axios.post(Global.methods.GetURL() + "/cancel_order", {
                orderid: this.orderid
            }).then(res => {
                if (res.data == 1) {
                    this.LoadOrder();
                }
            }).catch(err => {
                console.log(err);
            });
        },
    },
})
</script>

<style lang="scss" scoped>
    .footer {
        margin: 5px 5px;
    }
    ion-content ion-grid {
        margin: 10px;
        padding: 5px;
        border: 1px solid rgb(190, 190, 190);
        ion-row:first-child ion-col {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            font-size: 16px;
            text-transform: uppercase;
            font-weight: 600;
        }
    }
    ion-footer {
        ion-grid ion-row ion-col:nth-child(2) {
            text-align: right;
        }
        ion-grid {
            margin-bottom: 15px;
        }
    }
</style>