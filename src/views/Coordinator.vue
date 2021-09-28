<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/" color="primary"></ion-back-button>
                </ion-buttons>
            </div>
            <div class="col-2">
                <ion-title>
                    <span>{{ Route + " " + Street }}</span><br>
                    <small>{{ City + " " + Province + " " + Country }}</small>
                </ion-title>
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button @click="AutoLocation()">
                        <ion-icon slot="icon-only" :icon="locate" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content :hidden="Load">
            <div class="map-size" id="mapDivRef">
            </div>
        </ion-content>
        <ion-footer :hidden="Load">
            <div class="footer">
                <ion-button mode="ios" @click="ConfirmLocation()" expand="full" color="primary" :disabled="Status">Find restaurant and shops</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Geolocation } from "@ionic-native/geolocation";
import { Diagnostic } from "@ionic-native/diagnostic";
import { IonContent, IonPage, IonFooter, IonButton, IonIcon, IonBackButton } from "@ionic/vue";
import { locate, locationOutline } from "ionicons/icons"
import Global from "../components/Global";

export default({
    components: {
        IonContent,
        IonPage,
        IonFooter,
        IonButton,
        IonIcon,
        IonBackButton,
    },
    setup() {
        return { 
            locate, 
            locationOutline
        }
    },
    data() {
        return {
            Load: true,
            Status: false,
            AutoCoordinate: false,
            Coord: "Empty",
            Route: "",
            Street: "",
            City: "",
            Province: "",
            Country: "",
            Timeout: "",
            Map: "",
            Lat: "",
            Lng: "",
        }
    },
    mounted() {
        Diagnostic.isLocationEnabled().then((isEnabled) => {
            if(!isEnabled){
                LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                    this.LoadGoogleMap();
                });
            } else {
                this.LoadGoogleMap();
            }
        });
    },
    unmounted() {
        this.Map = "";
    },
    methods: {
        LoadGoogleMap() {
            setTimeout(() => {
                Geolocation.getCurrentPosition().then(res => {
                    this.Load = false;
                    this.Map =  new window.google.maps.Map(document.getElementById("mapDivRef"), {
                        zoom: 18,
                        clickableIcons: false,
                        disableDefaultUI: true,
                        disableDoubleClickZoom: true,
                        mapTypeControl: false,
                        scaleControl: false,
                        center: { lat: res.coords.latitude, lng: res.coords.longitude }
                    });
                    this.Lat = this.Map.getCenter().toUrlValue().split(",")[0];
                    this.Lng = this.Map.getCenter().toUrlValue().split(",")[1];
                    this.Marking();

                    this.Map.addListener("center_changed", () => {
                        this.Lat = this.Map.getCenter().toUrlValue().split(",")[0];
                        this.Lng = this.Map.getCenter().toUrlValue().split(",")[1];
                    });
                    this.Map.addListener("drag", () => {
                        clearTimeout(this.Timeout);
                        this.Status = true;
                    });
                    this.Map.addListener("dragend", () => {
                        this.Timeout = setTimeout(() => {
                            this.Marking();
                        }, 1000); 
                    });
                });
            }, 250);
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
        ConfirmLocation() {
            Global.methods.Loading();
            setTimeout(() => {
                localStorage.mycoordinates = JSON.stringify([{
                    lat: this.Lat,
                    lng: this.Lng,
                    route: this.Route,
                    street: this.Street,
                    city: this.City,
                    province: this.Province,
                    country: this.Country,
                }]);
                Global.methods.Unloading();
                this.$router.replace({ name: "Home" });
            }, 100);
        },
        AutoLocation() {
            Diagnostic.isLocationEnabled().then((isEnabled) => {
                if(!isEnabled){
                    LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                        this.LoadGoogleMap();
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
        height: 100%;
    }
    .footer {
        margin: 5px 5px;
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
</style>