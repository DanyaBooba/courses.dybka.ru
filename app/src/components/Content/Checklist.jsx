import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import { CheckIcon } from '@phosphor-icons/react'

import InlineText from './InlineText'
import Confetti from './Confetti'

/**
 * Чек-лист для самопроверки: список пунктов, которые можно отмечать.
 *
 * Как и тест, ничего не сохраняет и никуда не отправляет — отметки живут в
 * состоянии компонента и стираются при перезагрузке страницы. Это не оценка,
 * а способ пройтись по своей работе и ничего не забыть.
 *
 * Когда отмечен последний пункт — над списком один раз стреляет салют.
 */
export default function Checklist({ title, items = [], ink = 'text.primary' }) {
    const [done, setDone] = useState(() => new Set())
    // Номер залпа: null — салюта нет, число — идёт анимация (и заодно ключ,
    // чтобы повторное «всё готово» рисовало новые бумажки, а не старые.
    const [burst, setBurst] = useState(null)
    const burstCount = useRef(0)

    const total = items.length
    const complete = total > 0 && done.size === total

    // Краска курса ведёт в салюте, остальные цвета Confetti берёт из палитры
    // каталога. Токены вида 'text.primary' в инлайновый style не годятся —
    // такой случай отдаём на усмотрение самого салюта.
    const leadColor = typeof ink === 'string' && ink.startsWith('#') ? ink : undefined

    // Салют только на переходе «не всё → всё». Снятие и возврат галочки даёт
    // новый залп, а лишние ре-рендеры — нет.
    const wasComplete = useRef(false)
    useEffect(() => {
        if (complete && !wasComplete.current) {
            burstCount.current += 1
            setBurst(burstCount.current)
        }
        wasComplete.current = complete
    }, [complete])

    if (!total) return null

    const toggle = (index) => {
        setDone((current) => {
            const next = new Set(current)
            if (next.has(index)) next.delete(index)
            else next.add(index)
            return next
        })
    }


    return (
        <Box
            component="section"
            aria-label={title || 'Чек-лист'}
            sx={{ position: 'relative', mt: 7 }}
        >
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 2,
                    pb: 1.25,
                    borderBottom: '2px solid',
                    borderColor: 'page.rule',
                    color: ink,
                }}
            >
                <Typography
                    level="h2"
                    sx={{ fontWeight: 500, letterSpacing: '-0.02em', color: 'text.primary' }}
                >
                    {title || 'Чек-лист'}
                </Typography>

                <Box
                    component="span"
                    aria-live="polite"
                    sx={{
                        position: 'relative',
                        fontFamily: 'code',
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: complete ? ink : 'text.tertiary',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.25s ease',
                    }}
                >
                    {/* Счётчик перелистывается, как строка на табло */}
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                            key={complete ? 'done' : done.size}
                            initial={{ y: 8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            style={{ display: 'inline-block' }}
                        >
                            {complete ? 'всё готово' : `${done.size} из ${total}`}
                        </motion.span>
                    </AnimatePresence>
                </Box>

                {/* Полоса прогресса поверх нижней линейки заголовка */}
                <Box
                    aria-hidden
                    component={motion.span}
                    initial={false}
                    animate={{ scaleX: done.size / total }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: '-2px',
                        height: '2px',
                        bgcolor: ink,
                        transformOrigin: 'left center',
                    }}
                />

            </Box>

            <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1, p: 0 }}>
                {items.map((item, index) => {
                    const checked = done.has(index)

                    return (
                        <Box component="li" key={index}>
                            <Box
                                component="button"
                                type="button"
                                role="checkbox"
                                aria-checked={checked}
                                onClick={() => toggle(index)}
                                sx={{
                                    appearance: 'none',
                                    width: '100%',
                                    textAlign: 'left',
                                    font: 'inherit',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1.5,
                                    px: 1,
                                    py: 1.25,
                                    border: 'none',
                                    borderBottom: '1px solid',
                                    borderColor: 'page.border',
                                    borderRadius: 0,
                                    bgcolor: 'transparent',
                                    color: 'text.secondary',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s ease, color 0.15s ease',
                                    // Только для мыши: на тач-экранах :hover «залипает» после тапа
                                    '@media (hover: hover)': {
                                        '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
                                    },
                                    '&:focus-visible': {
                                        outline: '2px solid',
                                        outlineColor: ink,
                                        outlineOffset: '2px',
                                    },
                                }}
                            >
                                {/* Квадрат отметки: пустая рамка или галочка краской курса */}
                                <Box
                                    aria-hidden
                                    component={motion.span}
                                    initial={false}
                                    animate={{ scale: checked ? [1, 1.22, 1] : 1 }}
                                    transition={{ duration: 0.28, ease: 'easeOut' }}
                                    sx={{
                                        flexShrink: 0,
                                        width: 22,
                                        height: 22,
                                        mt: '1px',
                                        display: 'grid',
                                        placeItems: 'center',
                                        borderRadius: 0,
                                        border: '1px solid',
                                        borderColor: checked ? ink : 'page.border',
                                        bgcolor: checked ? ink : 'transparent',
                                        color: 'background.body',
                                        transition:
                                            'background-color 0.15s ease, border-color 0.15s ease',
                                    }}
                                >
                                    <AnimatePresence initial={false}>
                                        {checked && (
                                            <motion.span
                                                key="check"
                                                initial={{ scale: 0.2, rotate: -35, opacity: 0 }}
                                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                exit={{ scale: 0.4, opacity: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 640,
                                                    damping: 22,
                                                }}
                                                style={{ display: 'grid', placeItems: 'center' }}
                                            >
                                                <CheckIcon size={13} weight="bold" />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Box>

                                <Box
                                    component="span"
                                    sx={{
                                        fontSize: 'md',
                                        lineHeight: 1.55,
                                        opacity: checked ? 0.55 : 1,
                                        // Зачёркивание анимируем цветом линии, а не самим
                                        // свойством: так работает и с переносами строк.
                                        textDecorationLine: 'line-through',
                                        textDecorationColor: checked
                                            ? 'currentColor'
                                            : 'transparent',
                                        textDecorationThickness: '1px',
                                        transition:
                                            'opacity 0.2s ease, text-decoration-color 0.25s ease',
                                    }}
                                >
                                    <InlineText text={item} />
                                </Box>
                            </Box>
                        </Box>
                    )
                })}
            </Box>

            {/* Салют стреляет из нижней части списка — оттуда бумажки успевают
                подняться над чек-листом и опуститься обратно в кадре */}
            {burst !== null && (
                <Confetti
                    key={burst}
                    lead={leadColor}
                    launch="55%"
                    onDone={() => setBurst(null)}
                />
            )}
        </Box>
    )
}
