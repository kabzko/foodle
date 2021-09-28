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
                    <ion-button @click="ProceedToVerify()" mode="ios" color="primary">
                        Save
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <div class="info">
                <ion-item lines="none">
                    <ion-label position="floating">Mobile</ion-label>
                    <mask-input refid="simnumber" mask="tel" input="numeric" readonly></mask-input>
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
import { IonContent, IonPage, IonButtons, IonButton, IonItem, IonInput, IonBackButton, IonLabel, IonIcon, toastController } from "@ionic/vue";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import Global from "../components/Global";
import axios from "axios";
import MaskInput from "../components/MaskInput.vue";

export default({
    components: {
        IonPage,
        IonContent,
        IonItem,
        IonLabel,
        IonButton,
        IonButtons,
        IonIcon,
        IonInput,
        IonBackButton,
        MaskInput
    },
    setup() {
        return {
            eyeOutline,
            eyeOffOutline
        }
    },
    data() {
        return {
            EyeIcon: this.eyeOffOutline,
            EyeStatus: false,
            EyePass: "password",
            Firstname: "",
            Lastname: "",
            Password: "",
            UserID: ""
        }
    },
    created() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
        this.LoadUserProfile();
    },
    methods: {
        LoadUserProfile() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/user", {
                userid: this.UserID
            }).then(res => {
                this.Firstname = res.data[0].firstname;
                this.Lastname = res.data[0].lastname;
                document.getElementById("simnumber").value = res.data[0].phone_number;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        ProceedToVerify() {
            if (this.Firstname != "") {
                if (this.Lastname != "") {
                    if (this.Password != "") {
                        if (this.Password.length >= 8) {
                            this.$router.push({ name: "VerifyAccount", params: { mobile: MaskInput.methods.getData("simnumber"), firstname: this.Firstname, lastname: this.Lastname, password: this.Password } });
                        } else {
                            this.openToast("Password must be 8 minimum character.");
                        }
                    } else {
                        this.$router.push({ name: "VerifyAccount", params: { mobile: MaskInput.methods.getData("simnumber"), firstname: this.Firstname, lastname: this.Lastname, password: this.Password } });
                    }
                } else {
                    this.openToast("Lastname cannot be empty.");
                }
            } else {
                this.openToast("Firstname cannot be empty.");
            }
        },
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
        async openToast(message) {
            const toast = await toastController.create({
                    message: message,
                    duration: 3000,
                    position: "bottom"
                });
            return toast.present();
        }
    }
})
</script>

<style lang="scss" scoped>
    .info {
        margin: 15px;
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