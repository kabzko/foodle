<template>
    <ion-page>
        <ion-content>
            <div>
                <div class="empty ion-text-center">
                    <img src="../assets/Map.png">
                    <div>
                        <h2>Find restaurants and shops near you!</h2>
                    </div>
                    <div>
                        <small>By allowing location access, you can search for restaurants and shops near you and receive more accurate delivery.</small>
                    </div>
                </div>
            </div>
        </ion-content>
        <ion-footer>
            <div class="footer">
                <ion-button expand="full" mode="ios" @click="autoLocation()" color="primary">Allow location access</ion-button>
                <ion-button expand="full" mode="ios" @click="findMyLocation()" color="primary">Enter my location</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonFooter, IonButton } from "@ionic/vue";
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Diagnostic } from "@ionic-native/diagnostic";
import { Geolocation } from "@ionic-native/geolocation";
import Global from "../components/Global";

export default({
    components: {
        IonPage, IonContent, IonFooter, IonButton
    },
    data() {
        return {
            route: "",
            street: "",
            city: "",
            province: "",
            country: "",
            timeout: "",
            map: "",
            lat: "",
            lng: "",
        }
    },
    methods: {
        autoLocation() {
            Diagnostic.isLocationEnabled().then((isEnabled) => {
                if(!isEnabled){
                    LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                        this.locating();
                    });
                } else {
                    this.locating();
                }
            });
        },
        locating() {
            Geolocation.getCurrentPosition().then(res => {
                this.lat = res.coords.latitude;
                this.lng = res.coords.longitude;
                new window.google.maps.Geocoder().geocode({
                    "latLng": new window.google.maps.LatLng(
                        this.lat,
                        this.lng,
                    )
                }, resp => {
                    if (resp[1].address_components.length == 6) {
                        this.route = resp[1].address_components[0].short_name + " " + resp[1].address_components[1].short_name;
                        this.street = resp[1].address_components[2].short_name;
                        this.city = resp[1].address_components[3].short_name;
                        this.province = resp[1].address_components[4].short_name;
                        this.country = resp[1].address_components[5].short_name;
                    } else if (resp[1].address_components.length == 5) {
                        this.route = resp[1].address_components[0].short_name;
                        this.street = resp[1].address_components[1].short_name;
                        this.city = resp[1].address_components[2].short_name;
                        this.province = resp[1].address_components[3].short_name;
                        this.country = resp[1].address_components[4].short_name;
                    } else if (resp[1].address_components.length == 4) {
                        this.street = resp[1].address_components[0].short_name;
                        this.city = resp[1].address_components[1].short_name;
                        this.province = resp[1].address_components[2].short_name;
                        this.country = resp[1].address_components[3].short_name;
                    } else if (resp[1].address_components.length == 3) {
                        this.city = resp[1].address_components[0].short_name;
                        this.province = resp[1].address_components[1].short_name;
                        this.country = resp[1].address_components[2].short_name;
                    } else if (resp[1].address_components.length == 2) {
                        this.province = resp[1].address_components[0].short_name;
                        this.country = resp[1].address_components[1].short_name;
                    } else {
                        this.country = resp[1].address_components[0].short_name;
                    }
                    this.confirmLocation();
                }).catch(err => {
                    console.log(err);
                });
            });
        },
        confirmLocation() {
            Global.methods.Loading();
            setTimeout(() => {
                localStorage.mycoordinates = JSON.stringify([{
                    lat: this.lat,
                    lng: this.lng,
                    route: this.route,
                    street: this.street,
                    city: this.city,
                    province: this.province,
                    country: this.country,
                }]);
                Global.methods.Unloading();
                this.$router.replace({ name: "Home" });
            }, 100);
        },
        findMyLocation() {
            this.$router.push({ name: "Coordinator" });
        }
    }
})
</script>

<style lang="scss" scoped>
    .footer {
        margin: 10px;
        ion-button {
            margin: 10px 0;
        }
    }
    .empty {
        width: 75%;
        position: absolute;
        top: 48%;
        left: 50%;
        transform: translate(-50%, -50%);
        img {
            width: 53vw;
        }
    }
</style>