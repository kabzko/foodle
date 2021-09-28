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
                    <ion-button @click="Login()" mode="ios" color="primary">
                        Login
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <div class="password">
                <ion-item lines="none">
                    <ion-label position="floating">Password</ion-label>
                    <ion-input :type="EyePass" v-model="Password"></ion-input>
                    <ion-button class="eyebtn" @click.self="ShowHidePass()">
                        <ion-icon slot="icon-only" :icon="EyeIcon" color="primary"></ion-icon>
                    </ion-button>
                </ion-item>
                <div class="ion-text-center ion-margin-top">
                    <router-link :to="{ name: 'ForgotPassword' }">Forgot Password?</router-link>
                </div>
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
        Login() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/login", {
                mobile: ((this.Simnumber.replace(/[()]/g, "")).replace(/\s/g, "")).replace("+", ""),
                password: this.Password
            }).then(res => {
                if (res.data != 0) {
                    localStorage.users = JSON.stringify(res.data);
                    setTimeout(() => {
                        location.replace("/");
                    }, 250);
                } else {
                    this.openToast("Credentials not found.");
                    this.Password = "";
                }
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                Global.methods.Unloading();
            });
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

<style scoped>
    .password {
        padding: 16px 16px;
    }
    .password ion-item {
        border: 1px solid #c8c7cc;
        border-radius: 10px;
    }
    .eyebtn {
        position: absolute;
        right: 15px;
        top: 15px;
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