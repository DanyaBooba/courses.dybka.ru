import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useToken } from '../auth/session'

/**
 * Страницы только для гостей (вход). Вошедшего автора сразу уводит
 * туда, куда он шёл до входа, или в панель управления.
 */
export default function GuestMiddleware() {
    const token = useToken()
    const location = useLocation()

    if (token) {
        return <Navigate to={location.state?.from ?? '/admin'} replace />
    }

    return <Outlet />
}
