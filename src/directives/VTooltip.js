export default {
    mounted(el, binding) {
        // Создаём элемент подсказки
        const tooltip = document.createElement('div');
        tooltip.className = 'v-tooltip';
        tooltip.textContent = binding.value;
        // Изначально скрываем, но оставляем в потоке для анимаций
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
        document.body.appendChild(tooltip);

        let hideTimeout;

        const positionTooltip = () => {
            const rect = el.getBoundingClientRect();
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            tooltip.style.top  = `${rect.bottom + scrollY + 8}px`;
            tooltip.style.left = `${rect.left + scrollX}px`;
        };

        const show = () => {
            clearTimeout(hideTimeout);
            positionTooltip();
            tooltip.style.visibility = 'visible';
            tooltip.classList.add('show');
        };

        const hide = () => {
            // Даем небольшой таймаут, чтобы курсор успел попасть внутрь подсказки
            hideTimeout = setTimeout(() => {
                tooltip.classList.remove('show');
                // после завершения анимации прячем для pointer-events
                setTimeout(() => {
                    tooltip.style.visibility = 'hidden';
                }, 200); // совпадает с длительностью анимации
            }, 100);
        };

        // События на целевом элементе
        el.addEventListener('mouseenter', show);
        el.addEventListener('mouseleave', hide);

        // Чтобы курсор мог попасть на сам tooltip
        tooltip.addEventListener('mouseenter', show);
        tooltip.addEventListener('mouseleave', hide);

        // Сохраняем для удаления
        el._tooltip = tooltip;
        el._tooltipHandlers = { show, hide };
    },

    updated(el, binding) {
        if (binding.value !== binding.oldValue && el._tooltip) {
            el._tooltip.textContent = binding.value;
        }
    },

    unmounted(el) {
        if (el._tooltip) {
            const { show, hide } = el._tooltipHandlers;
            el.removeEventListener('mouseenter', show);
            el.removeEventListener('mouseleave', hide);
            el._tooltip.removeEventListener('mouseenter', show);
            el._tooltip.removeEventListener('mouseleave', hide);
            document.body.removeChild(el._tooltip);
        }
    }
};
