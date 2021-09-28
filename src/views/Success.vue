<template>
    <ion-page>
        <ion-content>
            <div class="success ion-text-center">
                <img src="../assets/Success.png">
                <p>Order has been successfully placed!</p>
                <ion-button mode="ios" color="primary" @click="Browse()">Browse</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonButton } from "@ionic/vue";

export default({
    components: {
        IonPage,
        IonContent,
        IonButton
    },
    methods: {
        Browse() {
            this.$router.replace({ name: "Orders", params: { status: "success" }});
        }
    },
})
</script>

<style lang="scss" scoped>
    .success {
        width: 75%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        img {
            height: 100px;
        }
    }
</style>