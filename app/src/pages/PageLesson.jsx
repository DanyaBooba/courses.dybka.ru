import { useEffect } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import LinearProgress from '@mui/joy/LinearProgress'
import { useColorScheme } from '@mui/joy/styles'

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
            <LinearProgress
                determinate
                value={progress}
                variant="soft"
                sx={{
                    '--LinearProgress-thickness': '3px',
                    '--LinearProgress-radius': '0px',
                    '&::before': { background: accent.solid },
                    position: 'sticky',
                    top: 0,
                    zIndex: 1050,
                }}
            />

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
                                mb: 2,
                                textDecoration: 'none',
                                color: 'text.tertiary',
                            }}
                        >
                            ← {course.title}
                        </Typography>

                        <Typography
                            level="body-xs"
                            sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: accent.solid, fontWeight: 700 }}
                        >
                            {page.slug === 'end' ? 'Завершение' : `Урок ${index + 1} из ${course.pages.length - 1}`}
                        </Typography>

                        <Typography
                            level="h1"
                            sx={{
                                mt: 1.5,
                                mb: 4,
                                fontWeight: 700,
                                letterSpacing: '-0.03em',
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
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: (theme) => theme.vars.palette.page.cardShadow },
                                    }}
                                >
                                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                        ← Предыдущий урок
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
                                        textAlign: 'right',
                                        background: skin.gradient,
                                        border: '1px solid',
                                        borderColor: 'page.border',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: (theme) => theme.vars.palette.page.cardShadow },
                                    }}
                                >
                                    <Typography level="body-xs" sx={{ color: skin.text, opacity: 0.7 }}>
                                        {next.slug === 'end' ? 'Завершить курс →' : 'Следующий урок →'}
                                    </Typography>
                                    <Typography sx={{ mt: 0.5, fontWeight: 700, color: skin.text }}>
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

                        {page.slug === 'end' && (
                            <Box sx={{ mt: 4, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                <Button component={RouterLink} to="/" variant="soft" color="neutral">
                                    Вернуться к курсам
                                </Button>
                                {page.certificate && (
                                    <Button component="a" href={page.certificate} download>
                                        Скачать сертификат
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Отступ, чтобы плавающая навигация не перекрывала подвал */}
                <Box sx={{ height: { xs: 72, md: 0 } }} />
            </Container>

            <LessonNavMobile course={course} activeSlug={slug} accent={accent} prev={prev} next={next} />
        </PageShell>
    )
}
