import { useState } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { useColorScheme } from '@mui/joy/styles'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'

import { getAccent } from '../../theme/accents'
import { lessonsLabel } from '../../data/plural'
import { getLessons } from '../../data/courses'
import CourseMedia from '../Course/CourseMedia'
import Difficulty from '../Course/Difficulty'
import StartButton from '../Course/StartButton'

const appear = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * Карточка курса — статья каталога: обложка сверху, номер на полях, плоская
 * плашка цвета курса, тонкая линейка под шапкой. Тени по умолчанию нет, при
 * наведении появляется небольшая тень под цвет самой карточки. Если у курса
 * есть видео — при наведении оно играет вместо обложки.
 *
 * У курса с `disabled: true` карточка неактивна: без ссылок и кнопок, приглушена
 * и вместо кнопок показывает, что курс ещё в разработке. Объём в такой карточке
 * берётся из `duration` — это задуманный размер курса, а не число готовых уроков.
 */
export default function CourseCard({ course, index }) {
    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'
    const accent = getAccent(course.accent)
    const skin = accent[resolved] || accent.light

    const [hovered, setHovered] = useState(false)

    const disabled = Boolean(course.disabled)
    const number = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null
    const lessons = getLessons(course).length
    const volume = disabled ? course.duration : lessonsLabel(lessons)

    return (
        <Box
            component={motion.div}
            variants={appear}
            aria-disabled={disabled || undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'md',
                bgcolor: skin.bg,
                border: '1px solid',
                borderColor: skin.rule,
                boxShadow: 'none',
                // Закрытый курс не приподнимается и не подсвечивается при наведении
                ...(disabled
                    ? { opacity: 0.7, cursor: 'default' }
                    : {
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: skin.shadow,
                        },
                    }),
            }}
        >
            {/* Вся карточка — ссылка на курс; кнопки лежат выше по z-index */}
            {!disabled && (
                <Box
                    component={RouterLink}
                    to={`/course/${course.id}`}
                    aria-label={`Открыть курс: ${course.title}`}
                    sx={{ position: 'absolute', inset: 0, zIndex: 1, borderRadius: 'inherit' }}
                />
            )}

            <CourseMedia
                course={course}
                skin={skin}
                playing={!disabled && hovered && Boolean(course.video)}
            />

            {/* Шапка: номер и уровень по краям, как колонтитул */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    px: { xs: 2.25, sm: 2.75 },
                    py: 1.25,
                    borderBottom: '1px solid',
                    borderColor: skin.rule,
                    fontFamily: 'code',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: skin.text,
                }}
            >
                <Box component="span" sx={{ opacity: 0.55 }}>
                    {number ?? course.chips[0]}
                </Box>
                <Box component="span" sx={{ opacity: 0.75, textAlign: 'right' }}>
                    {course.level}
                </Box>
            </Box>

            {/* Название и описание — сразу под шапкой, по верху карточки */}
            <Box
                sx={{
                    position: 'relative',
                    px: { xs: 2.25, sm: 2.75 },
                    pt: 2.25,
                    pb: 2.5,
                    pointerEvents: 'none',
                }}
            >
                <Typography
                    level="h3"
                    sx={{
                        fontWeight: 600,
                        color: skin.text,
                        fontSize: { xs: '22px', sm: '24px' },
                        lineHeight: 1.2,
                    }}
                >
                    {course.title}
                </Typography>

                <Typography
                    sx={{
                        mt: 1.25,
                        color: skin.text,
                        opacity: 0.78,
                        fontSize: 'sm',
                        lineHeight: 1.6,
                    }}
                >
                    {course.subtitle}
                </Typography>

                <Box
                    sx={{
                        mt: 2,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        fontFamily: 'code',
                        fontSize: '11px',
                        color: skin.text,
                        opacity: 0.7,
                    }}
                >
                    {course.chips.map((chip, chipIndex) => (
                        <Box component="span" key={chip} sx={{ display: 'flex', gap: 0.75 }}>
                            {chipIndex > 0 && <Box component="span" sx={{ opacity: 0.5 }}>/</Box>}
                            {chip}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Сложность, объём и кнопки прижаты к низу: в ряду карточки одной
                высоты, и низ совпадает даже если у соседа есть обложка, а тут нет */}
            <Box
                sx={{
                    position: 'relative',
                    mt: 'auto',
                    mx: { xs: 2.25, sm: 2.75 },
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: skin.rule,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    pointerEvents: 'none',
                }}
            >
                <Difficulty value={course.difficulty} color={skin.text} />
                <Box
                    component="span"
                    sx={{
                        fontFamily: 'code',
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: skin.text,
                        opacity: 0.7,
                    }}
                >
                    {volume}
                </Box>
            </Box>

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    mt: 2,
                    px: { xs: 2.25, sm: 2.75 },
                    pb: { xs: 2.25, sm: 2.5 },
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                {disabled ? (
                    // Ни кнопка, ни ссылка: нажимать пока нечего
                    <Box
                        sx={{
                            flex: '1 1 100%',
                            py: '10px',
                            textAlign: 'center',
                            border: '1px dashed',
                            borderColor: skin.rule,
                            fontFamily: 'code',
                            fontSize: '11px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: skin.text,
                            opacity: 0.7,
                        }}
                    >
                        Курс в разработке
                    </Box>
                ) : (
                    <>
                        <StartButton course={course} accent={accent} sx={{ flex: '1 1 150px' }} />
                        <Button
                            component={RouterLink}
                            to={`/course/${course.id}`}
                            variant="plain"
                            sx={{
                                // На телефонах «Подробнее» занимает всю ширину под первой кнопкой
                                flex: { xs: '1 1 100%', sm: '0 1 auto' },
                                bgcolor: 'transparent',
                                color: skin.text,
                                border: '1px solid',
                                borderColor: skin.rule,
                                fontWeight: 700,
                                '&:hover': { bgcolor: skin.chip, color: skin.text },
                            }}
                        >
                            Подробнее
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    )
}
