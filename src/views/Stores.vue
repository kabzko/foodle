<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>{{ Title }}</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>
        

        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col size="4" v-for="(store, index) of Stores" v-bind:key="store + index">
                        <router-link :to="{ name: 'Store', params: { storeid: store.id }}">
                            <div v-if="store.close_day == WeekDay()">
                                <div>
                                    <img :src="store.storethumbnail">
                                </div>
                                <div class="store-name">
                                    {{ store.name }}
                                </div>
                                <div class="close-text">
                                    <span>Closed for now.<br>Come back {{ Tomorrow() }} at {{ TimeFormat(store.open_time_a) }}</span>
                                </div>
                            </div>
                            <div v-else>
                                <div v-if="store.open_time_a <= CurrentTime && store.open_time_b >= CurrentTime">
                                    <div>
                                        <img :src="store.storethumbnail">
                                    </div>
                                    <div class="store-name">
                                        {{ store.name }}
                                    </div>
                                </div>
                                <div v-else>
                                    <div>
                                        <img :src="store.storethumbnail">
                                    </div>
                                    <div class="store-name">
                                        {{ store.name }}
                                    </div>
                                    <div v-if="'00:00:00' <= CurrentTime && store.open_time_a >= CurrentTime" class="close-text">
                                        <span>Closed for now.<br>Come back at {{ TimeFormat(store.open_time_a) }}</span>
                                    </div>
                                    <div v-if="store.open_time_b <= CurrentTime && '23:59:59' >= CurrentTime" class="close-text">
                                        <span>Closed for now.<br>Come back tomorrow at {{ TimeFormat(store.open_time_a) }}</span>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                    </ion-col>
                </ion-row>
            </ion-grid>  
        </ion-content>
    </ion-page>
</template>

<script>
import { useRoute } from "vue-router";
import { IonContent, IonPage, IonTitle, IonBackButton } from "@ionic/vue";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonPage,
        IonTitle,
        IonBackButton
    },
    setup() {
        const route = useRoute();
        const type = route.params.type;
        return {
            type,          
        }
    },
    async created() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
        if (this.type == "nearme") {
            this.Title = "Near Me";
        } else {
            this.Title = "My Favourites";
        }
        this.LoadStores(JSON.parse(localStorage.mycoordinates)[0].lat, JSON.parse(localStorage.mycoordinates)[0].lng);
    },
    data() {
        return {
          Stores: [],
          Title: "",
          UserID: "",
          CurrentTime: "",
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
        LoadStores(lat, lng) {
            Global.methods.Loading();
            setTimeout(() => {
                if (this.type == "nearme") {
                    axios.post(Global.methods.GetURL() + "/stores", {
                        lat: lat,
                        lng: lng,
                    }).then(res => {
                        this.Stores = res.data;
                    }).catch(err => {
                        console.log(err);
                    }).finally(() => {
                        setTimeout(() => {
                            Global.methods.Unloading();
                        }, 100);
                    });
                } else {
                    axios.post(Global.methods.GetURL() + "/favourites", {
                        userid: this.UserID,
                    }).then(res => {
                        this.Stores = res.data.favourites;
                        this.CurrentTime = res.data.current_time;
                    }).catch(err => {
                        console.log(err);
                    }).finally(() => {
                        setTimeout(() => {
                            Global.methods.Unloading();
                        }, 100);
                    });
                }
            }, 500);
        },
        WeekDay() {
            let Day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Staturday"];
            return Day[new Date().getDay()];
        },
        Tomorrow() {
            let Day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Staturday"];
            return Day[new Date().getDay() + 1];
        },
    },
});
</script>

<style lang="scss" scoped>
    img {
        border-radius: 7px;
        display: block;
    }
    .close-text {
        width: 26vw;
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 5px;
        padding: 5px;
        font-size: 3vw;
        text-align: center;
        font-weight: 600;
    }
    .store-name {
        color: black;
        text-align: center;
        margin-top: 5px;
        font-size: 14px;
        height: 20px;
        white-space: nowrap; 
        overflow: hidden;
        text-overflow: ellipsis; 
    }
</style>