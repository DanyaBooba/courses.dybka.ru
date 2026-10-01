// Данные панели управления — из API.
//
// Каталог (список программ) — тот же запрос GET /courses, что у сайта: с токеном
// администратора в нём есть и закрытые курсы. Открытая программа — черновик:
// курс целиком (GET /courses/:id), который правится в памяти мгновенно, а на
// сервер уходит целиком (PUT /courses/:id) через секунду после последней правки.
// Так набор текста не ждёт сети, а сохранение не дёргается на каждую букву.
//
// Черновик: { status: 'loading' | 'ready' | 'error', course, error,
//             save: 'saved' | 'pending' | 'saving' | 'failed', saveError,
//             manualDate — дата изменения, которую автор выставил сам }
//
// Дату изменения (updatedAt) сервер ставит сам при каждом сохранении. Если
// автор поменял её вручную, она уходит с каждым сохранением до перезагрузки
// панели — иначе первая же правка следом перебила бы её текущим временем.

import { useEffect, useSyncExternalStore } from 'react'

import { request } from '../api/client'
import { dropQueries, updateQueries } from '../api/query'
import { ACCESS, useCourses, useProfile } from '../api/courses'

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

/** Программы в панели: администратору — все, автору — только свои. */
export function useAdminCourses() {
    const { courses, ...rest } = useCourses()
    const { user } = useProfile()
    const own = !user || user.access >= ACCESS.ADMIN ? courses : courses?.filter((course) => course.ownerId === user.id)
    return { courses: own, ...rest }
}

/** Может ли пользователь сам открывать курсы читателям — только администратор. */
export function useCanPublish() {
    const { user } = useProfile()
    return Boolean(user) && user.access >= ACCESS.ADMIN
}

// ── Черновик программы ───────────────────────────────────────────────────

function load(id) {
    setDraft(id, { status: 'loading', error: null, save: 'saved', manualDate: null })
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

    // Дата изменения уходит, только если её выставили вручную
    const body = { ...draft.course }
    delete body.updatedAt
    if (draft.manualDate) body.updatedAt = draft.manualDate

    setDraft(id, { save: 'saving', saveError: null })
    try {
        const { course: saved } = await request(`/courses/${encodeURIComponent(id)}`, { method: 'PUT', body })
        // Дату и заявку на проверку ведёт сервер: подхватываем их, не трогая
        // правки, сделанные за время запроса
        if (saved) acceptServerFields(id, saved)
        // Сайт в этой же вкладке должен показать курс уже с правками
        dropQueries(`course:${id}|`)
        // Пока запрос летел, курс успели поправить — сохраняем ещё раз
        if (versions.get(id) !== version) flush(id)
        else setDraft(id, { save: 'saved' })
    } catch (error) {
        setDraft(id, { save: 'failed', saveError: error })
    }
}

// Поля, которые ставит только сервер: дата изменения и заявка на проверку
function acceptServerFields(id, saved) {
    const current = drafts.get(id)
    if (!current?.course) return
    const fields = { updatedAt: saved.updatedAt, reviewRequestedAt: saved.reviewRequestedAt ?? null }
    setDraft(id, { course: { ...current.course, ...fields } })
    patchCatalog((courses) => courses.map((item) => (item.id === id ? { ...item, ...fields } : item)))
}

// Сначала дописываем несохранённые правки: заявка уходит на проверку
// вместе с последней версией курса
async function flushNow(id) {
    const draft = drafts.get(id)
    if (draft?.save === 'pending' || draft?.save === 'failed') await flush(id)
    if (drafts.get(id)?.save === 'failed') throw drafts.get(id).saveError
}

/** Автор отправляет скрытый курс на проверку. Ошибку бросает дальше. */
export async function requestReview(id) {
    await flushNow(id)
    const { course } = await request(`/courses/${encodeURIComponent(id)}/review`, { method: 'POST' })
    acceptServerFields(id, course)
}

/**
 * Снять курс с проверки: автор отзывает заявку, администратор возвращает
 * курс на доработку — `reason` уйдёт автору в письме.
 */
export async function cancelReview(id, reason = '') {
    const { course } = await request(`/courses/${encodeURIComponent(id)}/review`, { method: 'DELETE', body: { reason } })
    acceptServerFields(id, course)
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

/** Выставить дату изменения вручную: `date` — строка ISO. */
export function setCourseDate(id, date) {
    if (drafts.get(id)?.status !== 'ready') return
    drafts.set(id, { ...drafts.get(id), manualDate: date })
    updateCourse(id, { updatedAt: date })
}

// ── Программы ────────────────────────────────────────────────────────────

/**
 * Шаблон новой программы: закрыта, пока её не откроют. У администратора
 * автор — Даниил Дыбка, у приглашённого автора — он сам, из профиля.
 */
export function blankCourse(user) {
    const own = user && user.access < ACCESS.ADMIN
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
        author: own
            ? { name: user.name || '', email: user.email, telegram: null }
            : { name: 'Даниил Дыбка', email: 'daniil@dybka.ru', telegram: 'https://ddybka.t.me' },
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
    updateCourse(courseId, ({ pages }) => {
        const next = pages.map((page) => (page.slug === slug ? { ...page, ...change } : page))
        if (change.slug !== FINAL_SLUG || slug === FINAL_SLUG) return { pages: next }

        // Урок с адресом end становится итоговым — и уходит в конец программы
        const from = next.findIndex((page) => page.slug === FINAL_SLUG)
        const [final] = next.splice(from, 1)
        return { pages: renumber([...next, final]).pages }
    })
}

/**
 * Уроки с номером вместо адреса («1», «2», «3»…) нумеруются заново по месту
 * в программе: номер в адресе всегда совпадает с номером урока на сайте.
 * Уроки с придуманным адресом и итоговая страница его не меняют, но место
 * в счёте занимают. Возвращает `{ pages, renamed: { старый: новый } }`.
 */
function renumber(pages) {
    const renamed = {}
    let number = 0
    const next = pages.map((page) => {
        if (page.slug === FINAL_SLUG) return page
        number += 1
        if (!/^\d+$/.test(page.slug) || page.slug === String(number)) return page
        renamed[page.slug] = String(number)
        return { ...page, slug: String(number) }
    })
    return { pages: next, renamed }
}

/** Удаляет урок; следующие за ним номера сдвигаются. Возвращает `{ старый: новый }`. */
export function deleteLesson(courseId, slug) {
    let renamed = {}
    updateCourse(courseId, ({ pages }) => {
        const result = renumber(pages.filter((page) => page.slug !== slug))
        renamed = result.renamed
        return { pages: result.pages }
    })
    return renamed
}

/**
 * Ставит урок на место `to` (индекс в `course.pages`) и перенумеровывает уроки.
 * Итоговая страница всегда остаётся последней. Возвращает `{ старый: новый }`
 * — чтобы открытый урок перешёл на свой новый адрес.
 */
export function moveLesson(courseId, slug, to) {
    let renamed = {}
    updateCourse(courseId, ({ pages }) => {
        const from = pages.findIndex((page) => page.slug === slug)
        const finalIndex = pages.findIndex((page) => page.slug === FINAL_SLUG)
        const last = finalIndex === -1 ? pages.length - 1 : finalIndex - 1
        if (from === -1 || slug === FINAL_SLUG || to === from || to < 0 || to > last) return {}

        const next = [...pages]
        const [page] = next.splice(from, 1)
        next.splice(to, 0, page)
        const result = renumber(next)
        renamed = result.renamed
        return { pages: result.pages }
    })
    return renamed
}
