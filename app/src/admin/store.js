// Данные панели управления — из API.
//
// Каталог (список программ) — тот же запрос GET /courses, что у сайта: с токеном
// администратора в нём есть и закрытые курсы. Открытая программа — черновик:
// курс целиком (GET /courses/:id), который правится в памяти мгновенно, а на
// сервер уходит целиком (PUT /courses/:id) через секунду после последней правки.
// Так набор текста не ждёт сети, а сохранение не дёргается на каждую букву.
//
// Черновик: { status: 'loading' | 'ready' | 'error', course, error,
//             save: 'saved' | 'pending' | 'saving' | 'failed', saveError }

import { useEffect, useSyncExternalStore } from 'react'

import { request } from '../api/client'
import { dropQueries, updateQueries } from '../api/query'
import { useCourses } from '../api/courses'

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SAVE_DELAY = 1000
const FINAL_SLUG = 'end'

const drafts = new Map()
const timers = new Map()
// Номер правки: ответ сервера на старую версию не должен отметить новую сохранённой
const versions = new Map()
const listeners = new Set()

function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

function notify() {
    listeners.forEach((listener) => listener())
}

function setDraft(id, change) {
    drafts.set(id, { ...drafts.get(id), ...change })
    notify()
}

// ── Каталог ──────────────────────────────────────────────────────────────

/** Курс для каталога: уроки без текста — как их отдаёт GET /courses. */
function summary(course) {
    const rest = { ...course }
    delete rest.about
    return { ...rest, pages: course.pages.map(({ slug, title, short }) => ({ slug, title, short })) }
}

// Каталог в кэше правим на месте: левая панель и главная панели сразу видят
// новое название или урок, не дожидаясь сохранения
function patchCatalog(updater) {
    updateQueries('courses|', (courses) => updater(courses ?? []))
}

export function useAdminCourses() {
    return useCourses()
}

// ── Черновик программы ───────────────────────────────────────────────────

function load(id) {
    setDraft(id, { status: 'loading', error: null, save: 'saved' })
    request(`/courses/${encodeURIComponent(id)}`)
        .then(({ course }) => setDraft(id, { status: 'ready', course }))
        .catch((error) => setDraft(id, { status: 'error', error }))
}

/**
 * Программа целиком: `{ course, loading, error, reload, save, saveError }`.
 * Загружается при первом обращении и дальше живёт в памяти вкладки.
 */
export function useAdminCourse(id) {
    const draft = useSyncExternalStore(subscribe, () => (id ? drafts.get(id) : undefined))

    useEffect(() => {
        if (id && !drafts.has(id)) load(id)
    }, [id])

    return {
        course: draft?.status === 'ready' ? draft.course : null,
        loading: Boolean(id) && (!draft || draft.status === 'loading'),
        error: draft?.error ?? null,
        reload: () => load(id),
        save: draft?.save ?? 'saved',
        saveError: draft?.saveError ?? null,
    }
}

async function flush(id) {
    clearTimeout(timers.get(id))
    timers.delete(id)

    const draft = drafts.get(id)
    if (!draft?.course) return
    const version = versions.get(id)

    setDraft(id, { save: 'saving', saveError: null })
    try {
        await request(`/courses/${encodeURIComponent(id)}`, { method: 'PUT', body: draft.course })
        // Сайт в этой же вкладке должен показать курс уже с правками
        dropQueries(`course:${id}|`)
        // Пока запрос летел, курс успели поправить — сохраняем ещё раз
        if (versions.get(id) !== version) flush(id)
        else setDraft(id, { save: 'saved' })
    } catch (error) {
        setDraft(id, { save: 'failed', saveError: error })
    }
}

/** Сохранить сейчас, не дожидаясь паузы, — кнопка «Повторить». */
export function retrySave(id) {
    flush(id)
}

/** Есть ли несохранённые правки — чтобы предупредить при закрытии вкладки. */
export function hasUnsaved() {
    return [...drafts.values()].some((draft) => draft.save && draft.save !== 'saved')
}

export function updateCourse(id, change) {
    const draft = drafts.get(id)
    if (draft?.status !== 'ready') return

    const course = { ...draft.course, ...(typeof change === 'function' ? change(draft.course) : change) }
    versions.set(id, (versions.get(id) ?? 0) + 1)
    setDraft(id, { course, save: draft.save === 'saving' ? 'saving' : 'pending' })
    patchCatalog((courses) => courses.map((item) => (item.id === id ? { ...item, ...summary(course) } : item)))

    clearTimeout(timers.get(id))
    timers.set(id, setTimeout(() => {
        // Предыдущее сохранение ещё идёт — flush сам повторит его с новой версией
        if (drafts.get(id)?.save !== 'saving') flush(id)
    }, SAVE_DELAY))
}

// ── Программы ────────────────────────────────────────────────────────────

/** Шаблон новой программы: закрыта, пока автор не откроет её сам. */
export function blankCourse() {
    return {
        id: '',
        title: '',
        subtitle: '',
        accent: 'mint',
        section: 'web',
        difficulty: 1,
        disabled: true,
        level: 'Для начинающих',
        duration: '',
        image: null,
        video: null,
        chips: [],
        github: null,
        author: { name: 'Даниил Дыбка', email: 'daniil@dybka.ru', telegram: 'https://ddybka.t.me' },
        certificate: null,
        about: [{ block: 'p', content: '' }],
        pages: [],
    }
}

/** Что не так с адресом курса; `null` — всё в порядке. */
export function courseIdError(id, courses = [], { except } = {}) {
    if (!id) return 'Придумайте адрес'
    if (!SLUG_PATTERN.test(id)) return 'Только латиница, цифры и дефис'
    if (id !== except && courses.some((course) => course.id === id)) return 'Такой адрес уже занят'
    return null
}

/** Создаёт программу на сервере. Ошибку (например, занятый адрес) бросает дальше. */
export async function createCourse(course) {
    const { course: created } = await request('/courses', { method: 'POST', body: course })
    drafts.set(created.id, { status: 'ready', course: created, save: 'saved' })
    patchCatalog((courses) => [...courses, summary(created)])
    return created.id
}

export async function deleteCourse(id) {
    clearTimeout(timers.get(id))
    await request(`/courses/${encodeURIComponent(id)}`, { method: 'DELETE' })
    drafts.delete(id)
    patchCatalog((courses) => courses.filter((course) => course.id !== id))
    dropQueries(`course:${id}|`)
}

// ── Уроки ────────────────────────────────────────────────────────────────
// Уроки лежат внутри курса, поэтому любая правка урока — правка черновика курса.

/** Следующий свободный номер урока: слаги уроков — «1», «2», «3»… */
function nextSlug(pages) {
    const numbers = pages.map((page) => Number(page.slug)).filter(Number.isInteger)
    return String(Math.max(0, ...numbers) + 1)
}

/** Что не так со слагом урока; `null` — всё в порядке. */
export function lessonSlugError(course, slug, { except } = {}) {
    if (!slug) return 'Придумайте адрес'
    if (!SLUG_PATTERN.test(slug)) return 'Только латиница, цифры и дефис'
    if (slug !== except && course.pages.some((page) => page.slug === slug)) return 'Такой адрес уже занят'
    return null
}

/**
 * Новый урок встаёт последним, но перед итоговой страницей курса.
 * Возвращает слаг или null, если программа ещё не загрузилась.
 */
export function createLesson(courseId) {
    const draft = drafts.get(courseId)
    if (draft?.status !== 'ready') return null

    const slug = nextSlug(draft.course.pages)
    const lesson = { slug, title: '', short: '', content: [{ block: 'p', content: '' }] }

    updateCourse(courseId, ({ pages }) => {
        const finalIndex = pages.findIndex((page) => page.slug === FINAL_SLUG)
        const at = finalIndex === -1 ? pages.length : finalIndex
        return { pages: [...pages.slice(0, at), lesson, ...pages.slice(at)] }
    })

    return slug
}

export function updateLesson(courseId, slug, change) {
    updateCourse(courseId, ({ pages }) => ({
        pages: pages.map((page) => (page.slug === slug ? { ...page, ...change } : page)),
    }))
}

export function deleteLesson(courseId, slug) {
    updateCourse(courseId, ({ pages }) => ({ pages: pages.filter((page) => page.slug !== slug) }))
}

/** Сдвигает урок на `step` позиций (−1 — выше, 1 — ниже). */
export function moveLesson(courseId, slug, step) {
    updateCourse(courseId, ({ pages }) => {
        const from = pages.findIndex((page) => page.slug === slug)
        const to = from + step
        if (from === -1 || to < 0 || to >= pages.length) return {}

        const next = [...pages]
        const [page] = next.splice(from, 1)
        next.splice(to, 0, page)
        return { pages: next }
    })
}
