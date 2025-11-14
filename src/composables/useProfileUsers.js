import {computed} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";

export function useProfileUsers() {
    const store = useStore();
    const route = useRoute();
    const isStoreUser = computed(() => store.state.auth.isAuth && store.state.auth.user.name === route.params.id)
    return {
        isStoreUser
    }
}