// Дата изменения курса в панели: сервер отдаёт её строкой ISO в UTC,
// а показываем и правим — в часовом поясе автора.

const LONG = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

/** «2026-09-29T08:15:00.000Z» → «29 сентября 2026 г.» */
export function formatDate(iso) {
    if (!iso) return ''
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? '' : LONG.format(date)
}

/** ISO → «2026-09-29» для <input type="date">, по местному времени. */
export function toDateInput(iso) {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    const pad = (number) => String(number).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * «2026-09-29» из поля → ISO. Полдень, а не полночь: так в любом часовом
 * поясе дата не съедет на соседний день.
 */
export function fromDateInput(value) {
    if (!value) return null
    const date = new Date(`${value}T12:00:00`)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** Сегодня — верхняя граница поля: дата изменения не бывает в будущем. */
export function todayInput() {
    return toDateInput(new Date().toISOString())
}
