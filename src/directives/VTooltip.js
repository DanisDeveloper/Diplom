export default {
    mounted(el, binding) {
    // Создаем элемент подсказки
    const tooltip = document.createElement('div')
    tooltip.className = 'v-tooltip'
    tooltip.textContent = binding.value
    document.body.appendChild(tooltip)

    // Скрываем по умолчанию
    tooltip.style.display = 'none'

    // Функция позиционирования
    const positionTooltip = () => {
        const rect = el.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        tooltip.style.left = `${rect.left + scrollLeft}px`
        tooltip.style.top = `${rect.bottom + scrollTop + 10}px`
    }

    // Показываем подсказку
    el.addEventListener('mouseover', () => {
        positionTooltip()
        tooltip.style.display = 'block'
    })

    // Скрываем подсказку
    el.addEventListener('mouseout', () => {
        tooltip.style.display = 'none'
    })

    // Сохраняем ссылку для удаления
    el._tooltip = tooltip
},

updated(el, binding) {
    // Обновляем текст при изменении значения
    if (binding.value !== binding.oldValue) {
        el._tooltip.textContent = binding.value
    }
},

unmounted(el) {
    // Удаляем элемент при размонтировании
    if (el._tooltip) {
        document.body.removeChild(el._tooltip)
    }
}
}