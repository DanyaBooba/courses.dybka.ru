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
import { getAccent, getInk } from '../theme/accents'

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
    const ink = getInk(accent, resolved)
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
                    sx={{ height: '100%', bgcolor: ink }}
                />
            </Box>

            <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 3, md: 5 } }}>
                <Box
                    sx={{
                        display: 'grid',
                        gap: { xs: 3, md: 6 },
                        gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' },
                        alignItems: 'start',
                    }}
                >
                    <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 24 }}>
                        <LessonSidebar course={course} activeSlug={slug} accent={accent} ink={ink} />
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

                        <Typography
                            sx={{
                                fontFamily: 'code',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                color: ink,
                            }}
                        >
                            Урок {index + 1} из {course.pages.length}
                        </Typography>

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
                                        p: 2.25,
                                        borderRadius: 'md',
                                        textDecoration: 'none',
                                        border: '1px solid',
                                        borderColor: 'page.border',
                                        bgcolor: 'transparent',
                                        transition: 'background-color 0.18s ease',
                                        '&:hover': { bgcolor: 'background.level1' },
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
                                            fontWeight: 600,
                                            color: 'text.primary',
                                        }}
                                    >
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
                                        p: 2.25,
                                        borderRadius: 'md',
                                        textDecoration: 'none',
                                        bgcolor: skin.bg,
                                        border: '1px solid',
                                        borderColor: skin.rule,
                                        transition: 'box-shadow 0.2s ease',
                                        '&:hover': { boxShadow: skin.shadow },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: 'code',
                                            fontSize: '11px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: skin.text,
                                            opacity: 0.7,
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
                                            fontWeight: 600,
                                            color: skin.text,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {next.short}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Typography
                            sx={{
                                mt: 2,
                                fontFamily: 'code',
                                fontSize: '11px',
                                color: 'text.tertiary',
                                display: { xs: 'none', md: 'block' },
                            }}
                        >
                            Подсказка: листайте уроки с клавиатуры — alt + ← и alt + →
                        </Typography>
                    </Box>
                </Box>

                {/* Отступ, чтобы плавающая навигация не перекрывала подвал */}
                <Box sx={{ height: { xs: 72, md: 0 } }} />
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
