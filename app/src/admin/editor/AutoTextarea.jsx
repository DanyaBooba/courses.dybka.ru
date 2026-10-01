import { useEffect, useLayoutEffect, useRef } from 'react'
import Box from '@mui/joy/Box'

/**
 * Поле без рамки, которое растёт вместе с текстом и берёт шрифт, размер и
 * цвет у родителя. Его кладут прямо в оформление блока — заголовок правится
 * заголовком, абзац абзацем, и страница при правке выглядит как на сайте.
 *
 * `focus` — запрос на фокус `{ caret: 'start' | 'end' | число, token }`:
 * каждый новый token ставит курсор в поле в указанное место.
 *
 * `inline` — подсвечивать `код` фоном, как на сайте. Само поле фон под частью
 * текста не умеет, поэтому под ним лежит прозрачная копия текста с той же
 * вёрсткой, и фон рисуется в ней — ровно под нужными символами.
 */
export default function AutoTextarea({ value, onChange, focus, inputRef, inline = false, sx, ...props }) {
    const ownRef = useRef(null)
    const ref = inputRef ?? ownRef

    // Высота — по содержимому: сбрасываем и меряем заново на каждое изменение
    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = '0px'
        el.style.height = `${el.scrollHeight}px`
    }, [value, ref])

    // Ширина колонки меняется (свернули меню, повернули экран) — перемеряем
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === 'undefined') return
        let width = el.offsetWidth
        const observer = new ResizeObserver(() => {
            if (el.offsetWidth === width) return
            width = el.offsetWidth
            el.style.height = '0px'
            el.style.height = `${el.scrollHeight}px`
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [ref])

    useEffect(() => {
        const el = ref.current
        if (!focus || !el) return
        el.focus({ preventScroll: true })
        const length = el.value.length
        const caret = focus.caret === 'start' ? 0 : focus.caret === 'end' ? length : Math.min(focus.caret, length)
        el.setSelectionRange(caret, caret)
        // Поле у края экрана — докручиваем, но без рывка на полстраницы
        el.scrollIntoView({ block: 'nearest' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focus?.token])

    const field = (
        <Box
            component="textarea"
            ref={ref}
            rows={1}
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value, { composing: event.nativeEvent.isComposing })}
            spellCheck
            {...props}
            sx={{
                display: 'block',
                width: '100%',
                m: 0,
                p: 0,
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                bgcolor: 'transparent',
                font: 'inherit',
                color: 'inherit',
                letterSpacing: 'inherit',
                lineHeight: 'inherit',
                textTransform: 'inherit',
                '&::placeholder': { color: 'text.tertiary', opacity: 0.7 },
                ...(inline && { position: 'relative' }),
                ...sx,
            }}
        />
    )

    // Обёртка — всегда, а не с первым `: иначе поле пересоздастся и потеряет фокус
    if (!inline) return field

    return (
        <Box sx={{ position: 'relative' }}>
            <Box aria-hidden sx={mirrorSx}>
                {(value ?? '').split(CODE).map((part, index) =>
                    index % 2 ? (
                        <Box component="span" key={index} sx={codeMarkSx}>
                            {part}
                        </Box>
                    ) : (
                        part
                    ),
                )}
                {/* Перенос в самом конце поле показывает пустой строкой — копия тоже */}
                {value?.endsWith('\n') && ' '}
            </Box>
            {field}
        </Box>
    )
}

// Тот же шаблон `код`, что у InlineText; скобки оставляют код в split
const CODE = /(`[^`]+`)/

// Копия текста под полем: те же шрифт и переносы, что у textarea, но без цвета
const mirrorSx = {
    position: 'absolute',
    inset: 0,
    m: 0,
    p: 0,
    font: 'inherit',
    letterSpacing: 'inherit',
    lineHeight: 'inherit',
    textTransform: 'inherit',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    color: 'transparent',
    pointerEvents: 'none',
    userSelect: 'none',
}

// Фон без отступов: отступ сдвинул бы текст копии относительно поля.
// Чуть шире букв фон делает тень — она места не занимает
const codeMarkSx = {
    bgcolor: 'primary.softBg',
    borderRadius: 'xs',
    boxShadow: (theme) => `0 0 0 2px ${theme.vars.palette.primary.softBg}`,
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
}
