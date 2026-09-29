// Пользователи — только для администратора.
//
//   GET   /admin/users             → { users } — у каждого его курсы:
//                                    [{ id, title, disabled, reviewRequestedAt, updatedAt }]
//   PATCH /admin/users/:id/access  → { user }  — выдать или забрать доступ

import { request } from '../api/client'
import { updateQueries, useQuery } from '../api/query'
import { ACCESS, useProfile } from '../api/courses'
import { useToken } from '../auth/session'

export const ACCESS_LABELS = {
    [ACCESS.NONE]: 'Ждёт доступа',
    [ACCESS.AUTHOR]: 'Автор',
    [ACCESS.ADMIN]: 'Администратор',
}

/** Все пользователи; не администратору запрос не уходит. */
export function useAdminUsers() {
    const token = useToken()
    const { user } = useProfile()
    const admin = Boolean(user) && user.access >= ACCESS.ADMIN
    const { data, ...rest } = useQuery(admin ? `admin-users|${token ?? ''}` : null, () =>
        request('/admin/users').then((result) => result.users),
    )
    return { users: data, ...rest }
}

/** Выдать уровень доступа. Список в кэше меняется сразу после ответа сервера. */
export async function setUserAccess(id, access) {
    const { user } = await request(`/admin/users/${id}/access`, { method: 'PATCH', body: { access } })
    updateQueries('admin-users|', (users) => users.map((item) => (item.id === id ? { ...item, ...user } : item)))
    return user
}
