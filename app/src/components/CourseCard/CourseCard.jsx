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

export default function CourseCard({ course }) {
    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'
    const accent = getAccent(course.accent)
    const skin = accent[resolved] || accent.light

    const firstLesson = course.pages?.[0]?.slug ?? '1'

    return (
        <Box
            component={motion.div}
            variants={appear}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 2.5, sm: 3 },
                borderRadius: 'xl',
                minHeight: 300,
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
                    top: -40,
                    right: -30,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: skin.glow,
                    filter: 'blur(10px)',
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ position: 'relative', flex: 1 }}>
                <Typography
                    level="body-xs"
                    sx={{ color: skin.text, opacity: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                    {course.level}
                </Typography>

                <Typography
                    level="h3"
                    sx={{ mt: 1, fontWeight: 700, color: skin.text, letterSpacing: '-0.02em' }}
                >
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

            <Box sx={{ position: 'relative', mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
