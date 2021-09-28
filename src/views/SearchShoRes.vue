<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-searchbar ref="searchRef" v-on:keyup.enter="SearchUsingEnter()" v-model="Search" class="searchshores" placeholder="Search shops & restaurants" show-clear-button="always"></ion-searchbar>
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content>
            <div v-if="Status == false && Recent.length != 0">
                <ion-list>
                    <ion-list-header>
                        Recent searches
                    </ion-list-header>
                    <div @click.prevent="SearchRecent(recent)" class="recent-list" v-for="recent of Recent" v-bind:key="recent">
                        <ion-grid>
                            <ion-row>
                                <ion-col>
                                    <ion-icon :icon="timerOutline" color="primary"></ion-icon>
                                    &nbsp;
                                    <span>{{ recent }}</span>
                                </ion-col>
                                <ion-col class="ion-text-end">
                                    <ion-icon @click.stop="RemoveRecent(recent)" :icon="closeOutline" color="primary"></ion-icon>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </div>
                </ion-list>
            </div>
            <div v-if="Status == true && Recent.length != 0">
                <ion-list>
                    <ion-list-header>
                        You search for "{{ Search }}"
                    </ion-list-header>
                    <div class="search-list">
                        <ion-card v-for="store of Stores" v-bind:key="store" @click.prevent="GotoStore(store.id)">
                            <div class="close" v-if="store.status == 'closeday'">
                                <div class="close-sign">
                                    <div class="close-text">
                                        <span>Closed for now.<br>Come back {{ Tomorrow() }} at {{ TimeFormat(store.open) }}</span>
                                    </div>
                                </div>
                                <img :src="store.orderbanner" />
                            </div>
                            <div v-else>
                                <div v-if="store.status == 'open'">
                                    <img :src="store.orderbanner" />
                                </div>
                                <div class="close" v-else>
                                    <div class="close-sign">
                                        <div v-if="'00:00:00' <= CurrentTime && store.open >= CurrentTime" class="close-text">
                                            <span>Closed for now.<br>Come back at {{ TimeFormat(store.open) }}</span>
                                        </div>
                                        <div v-if="store.close <= CurrentTime && '23:59:59' >= CurrentTime" class="close-text">
                                            <span>Closed for now.<br>Come back tomorrow at {{ TimeFormat(store.open) }}</span>
                                        </div>
                                    </div>
                                    <img :src="store.orderbanner" />
                                </div>
                            </div>
                            <div class="fav-button" @click.stop="FavouriteStore(store.id, store.favour, store.favouriteId)">
                                <ion-icon v-if="store.favour == 0" :icon="heartOutline" color="danger"></ion-icon>
                                <ion-icon v-else :icon="heart" color="danger"></ion-icon>
                            </div>
                            <div class="time-box">
                                {{ store.preparingTime }} Min
                            </div>
                            <ion-card-header>
                                <ion-card-subtitle>{{ store.streets }}</ion-card-subtitle>
                                <ion-card-title>{{ store.name }}</ion-card-title>
                            </ion-card-header>
                        </ion-card>
                    </div>
                </ion-list>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonBackButton, IonIcon, IonSearchbar, IonList, IonListHeader, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, modalController } from "@ionic/vue";
import { closeOutline, timerOutline, heartOutline, heart } from "ionicons/icons";
import Global from "../components/Global";
import axios from "axios";
import Login from "../views/Login";

export default({
    components: {
        IonContent,
        IonPage,
        IonBackButton,
        IonIcon,
        IonSearchbar,
        IonList,
        IonGrid, 
        IonRow, 
        IonCol,
        IonCard, 
        IonCardHeader, 
        IonCardTitle, 
        IonCardSubtitle,
        IonListHeader
    },
    setup() {
        return {
            closeOutline,
            timerOutline,
            heartOutline,
            heart
        }
    },
    async created() {
        setTimeout(() => {
            this.$refs.searchRef.$el.setFocus();
        }, 100);
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
        if (localStorage.recent != undefined) {
            this.BackUpRecent = JSON.parse(localStorage.recent);
            this.Recent = this.BackUpRecent;
        }
    },
    data() {
        return {
            Recent: [],
            BackUpRecent: [],
            Stores: [],
            Mix: [],
            Status: false,
            Search: "",
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
        SearchShopsAndRestaurant() {
            if (this.Search != "") {
                if (typeof this.BackUpRecent.find(x => x == this.Search) == 'undefined') {
                    this.BackUpRecent.reverse().push(this.Search);
                    if (this.BackUpRecent.length <= 5) {
                        this.Recent = this.BackUpRecent.reverse();
                        localStorage.recent = JSON.stringify(this.Recent);
                    } else {
                        this.Recent = this.BackUpRecent.reverse().slice(0, 5);
                        localStorage.recent = JSON.stringify(this.Recent);
                    }
                } else {
                    this.BackUpRecent.splice(this.BackUpRecent.indexOf(this.Search), 1);
                    this.BackUpRecent.reverse().push(this.Search);
                    if (this.BackUpRecent.length <= 5) {
                        this.Recent = this.BackUpRecent.reverse();
                        localStorage.recent = JSON.stringify(this.Recent);
                    } else {
                        this.Recent = this.BackUpRecent.reverse().slice(0, 5);
                        localStorage.recent = JSON.stringify(this.Recent);
                    }
                }
                this.LoadSearch();
            }
        },
        SearchRecent(search) {
            this.Search = search;
            this.Status = true;
            this.SearchShopsAndRestaurant();
        },
        SearchUsingEnter() {
            this.Status = true;
            this.SearchShopsAndRestaurant();
        },
        RemoveRecent(search) {
            this.Recent.splice(this.Recent.indexOf(search), 1);
            localStorage.recent = JSON.stringify(this.Recent);
        },
        LoadSearch() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/search_shop_restaurant", {
                search: this.Search,
                userid: this.UserID
            }).then(res => {
                this.Stores = [];
                this.CurrentTime = res.data.current_time;
                (res.data.stores.concat(res.data.random)).forEach(x => {
                    if (x.close_day == this.WeekDay()) {
                        if (res.data.favourites.length != 0) {
                            res.data.favourites.forEach(y => {
                                if (x.id == y.store_id) {
                                    if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                        this.Stores.push({
                                            id: x.id,
                                            streets: x.streets,
                                            name: x.name,
                                            preparingTime: x.preparing_time,
                                            favour: 1,
                                            favouriteId: y.id,
                                            orderbanner: x.orderbanner,
                                            status: "closeday",
                                            open: x.open_time_a,
                                            close: x.open_time_b,
                                            closeday: x.close_day
                                        });
                                    } else {
                                        this.Stores.filter(f => f.id == x.id)[0].favour = 1;
                                        this.Stores.filter(f => f.id == x.id)[0].favouriteId = y.id;
                                    }
                                } else {
                                    if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                        this.Stores.push({
                                            id: x.id,
                                            streets: x.streets,
                                            name: x.name,
                                            preparingTime: x.preparing_time,
                                            favour: 0,
                                            favouriteId: 0,
                                            orderbanner: x.orderbanner,
                                            status: "closeday",
                                            open: x.open_time_a,
                                            close: x.open_time_b,
                                            closeday: x.close_day
                                        });
                                    }
                                }
                            });
                        } else {
                            if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                this.Stores.push({
                                    id: x.id,
                                    streets: x.streets,
                                    name: x.name,
                                    preparingTime: x.preparing_time,
                                    favour: 0,
                                    favouriteId: 0,
                                    orderbanner: x.orderbanner,
                                    status: "closeday",
                                    open: x.open_time_a,
                                    close: x.open_time_b,
                                    closeday: x.close_day
                                });
                            }
                        }
                    } else {
                        if (x.open_time_a <= this.TimeToday() && x.open_time_b >= this.TimeToday()) {
                            if (res.data.favourites.length != 0) {
                                res.data.favourites.forEach(y => {
                                    if (x.id == y.store_id) {
                                        if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                            this.Stores.push({
                                                id: x.id,
                                                streets: x.streets,
                                                name: x.name,
                                                preparingTime: x.preparing_time,
                                                favour: 1,
                                                favouriteId: y.id,
                                                orderbanner: x.orderbanner,
                                                status: "open",
                                            });
                                        } else {
                                            this.Stores.filter(f => f.id == x.id)[0].favour = 1;
                                            this.Stores.filter(f => f.id == x.id)[0].favouriteId = y.id;
                                        }
                                    } else {
                                        if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                            this.Stores.push({
                                                id: x.id,
                                                streets: x.streets,
                                                name: x.name,
                                                preparingTime: x.preparing_time,
                                                favour: 0,
                                                favouriteId: 0,
                                                orderbanner: x.orderbanner,
                                                status: "open",
                                            });
                                        }
                                    }
                                });
                            } else {
                                if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                    this.Stores.push({
                                        id: x.id,
                                        streets: x.streets,
                                        name: x.name,
                                        preparingTime: x.preparing_time,
                                        favour: 0,
                                        favouriteId: 0,
                                        orderbanner: x.orderbanner,
                                        status: "open",
                                    });
                                }
                            }
                        } else {
                            if (res.data.favourites.length != 0) {
                                res.data.favourites.forEach(y => {
                                    if (x.id == y.store_id) {
                                        if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                            this.Stores.push({
                                                id: x.id,
                                                streets: x.streets,
                                                name: x.name,
                                                preparingTime: x.preparing_time,
                                                favour: 1,
                                                favouriteId: y.id,
                                                orderbanner: x.orderbanner,
                                                status: "close",
                                                open: x.open_time_a,
                                                close: x.open_time_b,
                                                closeday: x.close_day
                                            });
                                        } else {
                                            this.Stores.filter(f => f.id == x.id)[0].favour = 1;
                                            this.Stores.filter(f => f.id == x.id)[0].favouriteId = y.id;
                                        }
                                    } else {
                                        if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                            this.Stores.push({
                                                id: x.id,
                                                streets: x.streets,
                                                name: x.name,
                                                preparingTime: x.preparing_time,
                                                favour: 0,
                                                favouriteId: 0,
                                                orderbanner: x.orderbanner,
                                                status: "close",
                                                open: x.open_time_a,
                                                close: x.open_time_b,
                                                closeday: x.close_day
                                            });
                                        }
                                    }
                                });
                            } else {
                                if (this.Stores.filter(f => f.id == x.id).length == 0) {
                                    this.Stores.push({
                                        id: x.id,
                                        streets: x.streets,
                                        name: x.name,
                                        preparingTime: x.preparing_time,
                                        favour: 0,
                                        favouriteId: 0,
                                        orderbanner: x.orderbanner,
                                        status: "close",
                                        open: x.open_time_a,
                                        close: x.open_time_b,
                                        closeday: x.close_day
                                    });
                                }
                            }
                        }
                    }
                });
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        FavouriteStore(id, status, favourite) {
            if (this.UserID != "") {
                if (status == 0) {
                    axios.post(Global.methods.GetURL() + "/favourite_add", {
                        userid: this.UserID,
                        storeid: id,
                    }).then(() => {
                        this.LoadSearch();
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    axios.post(Global.methods.GetURL() + "/favourite_remove", {
                        favouriteid: favourite,
                    }).then(() => {
                        this.LoadSearch();
                    }).catch(err => {
                        console.log(err);
                    });
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
        GotoStore(id) {
            this.$router.replace({name: "Store", params: { storeid: id }});
        },
        TimeToday() {
            return new Date().toLocaleTimeString('en-US', {hour12: false})
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
    watch: {
        Search() {
            if(this.Search == "") {
                this.Status = false;
            }
        }
    },
})
</script>

<style lang="scss" scoped>
    ion-list-header {
        font-weight: 600;
        font-size: 16px;
    }
    .recent-list {
        padding: 10px 10px;
    }
    .search-list {
        padding: 0 10px;
    }
    ion-searchbar {
        padding: 0 !important;
    }
    ion-card-header {
        padding: 10px 16px;
    }
    ion-card-title {
        margin-top: 0px;
    }
    .fav-button {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 20px;
        background: white;
        border-radius: 50%;
        padding: 5px 5px 0 5px;
    }
    .time-box {
        position: absolute;
        left: 10px;
        top: 10px;
        background: white;
        border-radius: 5px;
        padding: 5px 5px 2px 5px;
    }
    ion-card {
        margin: 0px 5px 15px 5px;
    }
    ion-list {
        padding: 0;
    }
    .close {
        .close-sign {
            position: absolute;
            top: 0;
            background-color: rgba(0, 0, 0, 0.8);
            width: 100%;
            height: calc(100% - 65px);
            .close-text {
                width: 80%;
                text-align: center;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 3vw;
            }
        }
    }
</style>
