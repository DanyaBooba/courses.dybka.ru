// Запросы входа по коду из почты.
//
// Адрес API задаётся переменной окружения VITE_API_URL (см. .env):
//   VITE_API_URL=https://api.courses.aquarium.org.ru
//
// Ожидаемые ответы сервера:
//   POST /auth/code    { email }        → 200 {}
//   POST /auth/verify  { email, code }  → 200 { token }
//   ошибка                               → 4xx/5xx { message: 'текст для человека' }

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function post(path, body) {
    let response

    try {
        response = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
    } catch {
        throw new Error('Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.')
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(data.message || 'Что-то пошло не так. Попробуйте ещё раз.')
    }

    return data
}

export function requestCode(email) {
    return post('/auth/code', { email })
}

export async function verifyCode(email, code) {
    const data = await post('/auth/verify', { email, code })

    if (!data.token) {
        throw new Error('Сервер не выдал доступ. Попробуйте войти ещё раз.')
    }

    return data.token
}
