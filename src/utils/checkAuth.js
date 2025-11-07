export async function checkAuth(store) {
    if (store.state.isAuth) {
        return;
    }
    try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/auth/me', {
            headers: {"Content-Type": "application/json"},
            method: 'GET',
            credentials: 'include'
        });

        const user = await response.json();
        if (user !== null) {
            store.commit('auth/login', user)
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        store.commit('auth/logout')
    }
}