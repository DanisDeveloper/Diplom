export default {
    namespaced: true,
    state: {
        API_URL: import.meta.env.VITE_API_URL,
        PUBLIC_API_URL: import.meta.env.VITE_PUBLIC_API_URL,
    }
}