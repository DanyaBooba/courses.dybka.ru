import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import { useColorScheme } from '@mui/joy/styles'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'

import { getAccent } from '../../theme/accents'

const appear = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

// Пятно уезжает в один из углов — какой именно, зависит от id курса,
// чтобы сетка карточек не выглядела одинаковой.
const spots = [
    { top: '-18%', right: '-12%' },
    { bottom: '-20%', left: '-14%' },
    { top: '-16%', left: '-10%' },
    { bottom: '-18%', right: '-12%' },
]

function spotFor(id) {
    let hash = 0
    for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997
    return spots[hash % spots.length]
}

export default function CourseCard({ course }) {
    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'
    const accent = getAccent(course.accent)
    const skin = accent[resolved] || accent.light

    const firstLesson = course.pages?.[0]?.slug ?? '1'
    const spot = spotFor(course.id)

    return (
        <Box
            component={motion.div}
            variants={appear}
            whileHover="hover"
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 2.5, sm: 3 },
                borderRadius: 'xl',
                minHeight: 300,
                overflow: 'hidden',
                background: skin.gradient,
                border: '1px solid',
                borderColor: 'page.border',
                boxShadow: (theme) => theme.vars.palette.page.cardShadow,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.vars.palette.page.cardShadowHover,
                },
            }}
        >
            {/* Вся карточка — ссылка на курс; кнопки лежат выше по z-index */}
            <Box
                component={RouterLink}
                to={`/course/${course.id}`}
                aria-label={`Открыть курс: ${course.title}`}
                sx={{ position: 'absolute', inset: 0, zIndex: 1, borderRadius: 'inherit' }}
            />

            <Box
                aria-hidden
                component={motion.div}
                variants={{
                    hover: { scale: 1.2, opacity: 0.72, transition: { duration: 0.6, ease: 'easeOut' } },
                }}
                sx={{
                    position: 'absolute',
                    ...spot,
                    width: 190,
                    height: 190,
                    borderRadius: '50%',
                    background: skin.glow,
                    opacity: 0.42,
                    filter: 'blur(26px)',
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ position: 'relative', flex: 1, pointerEvents: 'none' }}>
                <Typography
                    level="body-xs"
                    sx={{ color: skin.text, opacity: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                    {course.level}
                </Typography>

                <Typography level="h3" sx={{ mt: 1, fontWeight: 700, color: skin.text }}>
                    {course.title}
                </Typography>

                <Typography sx={{ mt: 1.25, color: skin.text, opacity: 0.8, fontSize: 'sm', lineHeight: 1.6 }}>
                    {course.subtitle}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {course.chips.map((chip) => (
                        <Chip
                            key={chip}
                            size="sm"
                            variant="plain"
                            sx={{
                                bgcolor: skin.chip,
                                color: skin.text,
                                fontSize: 'xs',
                                borderRadius: '999px',
                            }}
                        >
                            {chip}
                        </Chip>
                    ))}
                </Box>
            </Box>

            <Box sx={{ position: 'relative', zIndex: 2, mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                    component={RouterLink}
                    to={`/course/${course.id}/${firstLesson}`}
                    sx={{
                        flex: '1 1 160px',
                        bgcolor: accent.solid,
                        color: '#fff',
                        '&:hover': { bgcolor: accent.solid, filter: 'brightness(0.93)' },
                    }}
                >
                    Начать курс
                </Button>
                <Button
                    component={RouterLink}
                    to={`/course/${course.id}`}
                    variant="plain"
                    sx={{
                        flex: '0 1 auto',
                        bgcolor: skin.chip,
                        color: skin.text,
                        '&:hover': { bgcolor: skin.chip, filter: 'brightness(1.06)' },
                    }}
                >
                    Подробнее
                </Button>
            </Box>
        </Box>
    )
}
