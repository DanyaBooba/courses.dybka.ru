import { useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import { useColorScheme } from '@mui/joy/styles'
import { ArrowLeftIcon, GithubLogoIcon } from '@phosphor-icons/react'

import PageShell from '../components/Layout/PageShell'
import ContentBlocks from '../components/Content/ContentBlocks'
import PageNotFound from './PageNotFound'
import { getCourse } from '../data/courses'
import { getAccent } from '../theme/accents'

function Meta({ label, value }) {
    return (
        <Box>
            <Typography level="body-xs" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
                {label}
            </Typography>
            <Typography sx={{ fontWeight: 700, mt: 0.25 }}>{value}</Typography>
        </Box>
    )
}

export default function PageCourse() {
    const { id } = useParams()
    const course = getCourse(id)

    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'

    useEffect(() => {
        if (course) document.title = `${course.title} — dev.dybka.ru`
    }, [course])

    if (!course) return <PageNotFound />

    const accent = getAccent(course.accent)
    const skin = accent[resolved] || accent.light
    const lessons = course.pages.filter((page) => page.slug !== 'end')
    const firstLesson = course.pages[0]?.slug ?? '1'

    return (
        <PageShell>
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 4, md: 6 } }}>
                {/* Шапка курса */}
                <Box
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        p: { xs: 3, md: 5 },
                        borderRadius: 'xl',
                        background: skin.gradient,
                        border: '1px solid',
                        borderColor: 'page.border',
                        boxShadow: (theme) => theme.vars.palette.page.cardShadow,
                    }}
                >
                    <Box
                        aria-hidden
                        sx={{
                            position: 'absolute',
                            top: -80,
                            right: -60,
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: skin.glow,
                            filter: 'blur(20px)',
                        }}
                    />

                    <Box sx={{ position: 'relative', maxWidth: 720 }}>
                        <Typography
                            component={RouterLink}
                            to="/"
                            level="body-sm"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 1.5,
                                py: 0.75,
                                borderRadius: '999px',
                                bgcolor: skin.chip,
                                color: skin.text,
                                textDecoration: 'none',
                                transition: 'filter 0.18s ease',
                                '&:hover': { filter: 'brightness(1.08)' },
                            }}
                        >
                            <ArrowLeftIcon size={20} weight="bold" />
                            Все курсы
                        </Typography>

                        <Typography
                            level="h1"
                            sx={{
                                mt: 2,
                                fontWeight: 700,
                                letterSpacing: '-0.03em',
                                color: skin.text,
                                fontSize: { xs: '32px', sm: '42px', md: '52px' },
                                lineHeight: 1.1,
                            }}
                        >
                            {course.title}
                        </Typography>

                        <Typography sx={{ mt: 2, color: skin.text, opacity: 0.85, fontSize: 'lg', lineHeight: 1.65 }}>
                            {course.subtitle}
                        </Typography>

                        <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {course.chips.map((chip) => (
                                <Chip
                                    key={chip}
                                    size="sm"
                                    variant="plain"
                                    sx={{ bgcolor: skin.chip, color: skin.text, borderRadius: '999px' }}
                                >
                                    {chip}
                                </Chip>
                            ))}
                        </Box>

                        <Box sx={{ mt: 3.5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            <Button
                                component={RouterLink}
                                to={`/course/${course.id}/${firstLesson}`}
                                size="lg"
                                sx={{
                                    bgcolor: accent.solid,
                                    color: '#fff',
                                    '&:hover': { bgcolor: accent.solid, filter: 'brightness(0.93)' },
                                }}
                            >
                                Начать курс
                            </Button>
                            {course.github && (
                                <Button
                                    component="a"
                                    href={course.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    size="lg"
                                    variant="plain"
                                    sx={{
                                        bgcolor: skin.chip,
                                        color: skin.text,
                                        '&:hover': { bgcolor: skin.chip, filter: 'brightness(1.06)' },
                                    }}
                                    startDecorator={<GithubLogoIcon size={22} />}
                                >
                                    GitHub
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ mt: 4, display: 'flex', gap: 4, flexWrap: 'wrap', color: skin.text }}>
                            <Meta label="Уровень" value={course.level} />
                            <Meta label="Объём" value={course.duration} />
                            <Meta label="Автор" value={course.author.name} />
                        </Box>
                    </Box>
                </Box>

                {/* Программа + описание */}
                <Box
                    sx={{
                        mt: { xs: 4, md: 6 },
                        display: 'grid',
                        gap: { xs: 4, md: 6 },
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
                        alignItems: 'start',
                    }}
                >
                    <Box>
                        <Typography level="h2" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 2 }}>
                            О курсе
                        </Typography>
                        <ContentBlocks blocks={course.about} />
                    </Box>

                    <Box
                        sx={{
                            position: { md: 'sticky' },
                            top: { md: 24 },
                            p: 3,
                            borderRadius: 'lg',
                            bgcolor: 'background.surface',
                            border: '1px solid',
                            borderColor: 'page.border',
                            boxShadow: (theme) => theme.vars.palette.page.cardShadow,
                        }}
                    >
                        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                            Программа
                        </Typography>
                        <Typography level="body-sm" sx={{ mt: 0.5, color: 'text.tertiary' }}>
                            {lessons.length} уроков
                        </Typography>

                        <Box
                            component="ol"
                            sx={{
                                listStyle: 'none',
                                m: 0,
                                mt: 2,
                                p: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                maxHeight: { md: '52vh' },
                                overflowY: { md: 'auto' },
                            }}
                        >
                            {lessons.map((page, index) => (
                                <Box component="li" key={page.slug}>
                                    <Box
                                        component={RouterLink}
                                        to={`/course/${course.id}/${page.slug}`}
                                        sx={{
                                            display: 'flex',
                                            gap: 1.5,
                                            alignItems: 'baseline',
                                            px: 1.5,
                                            py: 1.25,
                                            borderRadius: 'sm',
                                            textDecoration: 'none',
                                            color: 'text.secondary',
                                            transition: 'background-color 0.18s ease, color 0.18s ease',
                                            '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                fontSize: 'xs',
                                                fontWeight: 700,
                                                color: accent.solid,
                                                minWidth: 18,
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <Box sx={{ fontSize: 'sm', lineHeight: 1.5 }}>{page.short}</Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                    </Box>
                </Box>
            </Container>
        </PageShell>
    )
}
