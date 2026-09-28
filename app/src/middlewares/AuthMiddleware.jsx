import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useToken } from '../auth/session'

/**
 * Пускает дальше только вошедшего автора. Остальных отправляет на вход
 * и запоминает, куда они шли, — после входа вернём туда же.
 */
export default function AuthMiddleware() {
    const token = useToken()
    const location = useLocation()

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return <Outlet />
}
