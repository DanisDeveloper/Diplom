export function truncate(text, limit = 15) {
    return text.length > limit ? text.slice(0, limit) + '…' : text;
}