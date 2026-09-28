// Запросы входа по коду из почты.
//
// Ожидаемые ответы сервера:
//   POST /auth/code    { email }        → 200 {}
//   POST /auth/verify  { email, code }  → 200 { token }
//   ошибка                               → 4xx/5xx { message: 'текст для человека' }

import { request } from '../api/client'

export function requestCode(email) {
    return request('/auth/code', { method: 'POST', body: { email } })
}

export async function verifyCode(email, code) {
    const data = await request('/auth/verify', { method: 'POST', body: { email, code } })

    if (!data.token) {
        throw new Error('Сервер не выдал доступ. Попробуйте войти ещё раз.')
    }

    return data.token
}
