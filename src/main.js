import {createApp} from 'vue'
import App from './App.vue'
import router from "@/router/router.js";
import store from "@/store/index.js";
import VTooltip from "@/directives/VTooltip.js";
import icons from "@/components/Icons/index.js";

const app = createApp(App)

// Глобальная регистрация компонентов
for (let i = 0; i < icons.length; i++) {
    app.component(icons[i].name, icons[i])
}

app.directive('tooltip', VTooltip)

app.use(router)
    .use(store)
    .mount('#app')
