import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import IconButton from '@mui/joy/IconButton'
import Tooltip from '@mui/joy/Tooltip'
import {
    CaretDownIcon,
    CaretLeftIcon,
    CaretUpIcon,
    GithubLogoIcon,
    HouseIcon,
    InfoIcon,
    FlagIcon,
} from '@phosphor-icons/react'
import { Link as RouterLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { FINAL_SLUG, getShortTitle } from '../../data/courses'
import InlineText from '../Content/InlineText'
import slugify from '../Content/slugify'

const linkSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    py: 1,
    fontSize: 'sm',
    textDecoration: 'none',
    color: 'text.secondary',
    transition: 'color 0.15s ease, padding-left 0.15s ease',
    // Только для мыши: на тач-экранах :hover «залипает» после тапа
    '@media (hover: hover)': {
        '&:hover': { color: 'text.primary', pl: 0.75 },
    },
}

// Та же кривая, что у полосы прогресса: резкий старт и долгое мягкое торможение
const EASE_OUT = [0.16, 1, 0.3, 1]
const FULL_WIDTH = 280
// Ширина полоски = размер квадратной кнопки
const RAIL_WIDTH = 32
const STORAGE_KEY = 'lesson-sidebar'
const MODES = ['full', 'rail', 'hidden']

// Вид меню запоминаем между уроками и визитами; без хранилища — просто полное меню
function readMode() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        return MODES.includes(saved) ? saved : 'full'
    } catch {
        return 'full'
    }
}

function saveMode(mode) {
    try {
        localStorage.setItem(STORAGE_KEY, mode)
    } catch {
        // Хранилище недоступно — меню просто не запомнит вид
    }
}

// Кнопки со светлой подложкой: свернуть, развернуть, скрыть
const controlSx = {
    '--IconButton-size': `${RAIL_WIDTH}px`,
    flexShrink: 0,
    borderRadius: 0,
    bgcolor: 'background.level1',
    color: 'text.secondary',
    // Фон Joy при наведении перебиваем: на тач-экранах он «залипает» после тапа
    '&:hover': { bgcolor: 'background.level1', color: 'text.secondary' },
    '@media (hover: hover)': {
        '&:hover': { bgcolor: 'primary.softBg', color: 'text.primary' },
    },
    '&:active': { bgcolor: 'primary.softBg', color: 'text.primary' },
}

// Кнопки полоски: без фона, подложка появляется только при наведении и нажатии
const railItemSx = {
    width: RAIL_WIDTH,
    height: RAIL_WIDTH,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 0,
    border: 0,
    borderRadius: 0,
    bgcolor: 'transparent',
    color: 'text.tertiary',
    fontFamily: 'code',
    fontSize: '11px',
    textDecoration: 'none',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    transition: 'color 0.15s ease, background-color 0.15s ease',
    '@media (hover: hover)': {
        '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
    },
    '&:active': { bgcolor: 'background.level2', color: 'text.primary' },
    '&:focus-visible': { outline: '2px solid', outlineColor: 'text.tertiary', outlineOffset: '-2px' },
}

// Раздел считается текущим, когда его заголовок поднялся до этой линии:
// чуть ниже отступа, с которым заголовки встают после перехода по якорю (80px)
const SPY_OFFSET = 120

/**
 * Следит за прокруткой и возвращает id раздела, который сейчас читают:
 * последний заголовок, поднявшийся выше SPY_OFFSET. Внизу страницы —
 * последний раздел, даже если его заголовок не успел доехать до линии.
 */
function useActiveHeading(ids, enabled) {
    const [activeId, setActiveId] = useState(null)

    useEffect(() => {
        if (!enabled || ids.length === 0) return undefined

        let frame = 0
        const update = () => {
            frame = 0
            const atBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
            let current = null
            for (const id of ids) {
                const element = document.getElementById(id)
                if (!element) continue
                if (atBottom || element.getBoundingClientRect().top <= SPY_OFFSET) current = id
                else break
            }
            setActiveId(current)
        }
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }

        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [ids, enabled])

    return enabled ? activeId : null
}

/**
 * План курса. Без карточки-обёртки и обводки — только линейки, как в
 * оглавлении книги. На десктопе меню сворачивается в полоску с номерами
 * уроков, а полоска — в одну кнопку. `bare` — вариант для нижней панели
 * на телефонах: там меню всегда полное и кнопка сворачивания не нужна.
 */
export default function LessonSidebar({
    course,
    activeSlug,
    accent,
    ink,
    onNavigate,
    bare = false,
}) {
    const mark = ink || accent.solid
    // План урока раскрывается только у текущего урока; при переходе на другой
    // урок он снова свёрнут, потому что храним слаг, а не флажок
    const [outlineSlug, setOutlineSlug] = useState(null)
    const outlineOpen = outlineSlug === activeSlug

    // Пока план урока открыт, в нём подсвечен раздел, который сейчас на экране
    const activePage = course.pages.find((page) => page.slug === activeSlug)
    const headingIds = useMemo(
        () =>
            (activePage?.content || [])
                .filter((block) => block.block === 'h2' || block.block === 'h3')
                .map((block) => slugify(block.content)),
        [activePage],
    )
    const currentHeading = useActiveHeading(headingIds, outlineOpen)

    const [mode, setModeState] = useState(readMode)
    const setMode = (next) => {
        setModeState(next)
        saveMode(next)
    }
    const full = bare || mode === 'full'
    const hidden = mode === 'hidden'

    // Переход к разделу: ссылка на урок не меняется, только якорь в адресе.
    // Прокрутку откладываем на кадр, чтобы нижняя панель успела начать закрываться.
    const goToHeading = (event, id) => {
        event.preventDefault()
        onNavigate?.()
        window.history.replaceState(null, '', `#${id}`)
        requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    }

    const title = (
        <Typography
            level="title-sm"
            sx={{ fontFamily: 'display', fontWeight: 600, lineHeight: 1.3 }}
        >
            {course.title}
        </Typography>
    )

    const fullBody = (
        <>
            <Box
                component="nav"
                aria-label="Уроки курса"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: bare ? 'none' : { md: 'calc(100vh - 260px)' },
                    overflowY: bare ? 'visible' : { md: 'auto' },
                }}
            >
                {course.pages.map((page, index) => {
                    const active = page.slug === activeSlug
                    // Итоговая страница — не урок: вместо номера у неё флажок
                    const final = page.slug === FINAL_SLUG
                    const headings = active
                        ? (page.content || []).filter((block) => block.block === 'h2' || block.block === 'h3')
                        : []
                    // Текущий урок с разделами — не ссылка, а переключатель плана урока
                    const toggle = headings.length > 0
                    const outlineId = `lesson-outline-${page.slug}`
                    const rowProps = toggle
                        ? {
                            component: 'button',
                            type: 'button',
                            onClick: () => setOutlineSlug(outlineOpen ? null : activeSlug),
                            'aria-expanded': outlineOpen,
                            'aria-controls': outlineId,
                        }
                        : {
                            component: RouterLink,
                            to: `/course/${course.id}/${page.slug}`,
                            onClick: onNavigate,
                        }
                    return (
                        <Box key={page.slug}>
                            <Box
                                {...rowProps}
                                aria-current={active ? 'page' : undefined}
                                sx={{
                                    width: '100%',
                                    m: 0,
                                    px: 0,
                                    border: 0,
                                    bgcolor: 'transparent',
                                    font: 'inherit',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    gap: 1.5,
                                    alignItems: 'baseline',
                                    py: 1.15,
                                    borderBottom: toggle && outlineOpen ? 'none' : '1px solid',
                                    borderColor: 'page.border',
                                    textDecoration: 'none',
                                    fontSize: 'sm',
                                    lineHeight: 1.45,
                                    color: active ? 'text.primary' : 'text.secondary',
                                    fontWeight: active ? 600 : 400,
                                    transition: 'color 0.15s ease, padding-left 0.15s ease',
                                    // Только для мыши: на тач-экранах :hover «залипает» после тапа.
                                    // Отступ справа у названия уходит ровно на столько, на сколько
                                    // строка сдвигается вправо: ширина текста не меняется, переносы не прыгают
                                    '@media (hover: hover)': {
                                        '&:hover': { color: 'text.primary', pl: 0.75 },
                                        '&:hover .lesson-title': { mr: 0 },
                                    },
                                }}
                            >
                                <Box
                                    aria-hidden
                                    sx={{
                                        fontFamily: 'code',
                                        fontSize: '11px',
                                        minWidth: 22,
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: active ? mark : 'text.tertiary',
                                    }}
                                >
                                    {final ? (
                                        <FlagIcon size={15} weight="fill" />
                                    ) : (
                                        String(index + 1).padStart(2, '0')
                                    )}
                                </Box>
                                <Box
                                    className="lesson-title"
                                    sx={{ minWidth: 0, flex: 1, mr: 0.75, transition: 'margin-right 0.15s ease' }}
                                >
                                    {getShortTitle(page)}
                                </Box>
                                {toggle ? (
                                    <Box
                                        aria-hidden
                                        sx={{
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignSelf: 'center',
                                            color: mark,
                                            transform: outlineOpen ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.2s ease',
                                        }}
                                    >
                                        <CaretDownIcon size={16} weight="bold" />
                                    </Box>
                                ) : active && (
                                    <Box
                                        aria-hidden
                                        sx={{
                                            flexShrink: 0,
                                            width: 6,
                                            height: 6,
                                            borderRadius: 0,
                                            bgcolor: mark,
                                        }}
                                    />
                                )}
                            </Box>

                            {/* План урока: ссылки на разделы, подразделы с отступом */}
                            {toggle && outlineOpen && (
                                <Box
                                    id={outlineId}
                                    component="ul"
                                    aria-label="План урока"
                                    sx={{
                                        listStyle: 'none',
                                        m: 0,
                                        // Текст разделов встаёт вровень с названием урока (34px)
                                        pl: '24px',
                                        pb: { xs: 1.5, md: 1 },
                                        borderBottom: '1px solid',
                                        borderColor: 'page.border',
                                    }}
                                >
                                    {headings.map((heading, headingIndex) => {
                                        const id = slugify(heading.content)
                                        const current = id === currentHeading
                                        return (
                                            <Box component="li" key={headingIndex}>
                                                <Box
                                                    component="a"
                                                    href={`#${id}`}
                                                    onClick={(event) => goToHeading(event, id)}
                                                    aria-current={current ? 'location' : undefined}
                                                    sx={{
                                                        display: 'block',
                                                        // На телефоне — палец, а не курсор: строки выше
                                                        py: { xs: 1.1, md: 0.6 },
                                                        pr: 1,
                                                        pl: heading.block === 'h3' ? 2.5 : 1,
                                                        // Слева — полоска под краску курса, видна при наведении
                                                        borderLeft: '2px solid transparent',
                                                        fontSize: 'sm',
                                                        lineHeight: 1.4,
                                                        textDecoration: 'none',
                                                        color: heading.block === 'h3' ? 'text.tertiary' : 'text.secondary',
                                                        // Текущий раздел выделен как при наведении, но без полоски
                                                        ...(current && {
                                                            color: 'text.primary',
                                                            bgcolor: 'background.level1',
                                                        }),
                                                        WebkitTapHighlightColor: 'transparent',
                                                        transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
                                                        '@media (hover: hover)': {
                                                            '&:hover': {
                                                                color: 'text.primary',
                                                                bgcolor: 'background.level1',
                                                                borderLeftColor: mark,
                                                            },
                                                        },
                                                        '&:active': {
                                                            color: 'text.primary',
                                                            bgcolor: 'background.level2',
                                                            borderLeftColor: mark,
                                                        },
                                                        '&:focus-visible': {
                                                            outline: '2px solid',
                                                            outlineColor: mark,
                                                            outlineOffset: '-2px',
                                                        },
                                                    }}
                                                >
                                                    <InlineText text={heading.content} />
                                                </Box>
                                            </Box>
                                        )
                                    })}
                                </Box>
                            )}
                        </Box>
                    )
                })}
            </Box>

            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column' }}>
                <Box component={RouterLink} to={`/course/${course.id}`} onClick={onNavigate} sx={linkSx}>
                    <InfoIcon size={20} />
                    О курсе
                </Box>

                {course.github && (
                    <Box component="a" href={course.github} target="_blank" rel="noreferrer" sx={linkSx}>
                        <GithubLogoIcon size={20} />
                        Исходники на GitHub
                    </Box>
                )}

                <Box component={RouterLink} to="/" onClick={onNavigate} sx={linkSx}>
                    <HouseIcon size={20} />
                    На главную
                </Box>
            </Box>
        </>
    )

    if (bare) {
        return (
            <Box>
                <Box sx={{ pb: 1.25, borderBottom: '2px solid', borderColor: 'page.rule' }}>{title}</Box>
                {fullBody}
            </Box>
        )
    }

    // Полоска: номера уроков, разделитель и те же три ссылки, что внизу меню
    const railLinks = [
        { label: 'О курсе', icon: InfoIcon, props: { component: RouterLink, to: `/course/${course.id}` } },
        course.github && {
            label: 'Исходники на GitHub',
            icon: GithubLogoIcon,
            props: { component: 'a', href: course.github, target: '_blank', rel: 'noreferrer' },
        },
        { label: 'На главную', icon: HouseIcon, props: { component: RouterLink, to: '/' } },
    ].filter(Boolean)

    const railBody = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Tooltip title="Скрыть меню" variant="soft" size="sm" placement="right">
                <IconButton onClick={() => setMode('hidden')} aria-label="Скрыть меню" variant="plain" sx={controlSx}>
                    <CaretUpIcon size={20} weight="bold" />
                </IconButton>
            </Tooltip>

            <Box
                component="nav"
                aria-label="Уроки курса"
                sx={{
                    mt: 0.75,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                    maxHeight: 'calc(100vh - 300px)',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                {course.pages.map((page, index) => {
                    const active = page.slug === activeSlug
                    return (
                        <Tooltip key={page.slug} title={getShortTitle(page)} variant="soft" size="sm" placement="right">
                            <Box
                                component={RouterLink}
                                to={`/course/${course.id}/${page.slug}`}
                                aria-label={getShortTitle(page)}
                                aria-current={active ? 'page' : undefined}
                                sx={{
                                    ...railItemSx,
                                    ...(active && {
                                        color: mark,
                                        fontWeight: 700,
                                        // Текущий урок отмечен полоской краски курса
                                        boxShadow: `inset 2px 0 0 ${mark}`,
                                    }),
                                }}
                            >
                                {page.slug === FINAL_SLUG ? (
                                    <FlagIcon size={15} weight="fill" />
                                ) : (
                                    String(index + 1).padStart(2, '0')
                                )}
                            </Box>
                        </Tooltip>
                    )
                })}
            </Box>

            <Box aria-hidden sx={{ height: '1px', my: 0.75, bgcolor: 'page.border' }} />

            {railLinks.map(({ label, icon: Icon, props }) => (
                <Tooltip key={label} title={label} variant="soft" size="sm" placement="right">
                    <Box {...props} aria-label={label} sx={railItemSx}>
                        <Icon size={18} />
                    </Box>
                </Tooltip>
            ))}
        </Box>
    )

    return (
        <Box
            component={motion.div}
            initial={false}
            animate={{ width: full ? FULL_WIDTH : RAIL_WIDTH }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            sx={{ overflow: 'hidden' }}
        >
            {/* Шапка: кнопка сворачивания прижата к верхнему краю, не по центру */}
            <Box
                sx={{
                    width: FULL_WIDTH,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    // В свёрнутом виде кнопки «развернуть» и «скрыть» стоят парой
                    pb: full ? 1.25 : 0,
                    borderBottom: '2px solid',
                    // В свёрнутом виде линейка под шапкой не нужна
                    borderColor: full ? 'page.rule' : 'transparent',
                    transition: 'border-color 0.2s ease, padding-bottom 0.3s ease-out',
                }}
            >
                <Tooltip title={full ? 'Свернуть меню' : 'Развернуть меню'} variant="soft" size="sm" placement="right">
                    <IconButton
                        onClick={() => setMode(full ? 'rail' : 'full')}
                        aria-label={full ? 'Свернуть меню' : 'Развернуть меню'}
                        aria-expanded={full}
                        variant="plain"
                        sx={controlSx}
                    >
                        {/* Одна и та же стрелка: в свёрнутом виде развёрнута вправо */}
                        <Box
                            component={motion.span}
                            initial={false}
                            animate={{ rotate: full ? 0 : 180 }}
                            transition={{ duration: 0.45, ease: EASE_OUT }}
                            sx={{ display: 'flex' }}
                        >
                            <CaretLeftIcon size={20} weight="bold" />
                        </Box>
                    </IconButton>
                </Tooltip>

                <AnimatePresence initial={false}>
                    {full && (
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.1, ease: EASE_OUT } }}
                            exit={{ opacity: 0, transition: { duration: 0.12 } }}
                            sx={{ minWidth: 0 }}
                        >
                            {title}
                        </Box>
                    )}
                </AnimatePresence>
            </Box>

            <AnimatePresence initial={false} mode="wait">
                {full ? (
                    <Box
                        key="full"
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                        sx={{ width: FULL_WIDTH }}
                    >
                        {fullBody}
                    </Box>
                ) : (
                    // Полоска выезжает из кнопки вниз и прячется в неё же, уезжая вверх
                    <Box
                        key="rail"
                        component={motion.div}
                        initial={{ height: 0, opacity: 0 }}
                        animate={
                            hidden
                                ? { height: 0, opacity: 0, transitionEnd: { visibility: 'hidden' } }
                                : { height: 'auto', opacity: 1, visibility: 'visible' }
                        }
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
                        transition={{ duration: 0.4, ease: EASE_OUT }}
                        sx={{ overflow: 'hidden' }}
                    >
                        <Box
                            component={motion.div}
                            initial={{ y: -24 }}
                            animate={{ y: hidden ? -24 : 0 }}
                            exit={{ y: -24 }}
                            transition={{ duration: 0.4, ease: EASE_OUT }}
                            sx={{ pt: 0.5 }}
                        >
                            {railBody}
                        </Box>
                    </Box>
                )}
            </AnimatePresence>
        </Box>
    )
}
