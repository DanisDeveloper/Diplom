export async function checkAuth(store) {
    try {
        const response = await fetch('http://localhost:8000/auth/me', {
            method: 'GET',
            credentials: 'include'
        });
        const user = await response.json();
        if(user !== null) {
            store.commit('login', user)
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        store.commit('logout')
    }
}