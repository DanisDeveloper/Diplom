import {createApp} from 'vue'
import App from './App.vue'
import router from "@/router/router.js";
import store from "@/store/index.js";
import VTooltip from "@/directives/VTooltip.js";


const app = createApp(App)


app.directive('tooltip', VTooltip)

app.use(router)
    .use(store)
    .mount('#app')
