import { useEffect } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import { useColorScheme } from '@mui/joy/styles'
import { motion } from 'framer-motion'
import { CaretLeftIcon, CaretRightIcon, HouseIcon } from '@phosphor-icons/react'

import PageShell from '../components/Layout/PageShell'
import ContentBlocks from '../components/Content/ContentBlocks'
import LessonSidebar from '../components/Course/LessonSidebar'
import LessonNavMobile from '../components/Course/LessonNavMobile'
import Kbd from '../components/Ui/Kbd'
import { fillGradient } from '../components/Ui/shine'
import ShareButton from '../components/Ui/ShareButton'
import CopyLessonMenu from '../components/Ui/CopyLessonMenu'
import CourseState from '../components/Course/CourseState'
import { LessonPageSkeleton } from '../components/Course/PageSkeletons'
import PageNotFound from './PageNotFound'
import { useCourse } from '../api/courses'
import { useCourseView } from '../api/views'
import { getPage, getNeighbours, getLessons, getShortTitle, FINAL_SLUG } from '../data/courses'
import { getAccent, getInk } from '../theme/accents'
import useSeo from '../seo/useSeo'
import { lessonSeo } from '../seo/seo'

export default function PageLesson() {
    const { id, slug } = useParams()
    const navigate = useNavigate()

    const { course, error, reload } = useCourse(id)
    useCourseView(course)
    const page = getPage(course, slug)
    const { prev, next, index } = getNeighbours(course, slug)

    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'

    // Номер урока: у завершающей страницы его нет
    useSeo(page && course ? lessonSeo(course, page, slug === FINAL_SLUG ? 0 : index + 1) : null)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
    }, [slug])

    // Горячие клавиши: alt + ← / → — как в прошлой версии сайта.
    useEffect(() => {
        const onKeyDown = (event) => {
            if (!event.altKey) return
            if (event.key === 'ArrowRight' && next) navigate(`/course/${id}/${next.slug}`)
            if (event.key === 'ArrowLeft' && prev) navigate(`/course/${id}/${prev.slug}`)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [id, next, prev, navigate])

    if (!course) {
        return <CourseState id={id} error={error} reload={reload} skeleton={<LessonPageSkeleton />} />
    }

    if (!page) return <PageNotFound />

    const accent = getAccent(course.accent)
    const skin = accent[resolved] || accent.light
    const ink = getInk(accent, resolved)
    // Заливка акцентной кнопки: в тёмной теме почти чёрные краски осветляются
    const solid = resolved === 'dark' ? accent.solidDark : accent.solid
    const progress = ((index + 1) / course.pages.length) * 100
    // Итоговая страница не урок, поэтому и подписывается иначе
    const isFinal = page.slug === FINAL_SLUG
    const lessonsTotal = getLessons(course).length

    return (
        // Плавающая навигация на телефонах не должна перекрывать подвал
        <PageShell footerOffset={90}>
            {/* Прогресс курса: плавно доезжает до новой отметки */}
            <Box
                aria-hidden
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1050,
                    height: '3px',
                    bgcolor: 'page.border',
                }}
            >
                <Box
                    component={motion.div}
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    sx={{ height: '100%', bgcolor: ink }}
                />
            </Box>

            <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 3, md: 5 } }}>
                <Box
                    sx={{
                        display: 'grid',
                        gap: { xs: 3, md: 6 },
                        // Ширину колонки задаёт само меню: полное, полоска или одна кнопка
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'auto minmax(0, 1fr)' },
                        alignItems: 'start',
                    }}
                >
                    <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 24 }}>
                        <LessonSidebar course={course} activeSlug={slug} accent={accent} ink={ink} />
                    </Box>

                    {/* Ширина текста не растёт, когда меню свёрнуто: длинные строки читать тяжело.
                        width: 100% обязателен: с auto-отступами элемент грида сжимается по контенту */}
                    <Box sx={{ minWidth: 0, width: '100%', maxWidth: { md: 824 }, mx: 'auto' }}>
                        {/* Быстрый выход из урока на телефонах — остальное живёт в плавающем меню */}
                        <Typography
                            component={RouterLink}
                            to={`/course/${course.id}`}
                            level="body-sm"
                            sx={{
                                display: { xs: 'inline-flex', md: 'none' },
                                alignItems: 'center',
                                gap: 0.75,
                                mb: 2.5,
                                px: 1,
                                py: 0.5,
                                borderRadius: 0,
                                bgcolor: 'background.level1',
                                textDecoration: 'none',
                                color: 'text.secondary',
                            }}
                        >
                            <CaretLeftIcon size={18} weight="bold" />
                            {course.title}
                        </Typography>

                        {/* Номер урока, справа — копирование урока в Markdown или HTML */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <Typography
                                sx={{
                                    fontFamily: 'code',
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: ink,
                                }}
                            >
                                {isFinal ? 'Итог курса' : `Урок ${index + 1} из ${lessonsTotal}`}
                            </Typography>
                            <CopyLessonMenu page={page} sx={{ flexShrink: 0 }} />
                        </Box>

                        <Typography
                            level="h1"
                            sx={{
                                mt: 1.5,
                                mb: 4,
                                fontWeight: 500,
                                letterSpacing: '-0.025em',
                                lineHeight: 1.12,
                                fontSize: { xs: '30px', sm: '38px', md: '46px' },
                            }}
                        >
                            {page.title}
                        </Typography>

                        <ContentBlocks blocks={page.content} ink={ink} />

                        {/* Навигация по урокам */}
                        <Box
                            sx={{
                                mt: 7,
                                pt: 4,
                                borderTop: '1px solid',
                                borderColor: 'page.border',
                                display: 'grid',
                                gap: 1.5,
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            }}
                        >
                            {prev ? (
                                <Box
                                    component={RouterLink}
                                    to={`/course/${course.id}/${prev.slug}`}
                                    sx={{
                                        p: 2.25,
                                        borderRadius: 'md',
                                        textDecoration: 'none',
                                        border: '1px solid',
                                        borderColor: 'page.border',
                                        bgcolor: 'transparent',
                                        transition: 'background-color 0.18s ease',
                                        '@media (hover: hover)': {
                                            '&:hover': { bgcolor: 'background.level1' },
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: 'code',
                                            fontSize: '11px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: 'text.tertiary',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                        }}
                                    >
                                        <CaretLeftIcon size={14} weight="bold" />
                                        Предыдущий
                                    </Typography>
                                    <Typography
                                        sx={{
                                            mt: 0.75,
                                            fontFamily: 'display',
                                            fontWeight: 500,
                                            color: 'text.primary',
                                        }}
                                    >
                                        {getShortTitle(prev)}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box />
                            )}

                            {next ? (
                                <Box
                                    component={RouterLink}
                                    to={`/course/${course.id}/${next.slug}`}
                                    sx={{
                                        p: 2.25,
                                        borderRadius: 'md',
                                        textDecoration: 'none',
                                        bgcolor: `color-mix(in srgb, ${skin.bg} 70%, transparent)`,
                                        borderColor: skin.rule,
                                        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                        // Только для мыши: компонент урока не пересоздаётся при переходе,
                                        // и на тач-экранах :hover «залип» бы на новой странице
                                        '@media (hover: hover)': {
                                            '&:hover': { bgcolor: skin.bg, boxShadow: skin.shadow },
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: 'code',
                                            fontSize: '11px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: skin.text,
                                            opacity: '0.7 !important',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: 0.75,
                                        }}
                                    >
                                        Следующий
                                        <CaretRightIcon size={14} weight="bold" />
                                    </Typography>
                                    <Typography
                                        sx={{
                                            mt: 0.75,
                                            fontFamily: 'display',
                                            fontWeight: 500,
                                            color: skin.text,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {getShortTitle(next)}
                                    </Typography>
                                </Box>
                            ) : (
                                /* Последний урок: дальше идти некуда — зовём назад в каталог */
                                <Box
                                    component={RouterLink}
                                    to="/"
                                    sx={{
                                        position: 'relative',
                                        overflow: 'hidden',
                                        p: 2.25,
                                        borderRadius: 'md',
                                        textDecoration: 'none',
                                        bgcolor: solid,
                                        backgroundImage: fillGradient(solid),
                                        border: '1px solid',
                                        borderColor: solid,
                                        transition: 'filter 0.2s ease, box-shadow 0.2s ease',
                                        '@media (hover: hover)': {
                                            '&:hover': { filter: 'brightness(1.15)', boxShadow: skin.shadow },
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: 'code',
                                            fontSize: '11px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: '#fff',
                                            opacity: 0.75,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: 0.75,
                                        }}
                                    >
                                        Курс пройден
                                        <HouseIcon size={14} weight="bold" />
                                    </Typography>
                                    <Typography
                                        sx={{
                                            mt: 0.75,
                                            fontFamily: 'display',
                                            fontWeight: 600,
                                            color: '#fff',
                                            textAlign: 'right',
                                        }}
                                    >
                                        Вернуться к курсам
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Подсказка про хоткеи — только про те, что на этой странице работают */}
                        {(prev || next) && (
                            <Typography
                                sx={{
                                    mt: 2,
                                    fontSize: 'sm',
                                    color: 'text.tertiary',
                                    display: { xs: 'none', md: 'flex' },
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 0.5,
                                }}
                            >
                                Подсказка: листайте уроки с клавиатуры при помощи
                                <>
                                    <Kbd>Alt</Kbd>
                                    <Box component="span" aria-hidden>+</Box>
                                    {prev && <Kbd>←</Kbd>}
                                    {next && <Kbd>→</Kbd>}
                                </>
                            </Typography>
                        )}

                        {/* Поделиться курсом — ссылка ведёт на страницу курса, а не на этот урок:
                            так новый человек начнёт с начала */}
                        <Box
                            sx={{
                                mt: { xs: 4, md: 5 },
                                p: { xs: 2.25, sm: 2.5 },
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: 2,
                                bgcolor: 'background.level1',
                            }}
                        >
                            <Box>
                                <Typography sx={{ fontFamily: 'display', fontWeight: 500, color: 'text.primary' }}>
                                    Курс полезен? Поделитесь им
                                </Typography>
                                <Typography sx={{ mt: 0.5, fontSize: 'sm', color: 'text.tertiary', lineHeight: 1.5 }}>
                                    Отправьте ссылку тому, кто тоже хочет научиться.
                                </Typography>
                            </Box>
                            <ShareButton
                                path={`/course/${course.id}`}
                                title={course.title}
                                text={course.subtitle}
                                variant="outlined"
                                color="neutral"
                                sx={{ flexShrink: 0, fontWeight: 700, borderColor: 'page.border', color: 'text.primary', bgcolor: 'background.body' }}
                            >
                                Поделиться курсом
                            </ShareButton>
                        </Box>
                    </Box>
                </Box>
            </Container>

            <LessonNavMobile
                course={course}
                activeSlug={slug}
                accent={accent}
                ink={ink}
                prev={prev}
                next={next}
            />
        </PageShell>
    )
}
