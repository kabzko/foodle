<script>
import { alertController, loadingController } from "@ionic/vue";

export default {
    data() {
        return {
            loading: ""
        }
    },
    methods: {
        GetURL() {
            return "http://localhost:3000";
            // return "http://18.139.255.80";
        },
        async Alert(text) {
            const alert = await alertController
                .create({
                cssClass: "my-custom-class",
                message: text,
                buttons: ["OK"],
                });
            return alert.present();
        },
        async Loading() {
            this.loading = await loadingController
                .create({
                cssClass: "my-custom-class",
                message: "Please wait...",
                duration: this.timeout,
                });
            await this.loading.present();
        },
        async Unloading() {
            return await this.loading.dismiss();
        }
    }
}
</script>