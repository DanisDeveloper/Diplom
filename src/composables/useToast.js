import { reactive } from 'vue';

const state = reactive({
    toasts: [] // массив тостов
});

let idCounter = 0;

export function useToast() {
    /**
     * Показывает новый тост
     * @param {string} message - текст тоста
     * @param {object} options - опции: duration (ms), background (цвет)
     */
    const show = (message, options = {}) => {
        const id = idCounter++;
        const duration = options.duration || 5000;
        const background = options.background || '#f44336';

        const toast = reactive({
            id,
            message,
            background,
            progress: 100,
            duration,
            visible: true
        });

        state.toasts.push(toast);

        const startTime = Date.now();

        // обновление прогресс-бара
        const intervalId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = duration - elapsed;
            toast.progress = Math.max((remaining / duration) * 100, 0);
            if (remaining <= 0) {
                clearInterval(intervalId);
                close(id);
            }
        }, 50);

        return id;
    };

    /**
     * Закрывает тост по id
     * @param {number} id
     */
    const close = (id) => {
        const index = state.toasts.findIndex(t => t.id === id);
        if (index !== -1) state.toasts.splice(index, 1);
    };

    return { state, show, close };
}
