// Курсы и профиль из API.
//
//   GET /courses      → { courses } — каталог: курсы без текста уроков,
//                       у уроков только { slug, title, short }
//   GET /courses/:id  → { course }  — курс целиком, с уроками
//                       403 { status: 'wip' } — курс закрыт, над ним ведётся работа
//   GET /profile      → { user }    — кто вошёл и с какими правами

import { useEffect } from 'react'

import { request } from './client'
import { useQuery } from './query'
import { setToken, useToken } from '../auth/session'

/** Уровни доступа — те же, что на сервере (config/access.js). */
export const ACCESS = {
    NONE: 0,
    AUTHOR: 1,
    ADMIN: 100,
}

export function useCourses() {
    const token = useToken()
    const { data, ...rest } = useQuery(`courses|${token ?? ''}`, () =>
        request('/courses').then((result) => result.courses),
    )
    return { courses: data, ...rest }
}

export function useCourse(id) {
    const token = useToken()
    const { data, ...rest } = useQuery(id ? `course:${id}|${token ?? ''}` : null, () =>
        request(`/courses/${encodeURIComponent(id)}`).then((result) => result.course),
    )
    return { course: data, ...rest }
}

export function useProfile() {
    const token = useToken()
    const { data, error, ...rest } = useQuery(token ? `profile|${token}` : null, () =>
        request('/profile').then((result) => result.user),
    )

    // Токен истёк или его отозвали — выходим, чтобы не слать его дальше
    useEffect(() => {
        if (error?.status === 401) setToken(null)
    }, [error])

    return { user: data ?? null, error, ...rest }
}

/** Над курсом ведётся работа: сервер отдал 403 со статусом 'wip'. */
export function isWip(error) {
    return error?.status === 403 && error.data?.status === 'wip'
}

/** Можно ли открыть курс: открытый — всем, закрытый — администратору и автору. */
export function canOpen(course, user) {
    if (!course) return false
    if (!course.disabled) return true
    if (!user) return false
    return user.access >= ACCESS.ADMIN || course.ownerId === user.id
}
