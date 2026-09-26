import { useEffect, useState } from 'react'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { useColorScheme } from '@mui/joy/styles'
import { AnimatePresence, motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'

import PageShell from '../components/Layout/PageShell'
import CourseCard from '../components/CourseCard/CourseCard'
import CourseOrbit from '../components/Hero/CourseOrbit'
import courses from '../data/courses'
import { getAccent } from '../theme/accents'

const rise = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}

export default function PageIndex() {
    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'

    const [selectedIndex, setSelectedIndex] = useState(null)
    const selected = selectedIndex === null ? null : courses[selectedIndex]

    useEffect(() => {
        document.title = 'dev.dybka.ru — бесплатные открытые курсы по программированию'
    }, [])

    const toggle = (index) => setSelectedIndex((current) => (current === index ? null : index))

    return (
        <PageShell>
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Герой: орбита курсов сверху, текст по центру под ней */}
                <Box sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 9 } }}>
                    <CourseOrbit
                        courses={courses}
                        colorScheme={resolved}
                        selectedIndex={selectedIndex}
                        onSelect={toggle}
                    />

                    {/* Подпись к выбранному курсу */}
                    <Box sx={{ mt: 2, minHeight: 68, display: 'grid', placeItems: 'center' }}>
                        <AnimatePresence mode="wait">
                            {selected ? (
                                <Box
                                    key={selected.id}
                                    component={motion.div}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.28 }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                        gap: 1.5,
                                        px: 1.75,
                                        py: 1.25,
                                        borderRadius: '999px',
                                        border: '1px solid',
                                        borderColor: 'page.border',
                                        bgcolor: 'background.surface',
                                    }}
                                >
                                    <Typography
                                        level="body-sm"
                                        sx={{ fontWeight: 700, color: getAccent(selected.accent).solid }}
                                    >
                                        {selected.title}
                                    </Typography>
                                    <Button
                                        component={RouterLink}
                                        to={`/course/${selected.id}/${selected.pages[0].slug}`}
                                        size="sm"
                                        sx={{
                                            bgcolor: getAccent(selected.accent).solid,
                                            color: '#fff',
                                            '&:hover': {
                                                bgcolor: getAccent(selected.accent).solid,
                                                filter: 'brightness(0.93)',
                                            },
                                        }}
                                    >
                                        Открыть курс
                                    </Button>
                                </Box>
                            ) : (
                                <Typography
                                    key="hint"
                                    component={motion.p}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    level="body-xs"
                                    sx={{ color: 'text.tertiary', textAlign: 'center' }}
                                >
                                    Крутите орбиту и нажмите на курс, чтобы вывести его вперёд
                                </Typography>
                            )}
                        </AnimatePresence>
                    </Box>

                    <Box
                        component={motion.div}
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        sx={{ mt: { xs: 3, md: 4 }, mx: 'auto', maxWidth: 720, textAlign: 'center' }}
                    >
                        <Typography
                            component={motion.h1}
                            variants={rise}
                            level="h1"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: '-0.035em',
                                lineHeight: 1.08,
                                fontSize: { xs: '36px', sm: '48px', md: '58px' },
                            }}
                        >
                            Учитесь программировать{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(100deg, #3b52e8 0%, #8a3fe0 45%, #dd5f1b 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                быстро, просто и со вкусом
                            </Box>
                        </Typography>

                        <Typography
                            component={motion.p}
                            variants={rise}
                            sx={{
                                mt: 3,
                                fontSize: { xs: 'md', md: 'lg' },
                                lineHeight: 1.7,
                                color: 'text.secondary',
                            }}
                        >
                            Курсы Даниила Дыбки: игры на Unity, сайты, основы программирования. Всё бесплатно, с открытым
                            исходным кодом и без единой формы регистрации.
                        </Typography>

                        <Box
                            component={motion.div}
                            variants={rise}
                            sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}
                        >
                            <Button
                                component={RouterLink}
                                to={`/course/${courses[0].id}/${courses[0].pages[0].slug}`}
                                size="lg"
                            >
                                Начать учиться
                            </Button>
                            <Button component="a" href="#courses" size="lg" variant="soft" color="neutral">
                                Посмотреть все курсы
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Все курсы */}
                <Box
                    id="courses"
                    component={motion.section}
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    sx={{ scrollMarginTop: '24px', pt: 2 }}
                >
                    <Typography
                        component={motion.h2}
                        variants={rise}
                        level="h2"
                        sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
                    >
                        Курсы
                    </Typography>
                    <Typography component={motion.p} variants={rise} sx={{ mt: 1, color: 'text.secondary' }}>
                        Выбирайте курс и начинайте прямо сейчас — прогресс никуда не денется.
                    </Typography>

                    <Box
                        sx={{
                            mt: 3.5,
                            display: 'grid',
                            gap: 2.5,
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                        }}
                    >
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </Box>
                </Box>
            </Container>
        </PageShell>
    )
}
