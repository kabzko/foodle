<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
               <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>Help Center</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content>
            <!-- <ion-list v-if="OpenTicket.length != 0">
                <ion-list-header>
                    Open Tickets
                </ion-list-header>
                <ion-item button v-for="(ticket, index) of OpenTicket" :key="ticket + index" @click="GotoChatbox(ticket.id)">
                    <ion-icon slot="start" :icon="logoWechat" color="primary"></ion-icon>
                    <ion-label>
                        <p>({{ ticket.ticket_number }}) {{ ticket.title }}</p>
                    </ion-label>
                </ion-item>
            </ion-list> -->
            <ion-list>
                <ion-list-header>
                    Contact Us
                </ion-list-header>
                <!-- <ion-item button @click="SubmitTicket('Can`t find my account')">
                    <ion-icon slot="start" :icon="chatboxEllipses" color="primary"></ion-icon>
                    <ion-label>
                        <p>Can`t find my account</p>
                    </ion-label>
                </ion-item> -->
                <ion-item button @click="GotoMessenger()">
                    <ion-icon slot="start" :icon="logoWechat" color="tertiary"></ion-icon>
                    <ion-label>
                        <p>Messenger</p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonTitle, IonBackButton, IonList, IonListHeader, IonItem, IonLabel, IonIcon } from "@ionic/vue";
import { logoWechat } from "ionicons/icons";
import Global from "../components/Global";
import axios from "axios";

export default ({
    components: {
        IonPage, 
        IonContent, 
        IonTitle, 
        IonBackButton,
        IonList, 
        IonListHeader, 
        IonItem, 
        IonLabel, 
        IonIcon
    },
    setup() {
        return {
            logoWechat,
        }
    },
    data() {
        return {
            OpenTicket: [],
            UserID: "",
        }
    },
    created() {
        this.UserID = JSON.parse(localStorage.users)[0].id;
    },
    // mounted() {
    //     this.LoadOpenTickets();
    // },
    methods: {
        LoadOpenTickets() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/load_open_ticket", {
                userid: this.UserID,
            }).then(res => {
                this.OpenTicket = res.data;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        GotoChatbox(id) {
            this.$router.push({name: "ChatBox", params: { ticketid: id }});
        },
        SubmitTicket(title) {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/submit_ticket", {
                ticketno: new Date().getTime(),
                title: title,
                userid: this.UserID,
            }).then(res => {
                this.$router.push({name: "ChatBox", params: { ticketid: res.data }});
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        GotoMessenger() {
            window.open("https://m.me/foodlephilippines");
        },
    },
})
</script>

<style lang="scss" scoped>
    ion-list-header {
        font-weight: 600;
    }
</style>