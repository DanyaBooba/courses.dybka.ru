// Запросы к API.
//
// Адрес API задаётся переменной окружения VITE_API_URL (см. .env):
//   VITE_API_URL=https://api.courses.aquarium.org.ru
//
// Если человек вошёл, к каждому запросу прикладывается его токен: так
// администратор и автор получают закрытые курсы целиком.
// Ошибка сервера приходит как { message: 'текст для человека' } и
// превращается в ApiError с этим текстом и кодом ответа.

import { getToken } from '../auth/session'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
    constructor(message, status, data = {}) {
        super(message)
        this.status = status
        this.data = data
    }
}

/**
 * `body` уходит JSON-ом, `file` — как есть, с его типом (загрузка картинок).
 */
export async function request(path, { method = 'GET', body, file } = {}) {
    const token = getToken()
    const headers = {}
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (file) headers['Content-Type'] = file.type
    if (token) headers.Authorization = `Bearer ${token}`

    let response

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: file ?? (body === undefined ? undefined : JSON.stringify(body)),
        })
    } catch {
        throw new ApiError('Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.', 0)
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new ApiError(data.message || 'Что-то пошло не так. Попробуйте ещё раз.', response.status, data)
    }

    return data
}
