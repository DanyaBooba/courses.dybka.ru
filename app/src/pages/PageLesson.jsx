import { useEffect } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import { useColorScheme } from '@mui/joy/styles'
import { motion } from 'framer-motion'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'

import PageShell from '../components/Layout/PageShell'
import ContentBlocks from '../components/Content/ContentBlocks'
import LessonSidebar from '../components/Course/LessonSidebar'
import LessonNavMobile from '../components/Course/LessonNavMobile'
import PageNotFound from './PageNotFound'
import { getCourse, getPage, getNeighbours } from '../data/courses'
import { getAccent } from '../theme/accents'

export default function PageLesson() {
    const { id, slug } = useParams()
    const navigate = useNavigate()

    const course = getCourse(id)
    const page = getPage(course, slug)
    const { prev, next, index } = getNeighbours(course, slug)

    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'

    useEffect(() => {
        if (page && course) document.title = `${page.title} — ${course.title}`
    }, [page, course])

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

    if (!course || !page) return <PageNotFound />

    const accent = getAccent(course.accent)
    const skin = accent[resolved] || accent.light
    const progress = ((index + 1) / course.pages.length) * 100

    return (
        <PageShell>
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
                    sx={{ height: '100%', bgcolor: accent.solid, borderRadius: '0 999px 999px 0' }}
                />
            </Box>

            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 3, md: 5 } }}>
                <Box
                    sx={{
                        display: 'grid',
                        gap: { xs: 3, md: 6 },
                        gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' },
                        alignItems: 'start',
                    }}
                >
                    <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 24 }}>
                        <LessonSidebar course={course} activeSlug={slug} accent={accent} />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        {/* Быстрый выход из урока на телефонах — остальное живёт в плавающем меню */}
                        <Typography
                            component={RouterLink}
                            to={`/course/${course.id}`}
                            level="body-sm"
                            sx={{
                                display: { xs: 'inline-flex', md: 'none' },
                                alignItems: 'center',
                                gap: 0.75,
                                mb: 2,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: '999px',
                                bgcolor: 'background.level1',
                                textDecoration: 'none',
                                color: 'text.secondary',
                            }}
                        >
                            <CaretLeftIcon size={18} weight="bold" />
                            {course.title}
                        </Typography>

                        <Typography
                            level="body-xs"
                            sx={{
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: accent.solid,
                                fontWeight: 700,
                            }}
                        >
                            Урок {index + 1} из {course.pages.length}
                        </Typography>

                        <Typography
                            level="h1"
                            sx={{
                                mt: 1.5,
                                mb: 4,
                                fontWeight: 700,
                                lineHeight: 1.15,
                                fontSize: { xs: '30px', sm: '38px', md: '44px' },
                            }}
                        >
                            {page.title}
                        </Typography>

                        <ContentBlocks blocks={page.content} />

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
                                        p: 2.5,
                                        borderRadius: 'lg',
                                        textDecoration: 'none',
                                        border: '1px solid',
                                        borderColor: 'page.border',
                                        bgcolor: 'background.surface',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: (theme) => theme.vars.palette.page.cardShadow,
                                        },
                                    }}
                                >
                                    <Typography
                                        level="body-xs"
                                        sx={{
                                            color: 'text.tertiary',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        <CaretLeftIcon size={16} weight="bold" />
                                        Предыдущий урок
                                    </Typography>
                                    <Typography sx={{ mt: 0.5, fontWeight: 700, color: 'text.primary' }}>
                                        {prev.short}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box />
                            )}

                            {next && (
                                <Box
                                    component={RouterLink}
                                    to={`/course/${course.id}/${next.slug}`}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 'lg',
                                        textDecoration: 'none',
                                        background: skin.gradient,
                                        border: '1px solid',
                                        borderColor: 'page.border',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: (theme) => theme.vars.palette.page.cardShadow,
                                        },
                                    }}
                                >
                                    <Typography
                                        level="body-xs"
                                        sx={{
                                            color: skin.text,
                                            opacity: 0.7,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: 0.5,
                                        }}
                                    >
                                        Следующий урок
                                        <CaretRightIcon size={16} weight="bold" />
                                    </Typography>
                                    <Typography
                                        sx={{ mt: 0.5, fontWeight: 700, color: skin.text, textAlign: 'right' }}
                                    >
                                        {next.short}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Typography
                            level="body-xs"
                            sx={{ mt: 2, color: 'text.tertiary', display: { xs: 'none', md: 'block' } }}
                        >
                            Подсказка: листайте уроки с клавиатуры — alt + ← и alt + →
                        </Typography>
                    </Box>
                </Box>

                {/* Отступ, чтобы плавающая навигация не перекрывала подвал */}
                <Box sx={{ height: { xs: 72, md: 0 } }} />
            </Container>

            <LessonNavMobile course={course} activeSlug={slug} accent={accent} prev={prev} next={next} />
        </PageShell>
    )
}
