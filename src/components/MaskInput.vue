<template>
  <ion-input :id="refid" ref="input" :placeholder="ph" v-mask="masked" :inputmode="input"></ion-input>
</template>

<script>
import { mask } from 'vue-the-mask';

export default {
    name: 'MaskInput',
    directives: { 
        mask: (el, binding) => {
            if (!binding.value) return;
            mask(el, binding);
        }
    },
    props: [
        'refid',
        'mask',
        'input',
        'ph'
    ],
    data() {
        return {
            masked: '',
            isReady: false,
            timeout: undefined,
            SimNumber: '',
        };
    },
    async mounted() {
        this.setMask();
    },
    methods: {
        getMask(maskName) {
            const mask = {
                tel: ["(+63) ### ### ####"],
                cpf: ["X X X X X X"],
                cnpj: ["##.###.###/####-##"],
                cpfcnpj: ["###.###.###-##", "##.###.###/####-##"],
                cep: ["#####-###"],
                date: ["##/##/####"],
                cc: ["#### ###### #####", "#### #### #### ####"],
                ccexp: ["##/##"],
            };
            return mask[maskName];
        },
        setMask() {
            if (!this.$el && !this.isReady) return;
            this.timeout && clearTimeout(this.timeout);
            this.timeout = setTimeout(async () => {
                await this.$el.getInputElement();
                this.masked = this.getMask(this.mask);
                this.isReady = true;
            }, 1000);
        },
        getData(id) {
            if (document.getElementById(id).value == undefined) {
                return '';
            } else {
                return document.getElementById(id).value;
            }
        }
    },
};
</script>