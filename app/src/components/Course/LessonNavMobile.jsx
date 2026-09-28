import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import IconButton from '@mui/joy/IconButton'
import Drawer from '@mui/joy/Drawer'
import { CaretLeftIcon, CaretRightIcon, ListIcon, XIcon } from '@phosphor-icons/react'

import LessonSidebar from './LessonSidebar'

// Единый горизонтальный отступ панели: у шапки и у содержимого он одинаковый
const PAD = '20px'

/**
 * Навигация по курсу на телефонах: слева — план курса, справа под большой
 * палец — переходы между уроками. Недоступные переходы просто не показываем.
 */
// Полупрозрачная подложка стрелок
const SURFACE = 'color-mix(in srgb, var(--dd-palette-background-surface) 78%, transparent)'

export default function LessonNavMobile({ course, activeSlug, accent, ink, prev, next }) {
    const [open, setOpen] = useState(false)

    const arrowSx = {
        '--IconButton-size': '46px',
        borderRadius: 0,
        // Полупрозрачная подложка с размытием: текст урока угадывается под кнопкой
        bgcolor: SURFACE,
        backdropFilter: 'blur(8px)',
        border: '1px solid',
        borderColor: 'page.border',
        color: 'text.secondary',
        // Небольшая тень, чтобы кнопка отрывалась от текста урока
        boxShadow: (theme) => theme.vars.palette.page.cardShadow,
        // На тач-экранах :hover «залипает» после тапа, поэтому по умолчанию
        // наведение ничего не меняет (перебиваем и фон Joy), а подсветка
        // включается только там, где есть мышь; на телефоне — отклик по касанию
        '&:hover': { bgcolor: SURFACE, color: 'text.secondary' },
        '@media (hover: hover)': {
            '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
        },
        '&:active': { bgcolor: 'background.level1', color: 'text.primary' },
    }

    return (
        <>
            <Box
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    position: 'fixed',
                    left: PAD,
                    right: PAD,
                    bottom: `calc(${PAD} + env(safe-area-inset-bottom))`,
                    zIndex: 1200,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pointerEvents: 'none',
                    '& > *': { pointerEvents: 'auto' },
                }}
            >
                <IconButton
                    onClick={() => setOpen(true)}
                    aria-label="План курса"
                    sx={{
                        '--IconButton-size': '50px',
                        borderRadius: 0,
                        bgcolor: accent.solid,
                        color: '#fff',
                        // Тень под цвет самой кнопки, не чёрная
                        boxShadow: `0 10px 22px -8px ${accent.solid}80`,
                        '&:hover': { bgcolor: accent.solid },
                        '@media (hover: hover)': {
                            '&:hover': { filter: 'brightness(1.1)' },
                        },
                        '&:active': { filter: 'brightness(1.1)' },
                    }}
                >
                    <ListIcon size={24} weight="bold" />
                </IconButton>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {prev && (
                        <IconButton
                            component={RouterLink}
                            to={`/course/${course.id}/${prev.slug}`}
                            aria-label="Предыдущий урок"
                            variant="plain"
                            sx={arrowSx}
                        >
                            <CaretLeftIcon size={22} weight="bold" />
                        </IconButton>
                    )}
                    {next && (
                        <IconButton
                            component={RouterLink}
                            to={`/course/${course.id}/${next.slug}`}
                            aria-label="Следующий урок"
                            variant="plain"
                            sx={arrowSx}
                        >
                            <CaretRightIcon size={22} weight="bold" />
                        </IconButton>
                    )}
                </Box>
            </Box>

            <Drawer
                anchor="bottom"
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{
                    content: {
                        sx: {
                            height: '82vh',
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            bgcolor: 'background.body',
                            display: 'flex',
                            flexDirection: 'column',
                        },
                    },
                }}
            >
                {/* Шапка панели: заголовок и кнопка закрытия на одной оси,
                    отступы по вертикали и горизонтали одинаковые */}
                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: PAD,
                        borderBottom: '1px solid',
                        borderColor: 'page.border',
                    }}
                >
                    <Typography
                        level="title-md"
                        sx={{ m: 0, fontFamily: 'display', fontWeight: 600, lineHeight: 1.2 }}
                    >
                        План курса
                    </Typography>

                    <IconButton
                        onClick={() => setOpen(false)}
                        aria-label="Закрыть"
                        variant="plain"
                        size="sm"
                        sx={{
                            flexShrink: 0,
                            borderRadius: 0,
                            bgcolor: 'background.level1',
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'background.level1', color: 'text.secondary' },
                            '@media (hover: hover)': {
                                '&:hover': { bgcolor: 'primary.softBg', color: 'text.primary' },
                            },
                            '&:active': { bgcolor: 'primary.softBg', color: 'text.primary' },
                        }}
                    >
                        <XIcon size={18} weight="bold" />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        px: PAD,
                        pt: PAD,
                        pb: `calc(32px + env(safe-area-inset-bottom))`,
                    }}
                >
                    <LessonSidebar
                        bare
                        course={course}
                        activeSlug={activeSlug}
                        accent={accent}
                        ink={ink}
                        onNavigate={() => setOpen(false)}
                    />
                </Box>
            </Drawer>
        </>
    )
}
