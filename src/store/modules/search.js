export default {
    namespaced: true,
    state: {
        query: '',
    },
    mutations: {
        setQuery (state, query) {
            state.query = query
        }
    }
}