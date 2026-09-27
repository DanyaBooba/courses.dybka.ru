/**
 * Русское склонение после числа: 1 урок, 2 урока, 5 уроков.
 *
 *   plural(3, ['урок', 'урока', 'уроков']) → 'урока'
 */
export default function plural(count, forms) {
    const n = Math.abs(count) % 100
    const n1 = n % 10

    if (n > 10 && n < 20) return forms[2]
    if (n1 > 1 && n1 < 5) return forms[1]
    if (n1 === 1) return forms[0]
    return forms[2]
}

/** «10 уроков» — число вместе со склонённым словом. */
export function lessonsLabel(count) {
    return `${count} ${plural(count, ['урок', 'урока', 'уроков'])}`
}
