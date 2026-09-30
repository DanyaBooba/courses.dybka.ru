import { useEffect, useRef, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { useColorScheme } from '@mui/joy/styles'
import { FlagIcon, GithubLogoIcon, HouseIcon } from '@phosphor-icons/react'

import PageShell from '../components/Layout/PageShell'
import ContentBlocks from '../components/Content/ContentBlocks'
import CourseMedia from '../components/Course/CourseMedia'
import Difficulty from '../components/Course/Difficulty'
import StartButton from '../components/Course/StartButton'
import CourseState from '../components/Course/CourseState'
import { CoursePageSkeleton } from '../components/Course/PageSkeletons'
import ShareButton from '../components/Ui/ShareButton'
import { useCourse } from '../api/courses'
import { useCourseView, readersLabel, viewsLabel } from '../api/views'
import { hasMedia, getLessons, getFinalPage, getLessonTitle } from '../data/courses'
import { getAccent, getInk } from '../theme/accents'
import { lessonsLabel } from '../data/plural'
import useSeo from '../seo/useSeo'
import { courseSeo } from '../seo/seo'

function Meta({ label, value, color }) {
    return (
        <Box sx={{ minWidth: 120 }}>
            <Typography
                sx={{
                    fontFamily: 'code',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    opacity: 0.6,
                    color,
                }}
            >
                {label}
            </Typography>
            {/* div, а не p: в значении бывает блок (звёзды сложности) */}
            <Typography component="div" sx={{ mt: 0.5, fontWeight: 500, color }}>{value}</Typography>
        </Box>
    )
}

const MONTHS = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
]

// «2023-07-01» или «2023-07-01T00:00:00.000Z» → «июль 2023»:
// читателю важна свежесть курса, а не точный день
function monthYear(date) {
    const [year, month] = date.slice(0, 10).split('-').map(Number)
    return `${MONTHS[month - 1]} ${year}`
}

// Телеграм автора в настройках пишут как угодно: «@nick», «t.me/nick» или ссылкой
function telegramUrl(value) {
    const handle = value.trim()
    if (/^https?:\/\//.test(handle)) return handle
    if (handle.startsWith('@')) return `https://t.me/${handle.slice(1)}`
    return `https://${handle.replace(/^\/+/, '')}`
}

// Вторичная кнопка на плашке курса: контур цвета курса, заливка только при наведении
function skinButtonSx(skin) {
    return {
        width: { xs: '100%', sm: 'auto' },
        bgcolor: 'transparent',
        color: skin.text,
        border: '1px solid',
        borderColor: skin.rule,
        // Фон Joy перебиваем: на тач-экранах :hover «залипает»
        '&:hover': { bgcolor: 'transparent', color: skin.text },
        '@media (hover: hover)': {
            '&:hover': { bgcolor: skin.chip },
        },
        '&:active': { bgcolor: skin.chip },
        fontWeight: 700,
    }
}

export default function PageCourse() {
    const { id } = useParams()
    const { course, error, reload } = useCourse(id)

    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'

    useSeo(course ? courseSeo(course) : null)
    useCourseView(course)

    // Переход «Подробнее» с главной должен открывать курс с начала страницы
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
    }, [id])

    // Пока шапка на экране, кнопка «Начать курс» в ней и так видна. Как только
    // шапка уехала вверх — на телефонах поднимаем её дубль внизу экрана.
    const heroRef = useRef(null)
    const [heroGone, setHeroGone] = useState(false)

    useEffect(() => {
        const hero = heroRef.current
        if (!hero) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Именно «уехала вверх», а не «ещё не долистали снизу»
                setHeroGone(!entry.isIntersecting && entry.boundingClientRect.top < 0)
            },
            { threshold: 0 },
        )
        observer.observe(hero)
        return () => observer.disconnect()
        // Шапка появляется только после загрузки курса — тогда и подписываемся
    }, [id, course])

    if (!course) {
        return <CourseState id={id} error={error} reload={reload} skeleton={<CoursePageSkeleton />} />
    }

    const accent = getAccent(course.accent)
    const skin = accent[resolved] || accent.light
    const ink = getInk(accent, resolved)
    const lessons = getLessons(course)
    const finalPage = getFinalPage(course)
    // Без фотографии и видео вторая колонка в шапке не нужна — текст занимает всю ширину
    const withMedia = hasMedia(course)
    // Дата из файла курса точнее, в базе — дата последней правки
    const updated = course.updated ?? course.updatedAt

    return (
        // Липкая панель «Начать курс» на телефонах не должна перекрывать подвал
        <PageShell footerOffset={76}>
            <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 3, md: 4 } }}>
                {/* Возврат в каталог — той же плашкой, что и выход из урока внутри курса */}
                <Typography
                    component={RouterLink}
                    to="/"
                    level="body-sm"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        mb: 2.5,
                        px: 1,
                        py: 0.5,
                        borderRadius: 0,
                        bgcolor: 'background.level1',
                        textDecoration: 'none',
                        color: 'text.secondary',
                        '@media (hover: hover)': {
                            '&:hover': { color: 'text.primary' },
                        },
                    }}
                >
                    <HouseIcon size={18} weight="bold" />
                    На главную
                </Typography>

                {/* Титул курса: плоская плашка цвета курса, без градиента и без пятен */}
                <Box
                    ref={heroRef}
                    sx={{
                        p: { xs: 2.5, md: 4.5 },
                        borderRadius: 'md',
                        bgcolor: skin.bg,
                        // border: '1px solid',
                        borderColor: skin.rule,
                    }}
                >
                    <Box
                        sx={{
                            display: 'grid',
                            gap: { xs: 3, md: 4.5 },
                            gridTemplateColumns: {
                                xs: 'minmax(0, 1fr)',
                                md: withMedia ? 'minmax(0, 1fr) minmax(0, 340px)' : 'minmax(0, 1fr)',
                            },
                            alignItems: 'start',
                        }}
                    >
                        <Box sx={{ minWidth: 0, maxWidth: 760 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    fontFamily: 'code',
                                    fontSize: '11px',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: skin.text,
                                    opacity: 0.7,
                                }}
                            >
                                {course.chips.map((chip, index) => (
                                    <Box component="span" key={chip} sx={{ display: 'flex', gap: 1 }}>
                                        {index > 0 && <Box component="span" sx={{ opacity: 0.5 }}>/</Box>}
                                        {chip}
                                    </Box>
                                ))}
                            </Box>

                            <Typography
                                level="h1"
                                sx={{
                                    mt: 2,
                                    fontWeight: 500,
                                    letterSpacing: '-0.03em',
                                    color: skin.text,
                                    fontSize: { xs: '32px', sm: '44px', md: '56px' },
                                    lineHeight: 1.06,
                                }}
                            >
                                {course.title}
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 2,
                                    color: skin.text,
                                    opacity: 0.82,
                                    fontSize: 'lg',
                                    lineHeight: 1.65,
                                }}
                            >
                                {course.subtitle}
                            </Typography>

                            <Box
                                sx={{
                                    mt: 3.5,
                                    pt: 3,
                                    borderTop: '1px solid',
                                    borderColor: skin.rule,
                                    display: 'flex',
                                    gap: 4,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Meta label="Уровень" value={course.level} color={skin.text} />
                                <Meta label="Объём" value={lessonsLabel(lessons.length)} color={skin.text} />
                                <Meta
                                    label="Сложность"
                                    color={skin.text}
                                    value={
                                        <Difficulty
                                            value={course.difficulty}
                                            color={skin.text}
                                            size={17}
                                            sx={{ mt: '2px' }}
                                        />
                                    }
                                />
                                {course.author?.name && (
                                    <Meta
                                        label="Автор"
                                        color={skin.text}
                                        value={
                                            // Есть телеграм — имя ведёт туда: автору можно написать
                                            course.author.telegram ? (
                                                <Box
                                                    component="a"
                                                    href={telegramUrl(course.author.telegram)}
                                                    target="_blank"
                                                    rel="noreferrer author"
                                                    sx={{ color: 'inherit', textDecorationColor: skin.rule, textUnderlineOffset: '3px' }}
                                                >
                                                    {course.author.name}
                                                </Box>
                                            ) : (
                                                course.author.name
                                            )
                                        }
                                    />
                                )}
                                <Meta label="Читатели" value={readersLabel(course.readers)} color={skin.text} />
                                <Meta label="Просмотры" value={viewsLabel(course.views)} color={skin.text} />
                                {updated && (
                                    <Meta
                                        label="Обновлён"
                                        color={skin.text}
                                        value={<time dateTime={updated.slice(0, 10)}>{monthYear(updated)}</time>}
                                    />
                                )}
                            </Box>

                            {/* На узком экране кнопки встают в колонку — и тогда каждая во всю ширину */}
                            <Box
                                sx={{
                                    mt: 3.5,
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    flexWrap: 'wrap',
                                    alignItems: { xs: 'stretch', sm: 'center' },
                                    gap: 1,
                                }}
                            >
                                <StartButton
                                    course={course}
                                    accent={accent}
                                    size="lg"
                                    sx={{ px: 3, width: { xs: '100%', sm: 'auto' } }}
                                />
                                {course.github && (
                                    <Button
                                        component="a"
                                        href={course.github}
                                        target="_blank"
                                        rel="noreferrer"
                                        size="lg"
                                        variant="plain"
                                        sx={skinButtonSx(skin)}
                                        startDecorator={<GithubLogoIcon size={20} />}
                                    >
                                        GitHub
                                    </Button>
                                )}
                                <ShareButton
                                    path={`/course/${course.id}`}
                                    title={course.title}
                                    text={course.subtitle}
                                    size="lg"
                                    variant="plain"
                                    sx={skinButtonSx(skin)}
                                />
                            </Box>
                        </Box>

                        {/* Обложка курса — над текстом на телефоне, сбоку на компьютере */}
                        {withMedia && (
                            <Box sx={{ minWidth: 0, order: { xs: -1, md: 0 } }}>
                                <CourseMedia
                                    course={course}
                                    skin={skin}
                                    ratio="4 / 3"
                                    rounded
                                    playing={false}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Программа + описание */}
                <Box
                    sx={{
                        mt: { xs: 4, md: 6 },
                        display: 'grid',
                        gap: { xs: 4, md: 6 },
                        // minmax(0, …) обязателен: иначе широкая таблица внутри
                        // растягивает колонку и уводит страницу в горизонтальную прокрутку
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 320px' },
                        alignItems: 'start',
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            level="h2"
                            sx={{
                                fontWeight: 500,
                                letterSpacing: '-0.02em',
                                pb: 1.25,
                                mb: 2.5,
                                borderBottom: '2px solid',
                                borderColor: 'page.rule',
                            }}
                        >
                            О курсе
                        </Typography>
                        <ContentBlocks blocks={course.about} ink={ink} />
                    </Box>

                    {/* Программа: без обводки, только линейки */}
                    <Box sx={{ minWidth: 0, position: { md: 'sticky' }, top: { md: 24 } }}>
                        {/* Дубль кнопки из шапки: колонка липкая, поэтому кнопка
                            остаётся под рукой, пока читают описание. На телефонах
                            эту роль играет панель внизу экрана */}
                        <StartButton
                            course={course}
                            accent={accent}
                            size="lg"
                            sx={{ display: { xs: 'none', md: 'flex' }, width: '100%', mb: 3 }}
                        />

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                gap: 1.5,
                                pb: 1.25,
                                borderBottom: '2px solid',
                                borderColor: 'page.rule',
                            }}
                        >
                            <Typography
                                level="title-md"
                                sx={{ fontFamily: 'display', fontWeight: 600 }}
                            >
                                Программа
                            </Typography>
                            <Box
                                component="span"
                                sx={{
                                    fontFamily: 'code',
                                    fontSize: '11px',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: 'text.tertiary',
                                }}
                            >
                                {lessonsLabel(lessons.length)}
                            </Box>
                        </Box>

                        <Box
                            component="ol"
                            sx={{
                                listStyle: 'none',
                                m: 0,
                                p: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: { md: '60vh' },
                                overflowY: { md: 'auto' },
                            }}
                        >
                            {lessons.map((page, index) => (
                                <Box
                                    component="li"
                                    key={page.slug}
                                    sx={{ borderBottom: '1px solid', borderColor: 'page.border' }}
                                >
                                    <Box
                                        component={RouterLink}
                                        to={`/course/${course.id}/${page.slug}`}
                                        sx={{
                                            display: 'flex',
                                            gap: 1.5,
                                            alignItems: 'baseline',
                                            py: 1.25,
                                            textDecoration: 'none',
                                            color: 'text.secondary',
                                            transition: 'color 0.15s ease, padding-left 0.15s ease',
                                            // Только для мыши: на тач-экранах :hover «залипает».
                                            // Отступ справа у названия уходит, пока строка сдвигается
                                            // вправо: ширина текста та же, переносы не прыгают
                                            '@media (hover: hover)': {
                                                '&:hover': { color: 'text.primary', pl: 0.75 },
                                                '&:hover .lesson-title': { mr: 0 },
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                fontFamily: 'code',
                                                fontSize: '11px',
                                                color: ink,
                                                minWidth: 22,
                                            }}
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </Box>
                                        <Box
                                            className="lesson-title"
                                            sx={{ fontSize: 'sm', lineHeight: 1.5, mr: 0.75, transition: 'margin-right 0.15s ease' }}
                                        >
                                            {getLessonTitle(page)}
                                        </Box>
                                    </Box>
                                </Box>
                            ))}

                            {/* Итог курса — в списке есть, но номера не получает */}
                            {finalPage && (
                                <Box
                                    component="li"
                                    sx={{ borderBottom: '1px solid', borderColor: 'page.border' }}
                                >
                                    <Box
                                        component={RouterLink}
                                        to={`/course/${course.id}/${finalPage.slug}`}
                                        sx={{
                                            display: 'flex',
                                            gap: 1.5,
                                            alignItems: 'center',
                                            py: 1.25,
                                            textDecoration: 'none',
                                            color: 'text.secondary',
                                            transition: 'color 0.15s ease, padding-left 0.15s ease',
                                            // Только для мыши: на тач-экранах :hover «залипает».
                                            // Отступ справа у названия уходит, пока строка сдвигается
                                            // вправо: ширина текста та же, переносы не прыгают
                                            '@media (hover: hover)': {
                                                '&:hover': { color: 'text.primary', pl: 0.75 },
                                                '&:hover .lesson-title': { mr: 0 },
                                            },
                                        }}
                                    >
                                        <Box
                                            aria-hidden
                                            sx={{
                                                display: 'flex',
                                                color: ink,
                                                minWidth: 22,
                                            }}
                                        >
                                            <FlagIcon size={15} weight="fill" />
                                        </Box>
                                        <Box
                                            className="lesson-title"
                                            sx={{ fontSize: 'sm', lineHeight: 1.5, mr: 0.75, transition: 'margin-right 0.15s ease' }}
                                        >
                                            {getLessonTitle(finalPage)}
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Container>

            {/* Телефоны: как только шапка уехала, кнопка «Начать курс» переезжает вниз экрана */}
            <Box
                aria-hidden={!heroGone}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1200,
                    px: 2.5,
                    pt: 1.5,
                    pb: 'calc(12px + env(safe-area-inset-bottom))',
                    bgcolor: 'background.body',
                    borderTop: '1px solid',
                    borderColor: 'page.border',
                    transform: heroGone ? 'translateY(0)' : 'translateY(115%)',
                    // Пока панель спрятана, её кнопка не должна ловить нажатия. Прячем
                    // не сразу, а после съезда вниз — иначе панель не уезжает, а мигает
                    visibility: heroGone ? 'visible' : 'hidden',
                    transition: heroGone
                        ? 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s'
                        : 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 0.28s',
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
            >
                <StartButton
                    course={course}
                    accent={accent}
                    size="lg"
                    tabIndex={heroGone ? undefined : -1}
                    sx={{ width: '100%' }}
                />
            </Box>
        </PageShell>
    )
}
