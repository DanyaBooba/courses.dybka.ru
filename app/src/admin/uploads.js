// Загрузка картинок из панели управления: файл уходит на сервер (POST /uploads),
// в ответ — постоянный адрес картинки.

import { ApiError, request } from '../api/client'
import { notify } from './notices'

// SVG сервер не принимает: открытый напрямую, он может выполнить скрипт
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_SIZE_MB = 10

/** Картинки из перетаскивания или вставки; остальные файлы отбрасываются с пояснением. */
export function pickImages(fileList) {
    const files = Array.from(fileList ?? [])
    const images = files.filter((file) => IMAGE_TYPES.includes(file.type))
    if (images.length < files.length) notify('Подойдут картинки JPG, PNG, WebP, GIF или AVIF — остальные файлы пропущены.')
    return images
}

/** Перетаскивают ли сейчас файлы (а не выделенный текст или ссылку). */
export function isFileDrag(event) {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

export async function uploadImage(file) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new ApiError(`«${file.name}» больше ${MAX_SIZE_MB} МБ — уменьшите фото.`, 413)
    }
    const { url } = await request('/uploads', { method: 'POST', file })
    return url
}

/**
 * Загружает несколько картинок и возвращает адреса тех, что загрузились.
 * Про остальные говорит всплывающим сообщением — вставка не должна падать целиком.
 */
export async function uploadImages(files) {
    const results = await Promise.allSettled(files.map(uploadImage))
    results
        .filter((result) => result.status === 'rejected')
        .forEach((result) => notify(result.reason?.message || 'Не получилось загрузить фото.'))
    return results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
}
