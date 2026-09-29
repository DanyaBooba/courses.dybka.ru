// Статистика курса: просмотры и читатели.
//
//   POST /courses/:id/view { visitorId } → 204
//
// Читатель — анонимный UUID, который живёт в localStorage этого браузера:
// по нему сервер отличает новых читателей от вернувшихся. Одно открытие
// курса засчитывается не чаще раза в полчаса — перезагрузки и переходы
// между уроками счётчик не накручивают.

import { useEffect } from 'react'

import { request } from './client'
import plural from '../data/plural'

const VISITOR_KEY = 'dd-visitor'
const SEEN_KEY = 'dd-course-views'
const COOLDOWN = 30 * 60 * 1000

function visitorId() {
    try {
        let id = localStorage.getItem(VISITOR_KEY)
        if (!id) {
            id = crypto.randomUUID()
            localStorage.setItem(VISITOR_KEY, id)
        }
        return id
    } catch {
        // Хранилище недоступно — не считаем вовсе, иначе каждый заход станет новым читателем
        return null
    }
}

/** true — курс в этом браузере уже засчитан недавно; иначе отмечает его. */
function recentlySeen(courseId) {
    try {
        const seen = JSON.parse(localStorage.getItem(SEEN_KEY)) || {}
        const now = Date.now()
        if (now - (seen[courseId] ?? 0) < COOLDOWN) return true

        seen[courseId] = now
        localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
        return false
    } catch {
        return true
    }
}

/** Засчитать открытие курса. Закрытые курсы не считаются. */
export function useCourseView(course) {
    const id = course && !course.disabled ? course.id : null

    useEffect(() => {
        if (!id) return
        const visitor = visitorId()
        if (!visitor || recentlySeen(id)) return

        // Статистика — не повод показывать читателю ошибку
        request(`/courses/${encodeURIComponent(id)}/view`, { method: 'POST', body: { visitorId: visitor } }).catch(() => {})
    }, [id])
}

/** «12 читателей» — число вместе со склонённым словом. */
export function readersLabel(count = 0) {
    return `${count} ${plural(count, ['читатель', 'читателя', 'читателей'])}`
}

/** «34 просмотра» — число вместе со склонённым словом. */
export function viewsLabel(count = 0) {
    return `${count} ${plural(count, ['просмотр', 'просмотра', 'просмотров'])}`
}
