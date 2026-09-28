import { useCallback, useEffect, useSyncExternalStore } from 'react'

// Маленький кэш ответов API на время жизни вкладки.
//
// Один и тот же запрос не уходит дважды: вернулись на главную из курса —
// карточки уже на месте, без скелетов. Ключ запроса включает токен, поэтому
// после входа или выхода данные загружаются заново — уже с другими правами.
//
// Запись кэша: { status: 'loading' | 'ready' | 'error', data, error }

const cache = new Map()
const listeners = new Set()

function notify() {
    listeners.forEach((listener) => listener())
}

function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

function load(key, fetcher) {
    cache.set(key, { status: 'loading', data: cache.get(key)?.data, error: null })
    notify()

    fetcher()
        .then((data) => cache.set(key, { status: 'ready', data, error: null }))
        .catch((error) => cache.set(key, { status: 'error', data: undefined, error }))
        .finally(notify)
}

/**
 * Поправить уже загруженные данные на месте, не спрашивая сервер: например,
 * переименовали курс в панели — каталог в кэше сразу показывает новое название.
 * Меняются все готовые записи, чей ключ начинается с `prefix`.
 */
export function updateQueries(prefix, updater) {
    for (const [key, entry] of cache) {
        if (key.startsWith(prefix) && entry.status === 'ready') {
            cache.set(key, { ...entry, data: updater(entry.data) })
        }
    }
    notify()
}

/** Сбросить записи по префиксу ключа: при следующем показе они загрузятся заново. */
export function dropQueries(prefix) {
    for (const key of [...cache.keys()]) {
        if (key.startsWith(prefix)) cache.delete(key)
    }
    notify()
}

/**
 * Данные по ключу: `{ data, error, loading, reload }`.
 * `key = null` — запрос не нужен (например, гость и профиль).
 */
export function useQuery(key, fetcher) {
    const entry = useSyncExternalStore(subscribe, () => (key ? cache.get(key) : undefined))

    // Запись пропала (её сбросили после правки) — загружаем заново
    const missing = !entry
    useEffect(() => {
        if (key && !cache.has(key)) load(key, fetcher)
        // fetcher — новая функция на каждом рендере, запрос определяется ключом
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, missing])

    const reload = useCallback(() => {
        if (key) load(key, fetcher)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    return {
        data: entry?.data,
        error: entry?.error ?? null,
        // До первого эффекта записи ещё нет — это тоже загрузка
        loading: Boolean(key) && (!entry || entry.status === 'loading'),
        reload,
    }
}
