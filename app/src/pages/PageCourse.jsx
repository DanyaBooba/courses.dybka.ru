import { useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { useColorScheme } from '@mui/joy/styles'
import { ArrowLeftIcon, GithubLogoIcon } from '@phosphor-icons/react'

import PageShell from '../components/Layout/PageShell'
import ContentBlocks from '../components/Content/ContentBlocks'
import PageNotFound from './PageNotFound'
import { getCourse } from '../data/courses'
import { getAccent, getInk } from '../theme/accents'

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
            <Typography sx={{ mt: 0.5, fontWeight: 600, color }}>{value}</Typography>
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

    // Переход «Подробнее» с главной должен открывать курс с начала страницы
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
    }, [id])

    if (!course) return <PageNotFound />

    const accent = getAccent(course.accent)
    const skin = accent[resolved] || accent.light
    const ink = getInk(accent, resolved)
    const lessons = course.pages.filter((page) => page.slug !== 'end')
    const firstLesson = course.pages[0]?.slug ?? '1'

    return (
        <PageShell>
            <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 3, md: 4 } }}>
                {/* Возврат к каталогу — отдельной строкой над титулом */}
                <Typography
                    component={RouterLink}
                    to="/"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        mb: 2,
                        fontFamily: 'code',
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        color: 'text.tertiary',
                        '&:hover': { color: 'text.primary' },
                    }}
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                    Все курсы
                </Typography>

                {/* Титул курса: плоская плашка цвета курса, без градиента и без пятен */}
                <Box
                    sx={{
                        p: { xs: 2.5, md: 4.5 },
                        borderRadius: 'md',
                        bgcolor: skin.bg,
                        border: '1px solid',
                        borderColor: skin.rule,
                    }}
                >
                    <Box sx={{ maxWidth: 760 }}>
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
                            <Meta label="Объём" value={`${lessons.length} уроков`} color={skin.text} />
                        </Box>

                        <Box sx={{ mt: 3.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Button
                                component={RouterLink}
                                to={`/course/${course.id}/${firstLesson}`}
                                size="lg"
                                sx={{
                                    px: 3,
                                    bgcolor: accent.solid,
                                    color: '#fff',
                                    '&:hover': { bgcolor: accent.solid, filter: 'brightness(1.1)' },
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
                                        bgcolor: 'transparent',
                                        color: skin.text,
                                        border: '1px solid',
                                        borderColor: skin.rule,
                                        '&:hover': { bgcolor: skin.chip, color: skin.text },
                                    }}
                                    startDecorator={<GithubLogoIcon size={20} />}
                                >
                                    GitHub
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Программа + описание */}
                <Box
                    sx={{
                        mt: { xs: 4, md: 6 },
                        display: 'grid',
                        gap: { xs: 4, md: 6 },
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
                        alignItems: 'start',
                    }}
                >
                    <Box>
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
                        <ContentBlocks blocks={course.about} />
                    </Box>

                    {/* Программа: без обводки, только линейки */}
                    <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
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
                                {lessons.length} уроков
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
                                            '&:hover': { color: 'text.primary', pl: 0.75 },
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
