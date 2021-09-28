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
                    <ion-label position="floating">New Password</ion-label>
                    <ion-input :type="EyePass" v-model="NewPassword"></ion-input>
                    <ion-button class="eyebtn" @click.self="ShowHidePass()">
                        <ion-icon slot="icon-only" :icon="EyeIcon" color="primary"></ion-icon>
                    </ion-button>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Confirm Password</ion-label>
                    <ion-input :type="EyePass" v-model="ConfirmPassword"></ion-input>
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
import { useRoute } from "vue-router";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";

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
    },
    setup() {
        const route = useRoute();
        const mobile = route.params.verify;
        return {
            mobile,
            eyeOutline,
            eyeOffOutline
        }
    },
    data() {
        return {
            EyeIcon: this.eyeOffOutline,
            EyeStatus: false,
            EyePass: "password",
            NewPassword: "",
            ConfirmPassword: "",
        }
    },
    methods: {
        ProceedToVerify() {
            if (this.NewPassword != "" && this.ConfirmPassword != "") {
                if (this.NewPassword.length >= 8) {
                    if (this.ConfirmPassword == this.NewPassword) {
                        this.$router.push({ name: "VerifyCodeForgotPassword", params: { password: this.NewPassword }});
                    } else {
                        this.openToast("Confirm password must be the same to your new password.");
                    }
                } else {
                    this.openToast("Password must be 8 characters.");
                }
            } else {
                this.openToast("Please fill the empty fields.");
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
        top: 11px;
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