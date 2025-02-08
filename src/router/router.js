import Main from "@/pages/Main.vue";
import {createRouter, createWebHistory} from "vue-router"
import About from "@/pages/About.vue";

const routes = [
    {
        path: '/',
        component: Main
    },
    {
        path: '/about',
        component: About
    }
]

const router = createRouter({
    routes,
    history: createWebHistory()
})

export default router;