export default {
    namespaced: true,
    state:{
        isLoadingPage: false,
        errorStatus: null,
    },
    mutations: {
        setLoading(state, loading){
            state.isLoadingPage = loading
        },
        setError(state, error){
            state.errorStatus = error
        },
        clearError(state){
            state.errorStatus = null
        }
    }
}