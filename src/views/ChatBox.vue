<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
               <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>{{ "(" + TicketNo + ") " + Title }}</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content>
            <ion-grid>
                <ion-row v-for="(chat, index) of Chats" :key="chat + index">
                    <ion-col size="6">
                        <div v-if="chat.user_id == null">
                            {{ chat.message }}
                        </div>
                    </ion-col>
                    <ion-col size="6">
                        <div v-if="chat.user_id == UserID">
                            {{ chat.message }}
                        </div>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>

        <ion-footer>
            <div v-if="Status == 2">
                This conversation has been closed.
            </div>
            <div v-if="Status == 1">
                <ion-grid>
                    <ion-row>
                        <ion-col size="6">
                            <ion-item>
                                <ion-input type="text" v-model="Message"></ion-input>
                            </ion-item>
                        </ion-col>
                        <ion-col size="6">
                            <ion-button :disabled="SendBtnStatus" expand="full" color="primary" @click="SendMessage()">
                                Send
                            </ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonFooter, IonTitle, IonBackButton, IonGrid, IonRow, IonCol, IonItem, IonInput } from "@ionic/vue";
import { useRoute } from "vue-router";
import Global from "../components/Global";
import axios from "axios";

export default ({
    components: {
        IonPage, 
        IonContent, 
        IonFooter, 
        IonTitle, 
        IonBackButton, 
        IonGrid, 
        IonRow, 
        IonCol,
        IonItem,
        IonInput,
    },
    setup() {
        const route = useRoute();
        const ticketid = route.params.ticketid;
        return {
            ticketid,
        }
    },
    data() {
        return {
            Chats: [],
            SendBtnStatus: true,
            LoadStatus: false,
            UserID: "",
            Title: "",
            Message: "",
            TicketNo: "",
            Interval: "",
            Status: "",
        }
    },
    created() {
        this.UserID = JSON.parse(localStorage.users)[0].id;
    },
    mounted() {
        this.LoadChats();
        setTimeout(() => {
            this.LoopLoad();
        }, 1000);
    },
    unmounted() {
        clearInterval(this.Interval);
    },
    methods: {
        LoadChats() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/load_chatbox", {
                ticketid: this.ticketid,
            }).then(res => {
                this.Chats = res.data;
                this.Title = res.data[0].title;
                this.TicketNo = res.data[0].ticket_number;
                this.Status = res.data[0].status_id;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        LoopLoad() {
            this.Interval = setInterval(() => {
                if (this.LoadStatus == false) {
                    this.LoadStatus = true;
                    axios.post(Global.methods.GetURL() + "/load_chatbox", {
                        ticketid: this.ticketid,
                    }).then(res => {
                        this.Chats = res.data;
                        this.LoadStatus = false;
                    }).catch(err => {
                        console.log(err);
                    });
                }
            }, 1000);
        },
        SendMessage() {
            axios.post(Global.methods.GetURL() + "/send_message", {
                ticketid: this.ticketid,
                userid: this.UserID,
                message: this.Message,
            }).then(res => {
                if (res.data == 1) {
                    this.Message = "";
                    this.LoadChats();
                }
            }).catch(err => {
                console.log(err);
            });
        }
    },
    watch: {
        Message() {
            if (this.Message != "") {
                this.SendBtnStatus = false;
            } else {
                this.SendBtnStatus = true;
            }
        }
    }
})
</script>

<style lang="scss" scoped>

</style>