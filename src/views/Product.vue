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
            </div>
            <div class="col-3">
            </div>
        </header>
        
        <ion-content>
            <div class="productimage">
                <img :src="Avatar">
            </div>
            <ion-card-header>
                <ion-card-title>{{ Product.name }}</ion-card-title>
                <ion-card-subtitle>₱ {{ FormatPrice(Product.price) }}</ion-card-subtitle>
            </ion-card-header>
            <hr v-if="Product.description != ''">
            <div class="description" v-if="Product.description != ''">
                <span>{{ Product.description }}</span>
            </div>
            <div class="choices" v-if="Choices != null">
                <ion-list v-for="choice of Choices" v-bind:key="choice">
                    <div v-if="choice.mode == 'radio'">
                        <ion-radio-group v-if="choice.status == 'Required'" :id="(choice.title + choice.mode).replace(/\s/g, '').toLowerCase()">
                            <ion-list-header>
                                <ion-label>
                                    {{ choice.title }}<small>({{ choice.status }})</small>
                                </ion-label>
                            </ion-list-header>
                            <div>
                                <ion-item lines="none" v-for="item of choice.choices" v-bind:key="item">
                                    <ion-label>
                                        <span>{{ item.name }}</span><br>
                                        <small>+ ₱ {{ FormatPrice(item.price) }}</small>
                                    </ion-label>
                                    <ion-radio v-if="item.checked == 'true'" slot="start" checked color="primary"></ion-radio>
                                    <ion-radio v-else slot="start" :value="item.name" color="primary"></ion-radio>
                                </ion-item>
                            </div>
                        </ion-radio-group>
                        <ion-radio-group v-else :id="(choice.title + choice.mode).replace(/\s/g, '').toLowerCase()" allow-empty-selection>
                            <ion-list-header>
                                <ion-label>
                                    {{ choice.title }}<small>({{ choice.status }})</small>
                                </ion-label>
                            </ion-list-header>
                            <div>
                                <ion-item lines="none" v-for="item of choice.choices" v-bind:key="item">
                                    <ion-label>
                                        <span>{{ item.name }}</span><br>
                                        <small>+ ₱ {{ FormatPrice(item.price) }}</small>
                                    </ion-label>
                                    <ion-radio v-if="item.checked == 'true'" slot="start" checked color="primary"></ion-radio>
                                    <ion-radio v-else slot="start" :value="item.name" color="primary"></ion-radio>
                                </ion-item>
                            </div>
                        </ion-radio-group>
                    </div>
                    <div v-else>
                        <ion-list-header>
                            <ion-label>
                                {{ choice.title }}<small>({{ choice.status }})</small>
                            </ion-label>
                        </ion-list-header>
                        <ion-item lines="none" v-for="item of choice.choices" v-bind:key="item">
                            <ion-label>
                                <span>{{ item.name }}</span><br>
                                <small>+ ₱ {{ FormatPrice(item.price) }}</small>
                            </ion-label>
                            <ion-checkbox :class="(choice.title + choice.mode).replace(/\s/g, '').toLowerCase()" slot="start" :value="item.name" color="primary"></ion-checkbox>
                        </ion-item>
                    </div>
                </ion-list>
            </div>
            <div class="instruct">
                <ion-radio-group v-model="Availability">
                    <ion-list>
                        <ion-list-header>
                            Availability
                        </ion-list-header>
                    </ion-list>
                    <ion-item lines="none">
                        <ion-label>Remove it from my order if none</ion-label>
                        <ion-radio slot="start" value="Remove it from my order if none"></ion-radio>
                    </ion-item>
                    <ion-item lines="none">
                        <ion-label>Cancel the entire order if none</ion-label>
                        <ion-radio slot="start" value="Cancel the entire order if none"></ion-radio>
                    </ion-item>
                    <ion-item lines="none" v-if="Choices.length != 0">
                        <ion-label>Call me if none</ion-label>
                        <ion-radio slot="start" value="Call me if none"></ion-radio>
                    </ion-item>
                </ion-radio-group>
                <ion-list v-if="Choices.length != 0">
                    <ion-list-header>
                        Special Instructions
                    </ion-list-header>
                    <ion-textarea v-model="Instruction" placeholder="eg. I`m allergic to mayo or etc."></ion-textarea>
                </ion-list>
            </div>
            <div class="addcart">
                <ion-grid>
                    <ion-row>
                        <ion-col>
                            <ion-item lines="none">
                                <ion-input class="ion-text-center" v-model="Quantity"></ion-input>
                            </ion-item>
                        </ion-col>
                        <ion-col>
                            <ion-button mode="ios" expand="full" @click="CheckingCart()" color="primary">Add to Cart</ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonButtons, IonIcon, IonCardSubtitle, IonCardTitle, IonCardHeader, IonButton, IonList, IonRadio, IonRadioGroup, IonTextarea, IonInput, alertController, modalController } from "@ionic/vue";
import { closeOutline } from "ionicons/icons";
import Global from "../components/Global";
import axios from "axios";
import Login from "../views/Login";

export default({
    components: {
        IonContent,
        IonPage,
        IonCardSubtitle,
        IonCardTitle,
        IonCardHeader,
        IonButton,
        IonButtons,
        IonIcon,
        IonList,
        IonRadio, 
        IonTextarea,
        IonRadioGroup,
        IonInput
    },
    props: {
        storeid: String,
        productid: String,
    },
    setup() {
        return {
            closeOutline,
        }
    },
    data() {
        return {
            Product: [],
            Choices: [],
            UserID: "",
            Quantity: 1,
            Cart: "",
            Availability: "Remove it from my order if none",
            Instruction: "",
            Avatar: ""
        }
    },
    created() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
    },
    mounted() {
        this.LoadProduct();
    },
    methods: {
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        LoadProduct() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/product_detail", {
                userid: this.UserID,
                productid: this.productid
            }).then(res => {
                this.Cart = res.data.cart;
                if (res.data.product[0].choices != "") {
                    this.Choices = JSON.parse(res.data.product[0].choices);
                }
                this.Product = res.data.product[0];
                this.Avatar = res.data.product[0].image;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
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
                    this.AddToCart();
                }
            });
        },
        CheckingCart() {
            axios.post(Global.methods.GetURL() + "/check_cart", {
                userid: this.UserID,
                storeid: this.storeid,
            }).then(res => {
                if (res.data == 0) {
                    this.AddToCart();
                } else {
                    this.AlertCheckCart();
                }
            }).catch(err => {
                console.log(err);
            });
        },
        AddToCart() {
            if (this.UserID != "") {
                Global.methods.Loading();
                if (this.Choices.length == 0) {
                    setTimeout(() => {
                        axios.post(Global.methods.GetURL() + "/product_addcart", {
                            userid: this.UserID,
                            productid: this.productid,
                            choices: "",
                            quantity: this.Quantity,
                            availability: this.Availability,
                            instruction: ""
                        }).then(res => {
                            Global.methods.Unloading();
                            if (res.data == 1) {
                                setTimeout(() => {
                                    modalController.dismiss({
                                        status: "success"
                                    });
                                }, 100);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    }, 500);
                } else {
                    this.Choices.forEach(choiceelement => {
                        if (choiceelement.mode == "radio") {
                            if (document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value == undefined) {
                                choiceelement.choices.forEach(element => {
                                    choiceelement.choices.find(x => x.name == element.name).checked = "false";
                                });
                            } else if (document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value != undefined && document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value != "") {
                                choiceelement.choices.find(x => x.name == document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value).checked = "true";
                                choiceelement.choices.forEach(element => {
                                    if (element.name != document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value) {
                                        choiceelement.choices.find(x => x.name == element.name).checked = "false";
                                    }
                                });
                            } else {
                                // Nothing
                            }
                        } else {
                            const inputElements = document.getElementsByClassName((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase());
                            inputElements.forEach(selectedelement => {
                                if (selectedelement.checked) {
                                    choiceelement.choices.find(x => x.name == selectedelement.value).checked = "true";
                                } else {
                                    choiceelement.choices.find(x => x.name == selectedelement.value).checked = "false";
                                }   
                            });
                        }
                    });
                    setTimeout(() => {
                        axios.post(Global.methods.GetURL() + "/product_addcart", {
                            userid: this.UserID,
                            productid: this.productid,
                            choices: JSON.stringify(this.Choices),
                            quantity: this.Quantity,
                            availability: this.Availability,
                            instruction: this.Instruction
                        }).then(res => {
                            Global.methods.Unloading();
                            if (res.data == 1) {
                                setTimeout(() => {
                                    modalController.dismiss({
                                        status: "success"
                                    });
                                }, 100);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    }, 500);
                }
            } else {
                this.ShowLoginFloat();
            }
        },
        async ShowLoginFloat() {
            const modal = await modalController.create({
                component: Login,
                cssClass: "login-view-class",
            });
            await modal.present();
        },
        CloseModal() {
            modalController.dismiss();
        },
    },
})
</script>

<style lang="scss" scoped>
    .productimage {
        margin: 10px;
    }
    .addcart {
        margin: 20px 10px;
    }
    .description {
        margin: 20px 15px;
    }
    .description span {
        font-size: 12px;
        color: rgb(110, 110, 110);
    }
    ion-card-subtitle {
        --color: rgb(80, 80, 80);
    }
    ion-list-header {
        padding: 0 !important;
        border-bottom: 1px solid #c8c7cc;
        font-size: 16px !important;
    }
    ion-list-header ion-label {
        margin: 6px 0 !important;
    }
    ion-card-header {
        padding: 16px 11px 0 11px;
    }
    .choices, .instruct {
        margin: 0 12px;
    }
    ion-badge {
        position: absolute;
        right: 8px;
        bottom: 8px;
        font-size: 10px;
        --padding-top: 3px !important;
        --padding-bottom: 2px !important;
        --padding-start: 4px !important;
        --padding-end: 4px !important;
    }
    ion-grid ion-row ion-col {
        display: flex;
        align-items: center;
        ion-item {
            border: 1px solid #c8c7cc;
            border-radius: 10px;
            margin: 10px 0;
        }
    }
    ion-grid ion-row ion-col:nth-child(2) {
        ion-button {
            width: 100%;
        }
    }
</style>