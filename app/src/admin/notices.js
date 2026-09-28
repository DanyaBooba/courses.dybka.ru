// Всплывающие сообщения панели: «фото не загрузилось», «не удалось удалить».
// Показывает их AdminLayout, вызывать можно откуда угодно.

import { useSyncExternalStore } from 'react'

let notices = []
let counter = 0
const listeners = new Set()

function emit() {
    listeners.forEach((listener) => listener())
}

export function notify(message) {
    counter += 1
    notices = [...notices, { id: counter, message }]
    emit()
}

export function dismiss(id) {
    notices = notices.filter((notice) => notice.id !== id)
    emit()
}

export function useNotices() {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        () => notices,
    )
}
