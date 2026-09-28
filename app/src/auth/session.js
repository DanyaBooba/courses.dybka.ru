import { useSyncExternalStore } from 'react'

// Сессия автора: токен после входа по коду из почты.
// Хранится в localStorage, чтобы переживать перезагрузку страницы;
// изменения разлетаются по всем подпискам и по соседним вкладкам.

const KEY = 'dd-token'
const listeners = new Set()

// Запасной вариант, если хранилище недоступно (приватный режим):
// тогда сессия живёт до перезагрузки страницы
let memory = null

function read() {
    try {
        return localStorage.getItem(KEY)
    } catch {
        return memory
    }
}

function notify() {
    listeners.forEach((listener) => listener())
}

function subscribe(listener) {
    listeners.add(listener)
    window.addEventListener('storage', listener)

    return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', listener)
    }
}

export function getToken() {
    return read()
}

/** Сохраняет токен; `null` — выход из аккаунта. */
export function setToken(token) {
    memory = token || null
    try {
        if (token) localStorage.setItem(KEY, token)
        else localStorage.removeItem(KEY)
    } catch {
        // Хранилище недоступно — токен остаётся в памяти
    }
    notify()
}

export function useToken() {
    return useSyncExternalStore(subscribe, read, () => null)
}
