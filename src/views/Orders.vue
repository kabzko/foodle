<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button v-if="status == 'success'" default-href="/" @click="() => $router.replace('/')" color="primary"></ion-back-button>
                <ion-back-button v-else default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>Orders</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>
        
        <ion-content>
            <ion-list v-if="ActiveOrders?.length != 0">
                <ion-list-header>
                    Active orders
                </ion-list-header>
                <ion-card v-for="order of ActiveOrders" v-bind:key="order" @click="GotoOrder(order.id)">
                    <img :src="order.orderbanner" />
                    <div class="time-box">
                        {{ order.created_at }}
                    </div>
                    <ion-grid>
                        <ion-row>
                            <ion-col>
                                Order ID: {{ order.token }}
                            </ion-col>
                            <ion-col>
                                {{ order.when }}
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                ₱ {{ FormatPrice(order.price + order.fare) }}
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-card>
            </ion-list>
            <ion-list v-if="PastOrders?.length != 0">
                <ion-list-header>
                    Past orders
                </ion-list-header>
                <ion-card v-for="order of PastOrders" v-bind:key="order" @click="GotoOrder(order.id)">
                    <img :src="order.orderbanner" />
                    <div class="time-box">
                        {{ order.created_at }}
                    </div>
                    <ion-grid>
                        <ion-row>
                            <ion-col>
                                Order ID: {{ order.token }}
                            </ion-col>
                            <ion-col>
                                {{ order.when }}
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                ₱ {{ FormatPrice(order.price + order.fare) }}
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-card>
            </ion-list>
            <div v-if="ActiveOrders?.length == 0 && PastOrders?.length == 0">
                <div class="empty ion-text-center">
                    <img src="../assets/EmptyOrder.png">
                    <div>
                        <h2>You don't have any orders yet!</h2>
                    </div>
                    <div class="ion-margin-bottom">
                        <small>Click the button below to start browsing.</small>
                    </div>
                    <ion-button mode="ios" color="primary" @click="Browse()">Browse</ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonTitle, IonBackButton, IonList, IonListHeader } from "@ionic/vue";
import { useRoute } from "vue-router";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent, 
        IonPage, 
        IonTitle, 
        IonBackButton, 
        IonList, 
        IonListHeader
    },
    setup() {
        const route = useRoute();
        const status = route.params.status;
        return {
            status,
        }
    },
    data() {
        return {
            UserID: "",
            ActiveOrders: [],
            PastOrders: []
        }
    },
    created() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
    },
    ionViewWillEnter() {
        if (this.PastOrders.length == 0) {
            this.LoadOrders();
        } else {
            this.Reload();
        }
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
        LoadOrders() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/orders", {
                userid: this.UserID
            }).then(res => {
                this.ActiveOrders = [];
                this.PastOrders = [];
                res.data.active.forEach(x => {
                    let total = 0;
                    if (x.selected_choices != "") {
                        JSON.parse(x.selected_choices).forEach(y => {
                            y.choices.forEach(z => {
                                if (z.checked == "true") {
                                    total += Number(z.price);
                                }
                            });
                        });
                    }
                    if (this.ActiveOrders.filter(s => s.id == x.id).length == 0) {
                        this.ActiveOrders.push({
                            id: x.id,
                            name: x.name,
                            token: x.token,
                            price: (x.price + total) * x.quantity,
                            created_at: x.datetime,
                            fare: x.fare,
                            express: x.delivery,
                            when: typeof x.when.split(", ")[1] === "undefined" ? x.when.split(", ")[0] : x.when.split(", ")[0] + ", " + this.TimeFormat(x.when.split(", ")[1]),
                            orderbanner: x.orderbanner
                        });
                    } else {
                        this.ActiveOrders.filter(s => s.id == x.id)[0].price = this.ActiveOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                    }
                });
                res.data.past.forEach(x => {
                    let total = 0;
                    if (x.selected_choices != "") {
                        JSON.parse(x.selected_choices).forEach(y => {
                            y.choices.forEach(z => {
                                if (z.checked == "true") {
                                    total += Number(z.price);
                                }
                            });
                        });
                    }
                    if (this.PastOrders.filter(s => s.id == x.id).length == 0) {
                        this.PastOrders.push({
                            id: x.id,
                            name: x.name,
                            token: x.token,
                            price: (x.price + total) * x.quantity,
                            created_at: x.datetime,
                            fare: x.fare,
                            when: typeof x.when.split(", ")[1] === "undefined" ? x.when.split(", ")[0] : x.when.split(", ")[0] + ", " + this.TimeFormat(x.when.split(", ")[1]),
                            orderbanner: x.orderbanner
                        });
                    } else {
                        this.PastOrders.filter(s => s.id == x.id)[0].price = this.PastOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                    }
                });
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        Reload() {
            axios.post(Global.methods.GetURL() + "/orders", {
                userid: this.UserID
            }).then(res => {
                this.ActiveOrders = [];
                this.PastOrders = [];
                res.data.active.forEach(x => {
                    let total = 0;
                    if (x.selected_choices != "") {
                        JSON.parse(x.selected_choices).forEach(y => {
                            y.choices.forEach(z => {
                                if (z.checked == "true") {
                                    total += Number(z.price);
                                }
                            });
                        });
                    }
                    if (this.ActiveOrders.filter(s => s.id == x.id).length == 0) {
                        this.ActiveOrders.push({
                            id: x.id,
                            name: x.name,
                            token: x.token,
                            price: (x.price + total) * x.quantity,
                            created_at: x.datetime,
                            fare: x.fare,
                            express: x.delivery,
                            when: typeof x.when.split(", ")[1] === "undefined" ? x.when.split(", ")[0] : x.when.split(", ")[0] + ", " + this.TimeFormat(x.when.split(", ")[1]),
                            orderbanner: x.orderbanner
                        });
                    } else {
                        this.ActiveOrders.filter(s => s.id == x.id)[0].price = this.ActiveOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                    }
                });
                res.data.past.forEach(x => {
                    let total = 0;
                    if (x.selected_choices != "") {
                        JSON.parse(x.selected_choices).forEach(y => {
                            y.choices.forEach(z => {
                                if (z.checked == "true") {
                                    total += Number(z.price);
                                }
                            });
                        });
                    }
                    if (this.PastOrders.filter(s => s.id == x.id).length == 0) {
                        this.PastOrders.push({
                            id: x.id,
                            name: x.name,
                            token: x.token,
                            price: (x.price + total) * x.quantity,
                            created_at: x.datetime,
                            fare: x.fare,
                            when: typeof x.when.split(", ")[1] === "undefined" ? x.when.split(", ")[0] : x.when.split(", ")[0] + ", " + this.TimeFormat(x.when.split(", ")[1]),
                            orderbanner: x.orderbanner
                        });
                    } else {
                        this.PastOrders.filter(s => s.id == x.id)[0].price = this.PastOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                    }
                });
            }).catch(err => {
                console.log(err);
            })
        },
        GotoOrder(id) {
            this.$router.push({ name: "Order", params: { orderid: id } });
        },
        Browse() {
            this.$router.replace({ name: "Home" });
        },
    },
})
</script>

<style lang="scss" scoped>
    ion-list-header {
        font-weight: 600;
        font-size: 18px;
    }
    ion-card {
        margin: 0px 10px 10px 10px;
        img {
            display: block;
        }
    }
    ion-grid {
        ion-row:nth-child(1) ion-col {
            font-size: 16px;
            font-weight: 600;
            color: black;
        }
        ion-row:nth-child(2) ion-col {
            font-size: 16px;
            font-weight: 600;
            color: red;
        }
        ion-row:nth-child(1) ion-col:nth-child(1) {
            display: flex;
            align-items: center;
        }
        ion-row:nth-child(1) ion-col:nth-child(2) {
            display: flex;
            align-items: center;
            justify-content: flex-end !important;
        }
    }
    .time-box {
        position: absolute;
        right: 10px;
        top: 10px;
        background: white;
        border-radius: 5px;
        padding: 5px 5px 2px 5px;
        color: black;
        font-weight: 600;
    }
    .empty {
        width: 75%;
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        img {
            height: 160px;
        }
    }
</style>