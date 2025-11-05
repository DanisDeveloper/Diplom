import {createApp} from 'vue'
import App from './App.vue'
import router from "@/router/router.js";
import store from "@/store/index.js";
import VTooltip from "@/directives/VTooltip.js";
import components from "@/components/index.js";
import '@/main.css'

const app = createApp(App)

// Глобальная регистрация компонентов
for (let i = 0; i < components.length; i++) {
    app.component(components[i].name, components[i])
}

app.directive('tooltip', VTooltip)

app.use(router)
    .use(store)
    .mount('#app')
