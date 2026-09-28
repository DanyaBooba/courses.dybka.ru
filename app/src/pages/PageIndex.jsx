import { useEffect } from 'react'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { motion } from 'framer-motion'

import PageShell from '../components/Layout/PageShell'
import CourseCard from '../components/CourseCard/CourseCard'
import { shineSx } from '../components/Ui/shine'
import courses from '../data/courses'
import { groupBySection } from '../data/sections'

const rise = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
}

const lessonsTotal = courses.reduce((sum, course) => sum + course.pages.length, 0)
const sections = groupBySection(courses)

/** Выходные данные справочника: коротко и без обещаний. */
const facts = [
    { label: 'Курсов', value: String(courses.length) },
    { label: 'Уроков', value: String(lessonsTotal) },
    { label: 'Стоимость', value: 'Бесплатно' },
    { label: 'Регистрация', value: 'Не нужна' },
]

export default function PageIndex() {
    useEffect(() => {
        document.title = 'courses.dybka.ru — бесплатные открытые курсы по программированию'
    }, [])

    return (
        <PageShell>
            <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 } }}>
                {/* Титульный лист: выходные данные, заголовок, линейка */}
                <Box
                    component={motion.header}
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    sx={{ pt: { xs: 4, md: 16 }, pb: { xs: 5, md: 12 } }}
                >

                    <Typography
                        component={motion.h1}
                        variants={rise}
                        level="h1"
                        sx={{
                            mt: { xs: 3.5, md: 5 },
                            maxWidth: 940,
                            fontWeight: 450,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.05,
                            fontSize: { xs: '38px', sm: '54px', md: '72px' },
                        }}
                    >
                        Учитесь программировать
                        <br />
                        <Box component="em" sx={{ fontStyle: 'italic', fontWeight: 450 }}>
                            быстро, просто <nobr>и{' '}
                                <Box component="span" sx={{ color: 'page.accentInk' }}>
                                    <nobr>со вкусом</nobr>
                                </Box></nobr>
                        </Box>
                    </Typography>

                    <Typography
                        component={motion.p}
                        variants={rise}
                        sx={{
                            mt: { xs: 3, md: 4 },
                            maxWidth: 720,
                            fontSize: { xs: 'md', md: 'lg' },
                            lineHeight: 1.7,
                            color: 'text.secondary',
                        }}
                    >
                        Авторские курсы без  нейросетей и встроеных платежей. Игры на Unity, сайты, мобильная разработка. Все бесплатно с открытым кодом и без регистрации.
                    </Typography>

                    <Box component={motion.div} variants={rise} sx={{ mt: { xs: 3.5, md: 4.5 } }}>
                        <Button
                            component="a"
                            href="#courses"
                            size="lg"
                            sx={{ ...shineSx('var(--dd-palette-primary-solidBg)', 'var(--dd-palette-primary-solidColor)'), px: 3, fontWeight: 700 }}
                        >
                            Смотреть курсы
                        </Button>
                    </Box>

                    {/* Выходные данные: четыре факта в линейках, как в колофоне */}
                    <Box
                        component={motion.dl}
                        variants={rise}
                        sx={{
                            mt: { xs: 5, md: 7 },
                            m: 0,
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                            borderTop: '1px solid',
                            borderColor: 'page.border',
                        }}
                    >
                        {facts.map((fact) => (
                            <Box
                                key={fact.label}
                                sx={{
                                    py: 2,
                                    pr: 2,
                                    borderBottom: { xs: '1px solid', sm: 'none' },
                                    borderColor: 'page.border',
                                }}
                            >
                                <Box
                                    component="dt"
                                    sx={{
                                        fontFamily: 'code',
                                        fontSize: '11px',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        color: 'text.tertiary',
                                    }}
                                >
                                    {fact.label}
                                </Box>
                                <Box
                                    component="dd"
                                    sx={{
                                        m: 0,
                                        mt: 0.75,
                                        fontFamily: 'display',
                                        fontSize: { xs: '24px', md: '28px' },
                                        lineHeight: 1.1,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {fact.value}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Курсы по направлениям */}
                <Box id="courses" sx={{ scrollMarginTop: '24px', pt: { xs: 1, md: 2 } }}>
                    {sections.map((section, sectionIndex) => (
                        <Box
                            key={section.id}
                            component={motion.section}
                            variants={stagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.02 }}
                            sx={{ mt: sectionIndex === 0 ? 0 : { xs: 6, md: 8 } }}
                        >
                            <Box
                                component={motion.div}
                                variants={rise}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    pb: 1.25,
                                    borderBottom: '2px solid',
                                    borderColor: 'page.rule',
                                }}
                            >
                                <Typography
                                    component="h2"
                                    level="h2"
                                    sx={{ fontWeight: 500, letterSpacing: '-0.02em' }}
                                >
                                    {section.title}
                                </Typography>
                                <Box
                                    component="span"
                                    sx={{
                                        flexShrink: 0,
                                        fontFamily: 'code',
                                        fontSize: '11px',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        color: 'text.tertiary',
                                    }}
                                >
                                    {section.courses.length} шт.
                                </Box>
                            </Box>

                            {section.note && (
                                <Typography
                                    component={motion.p}
                                    variants={rise}
                                    sx={{
                                        mt: 1.5,
                                        maxWidth: 620,
                                        fontSize: 'sm',
                                        lineHeight: 1.6,
                                        color: 'text.tertiary',
                                    }}
                                >
                                    {section.note}
                                </Typography>
                            )}

                            <Box
                                sx={{
                                    mt: { xs: 3, md: 3.5 },
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: {
                                        xs: 'minmax(0, 1fr)',
                                        sm: 'repeat(2, minmax(0, 1fr))',
                                        lg: 'repeat(3, minmax(0, 1fr))',
                                    },
                                }}
                            >
                                {section.courses.map((course, index) => (
                                    <CourseCard key={course.id} course={course} index={index} />
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Container>
        </PageShell>
    )
}
