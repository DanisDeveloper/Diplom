export default {
    namespaced: true,
    state: {
        isAuth: false,
        user: {},
    },
    mutations: {
        login(state, user) {
            state.isAuth = true;
            state.user = user;
        },
        logout(state) {
            state.isAuth = false;
            state.user = {};
        }
    }

}
