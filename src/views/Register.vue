<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button @click="Register()" mode="ios" color="primary">
                        Register
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <div class="info">
                <ion-item lines="none">
                    <ion-label position="floating">Mobile</ion-label>
                    <ion-input v-model="Simnumber" readonly></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Firstname</ion-label>
                    <ion-input type="text" v-model="Firstname"></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Lastname</ion-label>
                    <ion-input type="text" v-model="Lastname"></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Password</ion-label>
                    <ion-input :type="EyePass" v-model="Password"></ion-input>
                    <ion-button class="eyebtn" @click.self="ShowHidePass()">
                        <ion-icon slot="icon-only" :icon="EyeIcon" color="primary"></ion-icon>
                    </ion-button>
                </ion-item>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonButtons, IonButton, IonItem, IonInput, IonBackButton, IonIcon, toastController } from "@ionic/vue";
import { useRoute } from "vue-router";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonPage,
        IonButton,
        IonButtons,
        IonItem,
        IonBackButton,
        IonInput,
        IonIcon
    },
    setup() {
        const route = useRoute();
        const mobile = route.params.mobile;
        return {
            mobile,
            eyeOutline,
            eyeOffOutline
        }
    },
    data() {
        return {
            Simnumber: this.mobile,
            EyeIcon: this.eyeOffOutline,
            EyeStatus: false,
            EyePass: "password",
            Firstname: "",
            Lastname: "",
            Password: ""
        }
    },
    methods: {
        ShowHidePass() {
            if (this.EyeStatus == false) {
                this.EyeStatus = true;
                this.EyeIcon = this.eyeOutline;
                this.EyePass = "text";
            } else {
                this.EyeStatus = false;
                this.EyeIcon = this.eyeOffOutline;
                this.EyePass = "password";
            }
        },
        Register() {
            if (this.Password.length >= 8) {
                Global.methods.Loading();
                axios.post(Global.methods.GetURL() + "/register", {
                    mobile: ((this.Simnumber.replace(/[()]/g, "")).replace(/\s/g, "")).replace("+", ""),
                    firstname: this.Firstname,
                    lastname: this.Lastname,
                    password: this.Password
                }).then(res => {
                    localStorage.users = JSON.stringify(res.data);
                    setTimeout(() => {
                        location.replace("/");
                    }, 250);
                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    Global.methods.Unloading();
                });
            } else {
                this.openToast("This feature is still on development, Sorry for the inconvenience.");
            }
        },
        async openToast(message) {
            const toast = await toastController.create({
                    message: message,
                    duration: 3000
                });
            return toast.present();
        },
    }
})
</script>

<style lang="scss" scoped>
    .info {
        padding: 16px 16px;
        ion-item {
            border: 1px solid #c8c7cc;
            border-radius: 10px;
            margin: 10px 0;
        }
    }
    .eyebtn {
        position: absolute;
        right: 15px;
        top: 17px;
        padding: 0 !important;
        --background: transparent;
        z-index: 2;
        --padding-start: 0;
        --padding-end: 0;
        --padding-top: 0;
        --padding-bottom: 0;
        --box-shadow: 0;
    }
</style>