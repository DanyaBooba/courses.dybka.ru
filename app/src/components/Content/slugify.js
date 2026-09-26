/** Якорь для заголовка, чтобы работали ссылки вида #название-раздела. */
export default function slugify(text) {
    return String(text)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '')
}
