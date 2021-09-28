<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>{{ Title }}</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>
        
        <ion-content>
            <div v-if="Products?.length != 0 && Load == false">
                <ion-card>
                    <ion-card-header>
                        <a href="#" v-if="Express == 'Regular'" @click.prevent="ShowChangeDate()">Change</a>
                        <ion-card-subtitle>Estimated Delivery</ion-card-subtitle>
                        <ion-card-title>{{ DeliveryText }}</ion-card-title>
                    </ion-card-header>
                </ion-card>
                <div class="cart-list">
                    <ion-item v-for="product of Products" v-bind:key="product" lines="full" class="cart-item" button @click.prevent="ShowCartDetail(product.id)">
                        <ion-grid>
                            <ion-row>
                                <ion-col size="2" @click.stop="OpenPopover($event, product)">
                                    <div class="product-quantity">
                                        {{ product.quantity }}×
                                    </div>
                                </ion-col>
                                <ion-col size="7">
                                    <div class="product-name">
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
                    </ion-item>
                </div>
            </div>
            <div v-if="Products?.length == 0 && Load == false">
                <div class="empty ion-text-center">
                    <img src="../assets/EmptyCart.png">
                    <div>
                        <h2>Your cart is currently empty!</h2>
                    </div>
                    <div class="ion-margin-bottom">
                        <small>Click the button below to start browsing.</small>
                    </div>
                    <ion-button mode="ios" color="primary" @click="Browse()">Browse</ion-button>
                </div>
            </div>
        </ion-content>

        <ion-footer v-if="Products?.length != 0 && Load == false">
            <div class="footer">
                <ion-grid>
                    <ion-row>
                        <ion-col>Subtotal</ion-col>
                        <ion-col>₱ {{ FormatPrice(SubTotal) }}</ion-col>
                    </ion-row>
                </ion-grid>
                <ion-button mode="ios" expand="full" color="primary" @click="Checkout()">Checkout</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { IonContent, IonFooter, IonTitle, IonPage, IonButton, IonBackButton, IonCard, IonCardSubtitle, IonCardTitle, IonCardHeader, modalController, popoverController, toastController, alertController } from "@ionic/vue";
import DeliveryTime from "./DeliveryTime.vue";
import CartDetail from "./CartDetail.vue";
import Quantity from "./Quantity.vue";
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
        IonCardSubtitle,
        IonCardTitle,
        IonCardHeader,
        IonFooter
    },
    async ionViewWillEnter() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
        this.LoadCart();
    },
    data() {
        return {
            UserID: "",
            Title: "",
            Products: [],
            Time: 0,
            Distance: "",
            Express: "",
            DeliveryText: "",
            SubTotal: 0,
            Fare: 0,
            Total: 0,
            Fares: [],
            Storelat: "",
            Storelng: "",
            Load: true,
            Open: "",
            Close: "",
            CloseDay: "",
            CurrentTime: ""
        }
    },
    methods: {
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        TimeFormat(time) {
            time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
            if (time.length > 1) {
                time = time.slice (1);
                time[5] = +time[0] < 12 ? ' AM' : ' PM';
                time[0] = +time[0] % 12 || 12;
            }
            return time.join ('');
        },
        LoadCart() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/cart", {
                userid: this.UserID,
            }).then(res => {
                if (res.data.products.length != 0) {
                    this.Load = false;
                    this.SubTotal = 0;
                    this.Products = [];
                    this.CurrentTime = res.data.current_time;
                    this.Open = res.data.store[0].open_time_a;
                    this.Close = res.data.store[0].open_time_b;
                    this.CloseDay = res.data.store[0].close_day;
                    this.Time = res.data.store[0].preparing_time;
                    this.Express = res.data.store[0].delivery_type;
                    if (res.data.store.length != 0) {
                        this.Title = res.data.store[0].name;
                    } else {
                        this.Title = "Cart";
                    }
                    if (this.CloseDay == this.WeekDay()) {
                        this.DeliveryText = "Tomorrow, 8:00";
                    } else {
                        if (this.Open <= this.CurrentTime && this.Close >= this.CurrentTime) {
                            this.DeliveryText = "ASAP (" + this.Time + " Min)";
                        } else {
                            if ("00:00:00" <= this.CurrentTime && this.Open >= this.CurrentTime) {
                                this.DeliveryText = "Today, " + this.Open;
                            }
                            if (this.Close <= this.CurrentTime && '23:59:59' >= this.CurrentTime) {
                                this.DeliveryText = "Tomorrow, 8:00";
                            }
                        }
                    }
                    this.Storelat = res.data.store[0].latitude;
                    this.Storelng = res.data.store[0].longitude;
                    this.Fares = res.data.fares;
                    res.data.products.forEach(x => {
                        if (x.selected_choices != "") {
                            let total = 0;
                            JSON.parse(x.selected_choices).forEach(y => {
                                y.choices.forEach(z => {
                                    if (z.checked == "true") {
                                        total += Number(z.price);
                                    }
                                });
                            });
                            this.Products.push({
                                'id': x.id,
                                'product_id': x.product_id,
                                'name': x.name,
                                'price': x.price,
                                'other': total,
                                'quantity': x.quantity,
                                'selected_choices': x.selected_choices,
                                'availability': x.availability,
                                'instruction': x.instruction,
                            });
                            this.SubTotal += (x.price + total) * x.quantity;
                        } else {
                            this.Products.push({
                                'id': x.id,
                                'product_id': x.product_id,
                                'name': x.name,
                                'price': x.price,
                                'other': 0,
                                'quantity': x.quantity,
                                'selected_choices': x.selected_choices,
                                'availability': x.availability,
                                'instruction': x.instruction,
                            });
                            this.SubTotal += (x.price + 0) * x.quantity;
                        }
                    });
                } else {
                    this.Load = false;
                    this.Title = "Cart";
                    this.SubTotal = 0;
                    this.Products = [];
                }
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        async ShowChangeDate() {
            const modal = await modalController.create({
                component: DeliveryTime,
                cssClass: "my-custom-class"
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data != undefined && data.status == "success") {
                this.DeliveryText = data.delivery;
            }
        },
        async ShowCartDetail(id) {
            const modal = await modalController.create({
                component: CartDetail,
                cssClass: "my-custom-class",
                componentProps: {
                    cartid: id,
                },
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data != undefined && data.status == "success") {
                this.LoadCart();
            }
        },
        async OpenPopover(ev, product) {
            const popover = await popoverController.create({
                component: Quantity,
                cssClass: "my-custom-class",
                event: ev,
                componentProps: {
                    product: JSON.stringify(product),
                },
            });
            await popover.present();

            const { data } = await popover.onDidDismiss();
            if (data != undefined && data.status == "success") {
                this.LoadCart();
            } 
        },
        Checkout() {
            if (this.CloseDay == this.WeekDay()) {
                this.AlertCheck("The restaurant is closed right now, The delivery will continue tomorrow. Would you still like to continue?");
            } else {
                if (this.Open <= this.CurrentTime && this.Close >= this.CurrentTime) {
                    this.$router.push({ name: "Checkout", params: { cart: JSON.stringify(this.Products), store: this.Title, delivery: this.Express, when: this.DeliveryText, storelat: this.Storelat, storelng: this.Storelng, fares: JSON.stringify(this.Fares) }});
                } else {
                    let message;
                    if ("00:00:00" <= this.CurrentTime && this.Open >= this.CurrentTime) {
                        message = "The restaurant is still closed, The restaurant will open later. Would you still like to continue?";
                        this.AlertCheck(message);
                    }
                    if (this.Close <= this.CurrentTime && '23:59:59' >= this.CurrentTime) {
                        message = "The restaurant is now closed, The delivery will continue tomorrow. Would you still like to continue?";
                        this.AlertCheck(message);
                    }
                }
            }
        },
        Browse() {
            this.$router.replace({ name: "Home" });
        },
        async AlertCheck(message) {
            const alert = await alertController.create({
                cssClass: "my-custom-class",
                message: message,
                buttons: [
                    {
                        text: "No",
                        role: "cancel",
                        cssClass: "secondary"
                    },
                    {
                        text: "Yes",
                        handler: () => {
                            this.$router.push({ name: "Checkout", params: { cart: JSON.stringify(this.Products), store: this.Title, delivery: this.Express, when: this.DeliveryText, storelat: this.Storelat, storelng: this.Storelng, fares: JSON.stringify(this.Fares) }});
                        },
                    },
                ],
            });
            await alert.present();
        },
        async openToast(message) {
            const toast = await toastController.create({
                    message: message,
                    duration: 3000,
                    position: "bottom"
                });
            return toast.present();
        },
        WeekDay() {
            let Day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Staturday"];
            return Day[new Date().getDay()];
        },
        Tomorrow() {
            let Day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Staturday"];
            return Day[new Date().getDay() + 1];
        },
    },
})
</script>

<style lang="scss" scoped>
    a {
        position: absolute;
        right: 20px;
        margin-top: 8px;
        z-index: 2;
    }
    .footer {
        margin: 5px 5px;
    }
    .subtotal {
        margin: 10px 8px;
        padding: 0 0 5px 0;
    }
    .cart-list {
        margin: 10px 0 15px 0;
    }
    .cart-item {
        margin: 10px 0 10px 0;
    }
    .cart-list {
        ion-item {
            margin: 0 !important;
            --padding-start: 10px !important;
            --inner-padding-end: 10px !important;
        }
        ion-grid ion-row {
            ion-col:first-child {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                padding: 0 !important;
            }
            ion-col:nth-child(2) {
                display: flex;
                align-items: center;
                padding: 0 !important;
            }
            ion-col:nth-child(3) {
                text-align: right;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                padding: 0 !important;
            }
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
    .empty {
        width: 75%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        img {
            height: 100px;
        }
    }
    .product-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .product-quantity {
        border: 1px solid rgba(158,158,158,0.5);
        padding: 5px 10px;
        background: rgb(245, 245, 245);
    }
</style>