// Перетаскивание блоков урока: блок зажимают и тянут — он приподнимается
// с тенью и едет за курсором, а соседи расступаются, показывая, куда он
// встанет. Сделано на pointer-событиях: родной drag-and-drop браузера рисует
// полупрозрачный снимок, и ни тень, ни раздвигание соседей с ним не сделать.

import { useEffect, useRef, useState } from 'react'

// Столько пикселей надо протянуть, чтобы нажатие стало перетаскиванием, а не щелчком
const THRESHOLD = 5
// У края окна страница сама прокручивается — можно утащить блок далеко
const EDGE = 72

/**
 * `containerRef` — холст, блоки в нём помечены `data-block-index`.
 * `onMove(from, to)` — отпустили блок на новом месте.
 *
 * Возвращает `{ start(event, index), styleFor(index), dragging, consumeClick() }`:
 * `start` вешается на pointerdown, `styleFor` — sx блока во время
 * перетаскивания, `consumeClick` — true, если щелчок после отпускания
 * надо проглотить (он не должен выбирать блок или открывать меню).
 */
export default function useBlockDrag(containerRef, onMove) {
    const [drag, setDrag] = useState(null)
    const session = useRef(null)
    const swallowClick = useRef(false)
    const onMoveRef = useRef(onMove)
    useEffect(() => {
        onMoveRef.current = onMove
    })

    // Ушли со страницы посреди перетаскивания — снимаем слушатели
    useEffect(() => () => session.current?.stop(), [])

    const start = (event, index) => {
        if (event.button !== 0 || session.current) return

        const startY = event.clientY + window.scrollY
        let lastClientY = event.clientY
        let geometry = null
        let frame = 0
        let current = null

        // Раскладка блоков на момент старта — в координатах страницы
        const measure = () => {
            const frames = [...(containerRef.current?.querySelectorAll(':scope > [data-block-index]') ?? [])]
            const rects = frames.map((node) => {
                const rect = node.getBoundingClientRect()
                return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY }
            })
            const own = rects[index]
            // На сколько расступаются соседи: высота блока и зазор до соседа
            const next = rects[index + 1]
            const prev = rects[index - 1]
            const gap = next ? next.top - own.bottom : prev ? own.top - prev.bottom : 0
            return { centers: rects.map((rect) => (rect.top + rect.bottom) / 2), shift: own.bottom - own.top + gap }
        }

        const update = () => {
            const dy = lastClientY + window.scrollY - startY
            const center = geometry.centers[index] + dy
            const to = geometry.centers.filter((value, i) => i !== index && value < center).length
            current = { from: index, to, dy, shift: geometry.shift }
            setDrag(current)
        }

        const autoScroll = () => {
            const bottom = window.innerHeight - EDGE
            const speed = lastClientY < EDGE ? -(EDGE - lastClientY) / 4 : lastClientY > bottom ? (lastClientY - bottom) / 4 : 0
            if (speed) {
                window.scrollBy(0, speed)
                update()
            }
            frame = requestAnimationFrame(autoScroll)
        }

        const onPointerMove = (moveEvent) => {
            lastClientY = moveEvent.clientY
            if (!geometry) {
                if (Math.abs(moveEvent.clientY + window.scrollY - startY) < THRESHOLD) return
                geometry = measure()
                window.getSelection()?.removeAllRanges()
                document.body.style.userSelect = 'none'
                document.body.style.cursor = 'grabbing'
                frame = requestAnimationFrame(autoScroll)
            }
            moveEvent.preventDefault()
            update()
        }

        const stop = () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
            window.removeEventListener('pointercancel', stop)
            window.removeEventListener('keydown', onKeyDown)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
            session.current = null
            setDrag(null)
        }

        const onPointerUp = () => {
            const result = current
            // Щелчок, если он будет, придёт сразу после отпускания; если не пришёл —
            // следующий настоящий щелчок глотать нельзя
            if (geometry) {
                swallowClick.current = true
                setTimeout(() => (swallowClick.current = false), 0)
            }
            stop()
            if (result && result.to !== result.from) onMoveRef.current(result.from, result.to)
        }

        // Esc — передумали: блок возвращается на место
        const onKeyDown = (keyEvent) => {
            if (keyEvent.key !== 'Escape' || !geometry) return
            swallowClick.current = true
            setTimeout(() => (swallowClick.current = false), 0)
            stop()
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
        window.addEventListener('pointercancel', stop)
        window.addEventListener('keydown', onKeyDown)
        session.current = { stop }
    }

    const styleFor = (index) => {
        if (!drag) return {}
        const { from, to, dy, shift } = drag

        if (index === from) {
            return {
                zIndex: 5,
                isolation: 'isolate',
                transform: `translateY(${dy}px) scale(1.015)`,
                cursor: 'grabbing',
                // Подложка с тенью — по рамке блока, под его содержимым
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: { xs: '-6px -8px', md: '-8px -14px' },
                    zIndex: -1,
                    bgcolor: 'background.body',
                    boxShadow: 'lg',
                    pointerEvents: 'none',
                },
            }
        }

        let offset = 0
        if (from < to && index > from && index <= to) offset = -shift
        if (to < from && index >= to && index < from) offset = shift
        return { transform: `translateY(${offset}px)`, transition: 'transform 0.18s ease' }
    }

    return {
        start,
        styleFor,
        dragging: drag !== null,
        consumeClick: () => {
            const swallow = swallowClick.current
            swallowClick.current = false
            return swallow
        },
    }
}
