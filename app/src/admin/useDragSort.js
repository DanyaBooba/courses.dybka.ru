// Перетаскивание строк списка мышью — на родном drag-and-drop браузера,
// без библиотек. Пока строку тащат, `gap` — щель между строками, куда она
// встанет: 0 — перед первой, n — после последней. Её показывает линия.

import { useState } from 'react'

/**
 * `total` — сколько всего строк, `count` — сколько первых из них можно двигать:
 * строки после них (итоговая страница) стоят на месте, встать за них нельзя.
 * `onMove(from, to)` — индекс строки и её новое место после перестановки.
 *
 * Возвращает `{ itemProps(index), dropLine(index), dragging(index) }`:
 * `itemProps` раздаётся строкам, `dropLine` говорит, где рисовать линию
 * ('top' | 'bottom' | null), `dragging` — эту ли строку сейчас тащат.
 */
export default function useDragSort(total, count, onMove) {
    const [drag, setDrag] = useState(null)

    const itemProps = (index) => {
        const movable = index < count
        return {
            draggable: movable,
            onDragStart: (event) => {
                if (!movable) return
                event.dataTransfer.effectAllowed = 'move'
                // Без данных Firefox не начинает перетаскивание
                event.dataTransfer.setData('text/plain', String(index))
                setDrag({ from: index, gap: index })
            },
            onDragOver: (event) => {
                if (!drag) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                const rect = event.currentTarget.getBoundingClientRect()
                const below = event.clientY > rect.top + rect.height / 2
                const gap = Math.min(below ? index + 1 : index, count)
                if (gap !== drag.gap) setDrag({ ...drag, gap })
            },
            onDrop: (event) => {
                if (!drag) return
                event.preventDefault()
                const to = drag.gap > drag.from ? drag.gap - 1 : drag.gap
                setDrag(null)
                if (to !== drag.from) onMove(drag.from, to)
            },
            onDragEnd: () => setDrag(null),
        }
    }

    // Щель на своём месте (прямо над или под тащимой строкой) линией не отмечаем
    const idle = (gap) => !drag || gap === drag.from || gap === drag.from + 1

    const dropLine = (index) => {
        if (!idle(index) && drag.gap === index) return 'top'
        if (!idle(index + 1) && drag.gap === index + 1 && index + 1 === total) return 'bottom'
        return null
    }

    return {
        itemProps,
        dropLine,
        dragging: (index) => drag?.from === index,
    }
}

/** Стили строки: линия-подсказка и полупрозрачность у тащимой. */
export function dragSx(line, dragging, color = 'var(--dd-palette-text-primary)') {
    return {
        position: 'relative',
        opacity: dragging ? 0.4 : 1,
        '&::before': line
            ? {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                [line]: -1,
                height: '2px',
                bgcolor: color,
                pointerEvents: 'none',
                zIndex: 1,
            }
            : undefined,
    }
}
