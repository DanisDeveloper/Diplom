import {ref, computed} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import Error from "@/components/Error.vue";
import {useToast} from "@/composables/useToast.js";

export function useUsers() {
    const store = useStore();
    const route = useRoute();

    const user = ref({
        id: null,
        name: "",
        createdAt: null,
        avatarUrl: null,
        backgroundUrl: null,
        biography: "",
        stats:{
            totalShaders: 0,
            totalLikes: 0,
            totalComments: 0,
            totalViews: 0
        },
        activities: [],

    });
    const isLoadingUser = ref(false);
    const isStoreUser = computed(() =>
        store.state.auth.isAuth &&
        store.state.auth.user.name === route.params.id
    );


    async function fetchUser(username) {
        isLoadingUser.value = true;

        try {
            const response = await fetch(`${store.state.api.API_URL}/users/${username}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error("Server returned an error");
            }

            const data = await response.json();
            user.value = data;

        } catch (e) {
            store.commit("ui/setError", e.message);
        } finally {
            isLoadingUser.value = false;
        }
    }

    return {
        user,
        isStoreUser,
        isLoadingUser,
        fetchUser,
    };
}
