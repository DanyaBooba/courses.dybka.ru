import { useCallback, useEffect, useRef } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import IconButton from '@mui/joy/IconButton'
import { useReducedMotion } from 'framer-motion'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'

import { getAccent } from '../../theme/accents'

const SPIN_SPEED = 0.0007 // радиан за кадр при свободном вращении
const SNAP_EASING = 0.12

/** Приводит угол к диапазону (-π, π] — нужно для поворота по короткой дуге. */
function shortestArc(delta) {
    return Math.atan2(Math.sin(delta), Math.cos(delta))
}

/**
 * Курсы едут по окружности, которая лежит в плоскости XoZ и чуть повёрнута
 * к зрителю. Орбиту можно крутить колесом и перетаскиванием, а по нажатию
 * на курс окружность останавливается и выбранный курс выезжает вперёд.
 */
export default function CourseOrbit({ courses, colorScheme = 'light', selectedIndex = null, onSelect }) {
    const reduced = useReducedMotion()

    const wrapRef = useRef(null)
    const itemRefs = useRef([])

    const angle = useRef(0)
    const target = useRef(null) // null — свободное вращение
    const drag = useRef(null)
    const lastDragDistance = useRef(0)
    const hovered = useRef(false)

    const step = (Math.PI * 2) / Math.max(courses.length, 1)

    const layout = useCallback(() => {
        const wrap = wrapRef.current
        if (!wrap) return

        const width = wrap.clientWidth
        const radiusX = Math.min(width * 0.4, 400)
        const radiusY = Math.max(44, Math.min(92, width * 0.1))

        itemRefs.current.forEach((element, index) => {
            if (!element) return

            const a = angle.current + index * step
            const sin = Math.sin(a)
            const cos = Math.cos(a)
            const depth = (cos + 1) / 2 // 0 — дальний край орбиты, 1 — ближний

            const x = radiusX * sin
            const y = radiusY * cos
            const scale = 0.52 + 0.56 * depth
            const lift = selectedIndex === index ? -14 : 0

            element.style.transform = [
                `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${(y + lift).toFixed(1)}px), 0)`,
                `rotateX(${((1 - depth) * 22).toFixed(1)}deg)`,
                `rotateY(${(-sin * 20).toFixed(1)}deg)`,
                `scale(${scale.toFixed(3)})`,
            ].join(' ')
            element.style.opacity = (0.3 + 0.7 * depth).toFixed(3)
            element.style.zIndex = String(100 + Math.round(depth * 100))
            element.style.filter = depth < 0.62 ? `blur(${((0.62 - depth) * 3.6).toFixed(2)}px)` : 'none'
        })
    }, [step, selectedIndex])

    // Основной цикл: доводим орбиту до выбранного курса или крутим свободно.
    useEffect(() => {
        let frame

        const tick = () => {
            if (target.current !== null) {
                const delta = shortestArc(target.current - angle.current)
                if (Math.abs(delta) < 0.0012) {
                    angle.current += delta
                    target.current = null
                } else {
                    angle.current += delta * SNAP_EASING
                }
            } else if (!reduced && !drag.current && !hovered.current && selectedIndex === null) {
                angle.current -= SPIN_SPEED
            }

            layout()
            frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [layout, reduced, selectedIndex])

    useEffect(() => {
        const onResize = () => layout()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [layout])

    // Выбранный курс выводим вперёд.
    useEffect(() => {
        if (selectedIndex === null) return
        target.current = -selectedIndex * step
    }, [selectedIndex, step])

    const rotateBy = (amount) => {
        target.current = (target.current ?? angle.current) + amount
    }

    const onWheel = (event) => {
        const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        if (horizontal) event.preventDefault()

        target.current = null
        angle.current += (event.deltaX + event.deltaY * 0.4) * 0.0035
    }

    const onPointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        drag.current = { startX: event.clientX, startAngle: angle.current, moved: 0 }
        lastDragDistance.current = 0
        target.current = null
    }

    const onPointerMove = (event) => {
        if (!drag.current) return
        const dx = event.clientX - drag.current.startX
        drag.current.moved = Math.max(drag.current.moved, Math.abs(dx))
        const width = wrapRef.current?.clientWidth || 1
        angle.current = drag.current.startAngle + (dx / width) * 3.4
    }

    const onPointerUp = () => {
        lastDragDistance.current = drag.current?.moved ?? 0
        drag.current = null
    }

    return (
        <Box sx={{ position: 'relative' }}>
            <Box
                ref={wrapRef}
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onMouseEnter={() => {
                    hovered.current = true
                }}
                onMouseLeave={() => {
                    hovered.current = false
                    onPointerUp()
                }}
                sx={{
                    position: 'relative',
                    height: { xs: 240, sm: 300, md: 340 },
                    perspective: '1100px',
                    touchAction: 'pan-y',
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                    userSelect: 'none',
                }}
            >
                {courses.map((course, index) => {
                    const accent = getAccent(course.accent)
                    const skin = accent[colorScheme] || accent.light
                    const active = selectedIndex === index

                    return (
                        <Box
                            key={course.id}
                            ref={(element) => {
                                itemRefs.current[index] = element
                            }}
                            component="button"
                            type="button"
                            onClick={() => {
                                // отличаем нажатие от перетаскивания орбиты
                                if (lastDragDistance.current > 8) return
                                onSelect?.(index)
                            }}
                            aria-label={`Курс: ${course.title}`}
                            aria-pressed={active}
                            sx={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                width: { xs: 150, sm: 176, md: 190 },
                                px: 1.75,
                                py: 1.5,
                                textAlign: 'left',
                                font: 'inherit',
                                cursor: 'pointer',
                                borderRadius: 'lg',
                                background: skin.gradient,
                                border: '1px solid',
                                borderColor: active ? accent.solid : 'page.border',
                                boxShadow: (theme) =>
                                    active
                                        ? theme.vars.palette.page.cardShadowHover
                                        : theme.vars.palette.page.cardShadow,
                                transformStyle: 'preserve-3d',
                                willChange: 'transform, opacity',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            }}
                        >
                            <Typography
                                level="body-xs"
                                sx={{
                                    color: skin.text,
                                    opacity: 0.72,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {course.duration}
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 0.25,
                                    color: skin.text,
                                    fontWeight: 700,
                                    fontSize: 'sm',
                                    lineHeight: 1.3,
                                }}
                            >
                                {course.title}
                            </Typography>
                        </Box>
                    )
                })}
            </Box>

            {/* Ручное прокручивание орбиты */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: { xs: 0.5, md: 1 } }}>
                <IconButton
                    variant="outlined"
                    color="neutral"
                    size="sm"
                    aria-label="Прокрутить орбиту влево"
                    onClick={() => rotateBy(step)}
                    sx={{ borderRadius: '999px', borderColor: 'page.border' }}
                >
                    <CaretLeftIcon size={22} weight="bold" />
                </IconButton>
                <IconButton
                    variant="outlined"
                    color="neutral"
                    size="sm"
                    aria-label="Прокрутить орбиту вправо"
                    onClick={() => rotateBy(-step)}
                    sx={{ borderRadius: '999px', borderColor: 'page.border' }}
                >
                    <CaretRightIcon size={22} weight="bold" />
                </IconButton>
            </Box>
        </Box>
    )
}
