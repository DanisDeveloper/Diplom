export function textareaHeightHandler(textarea) {
    if(!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = textarea.scrollHeight + 'px';
}