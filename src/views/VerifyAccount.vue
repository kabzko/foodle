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
                    <ion-button @click="VerifyCode()" mode="ios" color="primary">
                        Confirm
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <div class="container">
                <div class="ion-text-center">
                    <p>Your verification code is sent by SMS to</p>
                    <p>{{ Simnumber }}</p>
                </div>
                <div>
                    <ion-item lines="none" class="ion-text-center">
                        <mask-input refid="verifycode" mask="cpf" input="numeric" ph="* * * * * *"></mask-input>
                    </ion-item>
                </div>
                <div class="ion-text-center">
                    <p v-if="Countdown == false">Did not receive the code? <a href="#" @click.prevent="SendCode()">Resend</a></p>
                    <p v-if="Countdown == true">Please wait {{ Timeout }}s to resend</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonButtons, IonButton, IonBackButton, IonItem } from "@ionic/vue";
import { useRoute } from "vue-router";
import MaskInput from "../components/MaskInput.vue";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonPage,
        IonButton,
        IonButtons,
        IonBackButton,
        IonItem, 
        MaskInput
    },
    setup() {
        const route = useRoute();
        const mobile = route.params.mobile;
        const firstname = route.params.firstname;
        const lastname = route.params.lastname;
        const password = route.params.password;
        return {
            mobile,
            firstname,
            lastname,
            password
        }
    },
    data() {
        return {
            GeneratedCode: 123456,
            Simnumber: this.mobile,
            UserID: "",
            Timeout: 60,
            Countdown: true
        }
    },
    mounted() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
        this.SendCode();
    },
    methods: {
        SendCode() {
            this.Timeout = 60;
            this.Countdown = true;
            let timer = setInterval(() => {
                this.Timeout = this.Timeout - 1;
                if (this.Timeout == 0) {
                    this.Countdown = false;
                    clearInterval(timer);
                }
            }, 1000);
            this.GeneratedCode = (Math.floor(Math.random() * 9999999) + 100000).toString().substring(0, 6);
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/send_code", {
                mobile: ((this.Simnumber.replace(/[()]/g, '')).replace(/\s/g, '')).replace('+', ''),
                code: this.GeneratedCode
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                Global.methods.Unloading();
            });
        },
        VerifyCode() {
            if (MaskInput.methods.getData("verifycode").replace(/\s/g, "") == this.GeneratedCode) {
                Global.methods.Loading();
                axios.post(Global.methods.GetURL() + "/user_update", {
                    userid: this.UserID,
                    firstname: this.firstname,
                    lastname: this.lastname,
                    password: this.password
                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    this.$router.back();
                    Global.methods.Unloading();
                });
            }
        }
    }
})
</script>

<style scoped>
    .container {
        margin: 50px 0;
    }
    #verifycode {
        font-size: 30px;
    }
</style>