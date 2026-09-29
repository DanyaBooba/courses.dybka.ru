// Какие панели админки спрятаны: левое меню и верхняя полоса. Выбор живёт
// в localStorage — после перезагрузки панели остаются такими, как их оставили.

import { useSyncExternalStore } from 'react'

const KEY = 'admin-chrome'
const listeners = new Set()

function read() {
    try {
        const saved = JSON.parse(localStorage.getItem(KEY))
        return { sidebar: Boolean(saved?.sidebar), topbar: Boolean(saved?.topbar) }
    } catch {
        return { sidebar: false, topbar: false }
    }
}

let hidden = read()

function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

/** `{ sidebar, topbar }` — true, если панель спрятана. */
export function useHiddenChrome() {
    return useSyncExternalStore(subscribe, () => hidden)
}

/** Спрятать или показать панель: `part` — 'sidebar' | 'topbar'. */
export function setChromeHidden(part, value) {
    hidden = { ...hidden, [part]: value }
    try {
        localStorage.setItem(KEY, JSON.stringify(hidden))
    } catch {
        // Хранилище недоступно — панель спрячется только до перезагрузки
    }
    listeners.forEach((listener) => listener())
}
