import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import Drawer from '@mui/joy/Drawer'
import ModalClose from '@mui/joy/ModalClose'
import DialogTitle from '@mui/joy/DialogTitle'
import { CaretLeftIcon, CaretRightIcon, ListIcon } from '@phosphor-icons/react'

import LessonSidebar from './LessonSidebar'

/**
 * Навигация по курсу на телефонах: слева — план курса, справа под большой
 * палец — переходы между уроками. Недоступные переходы просто не показываем.
 */
export default function LessonNavMobile({ course, activeSlug, accent, prev, next }) {
    const [open, setOpen] = useState(false)

    const arrowSx = {
        '--IconButton-size': '46px',
        borderRadius: '999px',
        bgcolor: 'background.surface',
        border: '1px solid',
        borderColor: 'page.border',
        color: 'text.secondary',
        boxShadow: (theme) => theme.vars.palette.page.cardShadow,
        '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
    }

    return (
        <>
            <Box
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    position: 'fixed',
                    left: 16,
                    right: 16,
                    bottom: 'calc(16px + env(safe-area-inset-bottom))',
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
                        '--IconButton-size': '52px',
                        borderRadius: '999px',
                        bgcolor: accent.solid,
                        color: '#fff',
                        boxShadow: (theme) => theme.vars.palette.page.cardShadowHover,
                        '&:hover': { bgcolor: accent.solid, filter: 'brightness(0.93)' },
                    }}
                >
                    <ListIcon size={26} weight="bold" />
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
                            <CaretLeftIcon size={24} weight="bold" />
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
                            <CaretRightIcon size={24} weight="bold" />
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
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            bgcolor: 'background.body',
                        },
                    },
                }}
            >
                <ModalClose />
                <DialogTitle sx={{ px: 2.5, pt: 2.5 }}>План курса</DialogTitle>
                <Box sx={{ px: 2.5, pb: 4, overflowY: 'auto' }}>
                    <LessonSidebar
                        bare
                        course={course}
                        activeSlug={activeSlug}
                        accent={accent}
                        onNavigate={() => setOpen(false)}
                    />
                </Box>
            </Drawer>
        </>
    )
}
