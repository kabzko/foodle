<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-buttons>
                    <ion-button @click="CloseModal()">
                        <ion-icon slot="icon-only" :icon="close" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button @click="AutoLocation()">
                        <ion-icon slot="icon-only" :icon="locate" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <div class="map-size" id="mapDivRef">
            </div>
            <div class="address">
                <div class="address-detail">
                    <ion-grid>
                        <ion-row>
                            <ion-col size="1">
                                <div class="address-icon">
                                    <ion-icon :icon="locationOutline" color="primary"></ion-icon>
                                </div>
                            </ion-col>
                            <ion-col size="11">
                                <div class="address-list" v-if="Country != ''">
                                    <span>{{ Route + " " + Street }}</span><br>
                                    <small>{{ City + " " + Province + " " + Country }}</small>
                                </div>
                                <div v-else>
                                    <span>{{ Route }}</span><br>
                                    <small>{{ Area }}</small>
                                </div>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </div>
            </div>
            <div class="note">
                <ion-item lines="none">
                    <ion-label position="floating">Note</ion-label>
                    <ion-input v-model="Note"></ion-input>
                </ion-item>
            </div>
            <div class="type">
                <ion-item lines="none">
                    <ion-label>Type</ion-label>
                    <ion-select v-model="Type">
                        <ion-select-option value="Home">Home</ion-select-option>
                        <ion-select-option value="Office">Office</ion-select-option>
                        <ion-select-option value="Partner">Partner</ion-select-option>
                        <ion-select-option value="Other">Other</ion-select-option>
                    </ion-select>
                </ion-item>
            </div>
        </ion-content>
        <ion-footer>
            <div class="footer">
                <ion-button mode="ios" @click="UpdateAddress()" expand="full" color="primary" :disabled="Status">Update address</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Diagnostic } from "@ionic-native/diagnostic";
import { Geolocation } from "@ionic-native/geolocation";
import { IonContent, IonPage, IonFooter, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonSelect, IonSelectOption, IonInput, modalController, alertController } from "@ionic/vue";
import { locate, locationOutline, close } from "ionicons/icons"
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonPage,
        IonFooter,
        IonButton,
        IonIcon,
        IonGrid, 
        IonRow, 
        IonCol,
        IonItem, 
        IonLabel, 
        IonSelect, 
        IonSelectOption,
        IonInput
    },
    props: {
        addressid: String,
        storelat: Number,
        storelng: Number,
    },
    setup() {
        return { 
            locate,
            locationOutline,
            close
        }
    },
    mounted() {
        Diagnostic.isLocationEnabled().then((isEnabled) => {
            if(!isEnabled){
                LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                    this.LoadAddress();
                });
            } else {
                this.LoadAddress();
            }
        });
    },
    created() {
        if (typeof localStorage.users !== "undefined") {
            this.UserID = JSON.parse(localStorage.users)[0].id;
        }
    },
    data() {
        return {
            Address: [],
            UserID: "",
            Map: null,
            AutoCoordinate: false,
            Route: "",
            Timeout: "",
            Status: false,
            Type: "Home",
            Note: "",
            Lat: "",
            Lng: "",
            Street: "",
            City: "",
            Province: "",
            Country: "",
            Area: "",
        }
    },
    methods: {
        LoadAddress() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/address_detail", {
                addressid: this.addressid
            }).then(res => {
                this.Route = res.data[0].street;
                this.Area = res.data[0].area;
                this.Note = res.data[0].note;
                this.Type = res.data[0].type;
                setTimeout(() => {
                    this.Map =  new window.google.maps.Map(document.getElementById("mapDivRef"), {
                        zoom: 19,
                        clickableIcons: false,
                        disableDefaultUI: true,
                        disableDoubleClickZoom: true,
                        mapTypeControl: false,
                        scaleControl: false,
                        center: { lat: res.data[0].latitude, lng: res.data[0].longitude }
                    });
                    this.Lat = this.Map.getCenter().toUrlValue().split(",")[0];
                    this.Lng = this.Map.getCenter().toUrlValue().split(",")[1];
                    
                    this.Map.addListener("center_changed", () => {
                        this.Lat = this.Map.getCenter().toUrlValue().split(",")[0];
                        this.Lng = this.Map.getCenter().toUrlValue().split(",")[1];
                    });
                    this.Map.addListener("drag", () => {
                        clearTimeout(this.Timeout);
                        this.Status = true;
                    });
                    this.Map.addListener("zoom_changed", () => {
                        clearTimeout(this.Timeout);
                        this.Status = true;
                    });
                    this.Map.addListener("dragend", () => {
                        this.Timeout = setTimeout(() => {
                            this.Marking();
                        }, 1500); 
                    });
                }, 250);
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        Marking() {   
            new window.google.maps.Geocoder().geocode({
                "latLng": new window.google.maps.LatLng(
                    this.Lat,
                    this.Lng
                )
            }, res => {
                if (res[1].address_components.length == 6) {
                    this.Route = res[1].address_components[0].short_name + " " + res[1].address_components[1].short_name;
                    this.Street = res[1].address_components[2].short_name;
                    this.City = res[1].address_components[3].short_name;
                    this.Province = res[1].address_components[4].short_name;
                    this.Country = res[1].address_components[5].short_name;
                } else if (res[1].address_components.length == 5) {
                    this.Route = res[1].address_components[0].short_name;
                    this.Street = res[1].address_components[1].short_name;
                    this.City = res[1].address_components[2].short_name;
                    this.Province = res[1].address_components[3].short_name;
                    this.Country = res[1].address_components[4].short_name;
                } else if (res[1].address_components.length == 4) {
                    this.Street = res[1].address_components[0].short_name;
                    this.City = res[1].address_components[1].short_name;
                    this.Province = res[1].address_components[2].short_name;
                    this.Country = res[1].address_components[3].short_name;
                } else if (res[1].address_components.length == 3) {
                    this.City = res[1].address_components[0].short_name;
                    this.Province = res[1].address_components[1].short_name;
                    this.Country = res[1].address_components[2].short_name;
                } else if (res[1].address_components.length == 2) {
                    this.Province = res[1].address_components[0].short_name;
                    this.Country = res[1].address_components[1].short_name;
                } else {
                    this.Country = res[1].address_components[0].short_name;
                }
            }).catch(err => {
                console.log(err);
            });
            this.Status = false;
        },
        UpdateAddress() {
            let distance = this.LatLngToKM(this.storelat, this.storelng, this.Lat, this.Lng);
            if (distance <= 50) {
                Global.methods.Loading();
                axios.post(Global.methods.GetURL() + "/address_update", {
                    addressid: this.addressid,
                    street: this.Route + " " + this.Street,
                    area: this.City + " " + this.Province + " " + this.Country,
                    note: this.Note,
                    type: this.Type,
                    lat: this.Lat,
                    lng: this.Lng
                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    setTimeout(() => {
                        Global.methods.Unloading();
                        modalController.dismiss({
                            status: "success"
                        });
                    }, 100);
                });
            } else {
                this.AlertCheck();
            }
        },
        AutoLocation() {
            Diagnostic.isLocationEnabled().then((isEnabled) => {
                if(!isEnabled){
                    LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                        this.LoadAddress();
                    });
                } else {
                    Geolocation.getCurrentPosition().then(res => {
                        this.Lat = res.coords.latitude;
                        this.Lng = res.coords.longitude;
                        const position = new window.google.maps.LatLng(res.coords.latitude, res.coords.longitude);
                        this.Map.setCenter(position);
                        this.Marking();
                    });
                }
            });
        },
        CloseModal() {
            modalController.dismiss({
                status: "close"
            });
        },
        async AlertCheck() {
            const alert = await alertController.create({
                cssClass: "my-custom-class",
                message: "This restaurant doesn't delivery to this address.",
                buttons: [
                    {
                        text: "No",
                        role: "cancel",
                        cssClass: "secondary"
                    },
                ],
            });
            await alert.present();
        },
        LatLngToKM(lat1, lng1, lat2, lng2) {
            let r = 6371;
            let p1 = lat1 * Math.PI/180;
            let p2 = lat2 * Math.PI/180;
            let dp = (lat2-lat1) * Math.PI/180;
            let dl = (lng2-lng1) * Math.PI/180;
            let a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            let d = r * c;
            return d;
        }
    },
})
</script>

<style lang="scss" scoped>
    ion-content {
        top: -6px !important;
    }
    ion-content::part(background) {
        height: calc(100% + 6px) !important;   
    }
    ion-content::part(scroll) {
        height: calc(100% + 6px) !important;   
    }
    .map-size {
        width: 100%;
        height: 65%;
    }
    .footer {
        margin: 5px;
    }
    #mapDivRef {
        position: relative;
    }
    #mapDivRef:after {
        width: 26px;
        height: 35px;
        display: block;
        content: " ";
        position: absolute;
        top: 50%; left: 50%;
        margin: -40px 0 0 -11px;
        background: url("../assets/Marker.png") no-repeat;
        background-size: 26px 35px;
        pointer-events: none;
    }
    .address {
        margin: 15px;
        ion-grid ion-row {
            ion-col:nth-child(1) {
                .address-icon {
                    font-size: 26px;
                    display: flex;
                    align-items: flex-start;
                }
            }
            ion-col:nth-child(2) {
                display: flex;
                align-items: center;
            }
        }
    }
    .note {
        margin: 15px;
        ion-item {
            border: 1px solid #c8c7cc;
            border-radius: 10px;
        }
    }
    .type {
        margin: 15px;
        ion-item {
            border: 1px solid #c8c7cc;
            border-radius: 10px;
        }
    }
</style>