import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import Drawer from '@mui/joy/Drawer'
import ModalClose from '@mui/joy/ModalClose'
import DialogTitle from '@mui/joy/DialogTitle'

import LessonSidebar from './LessonSidebar'

/**
 * Плавающая навигация по курсу для телефонов: предыдущий урок,
 * план курса и следующий урок. Закреплена справа внизу экрана.
 */
export default function LessonNavMobile({ course, activeSlug, accent, prev, next }) {
    const [open, setOpen] = useState(false)

    const arrowSx = {
        '--IconButton-size': '44px',
        borderRadius: '999px',
        color: 'text.secondary',
        '&:hover': { color: 'text.primary' },
    }

    return (
        <>
            <Box
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    position: 'fixed',
                    right: 16,
                    bottom: 'calc(16px + env(safe-area-inset-bottom))',
                    zIndex: 1200,
                    alignItems: 'center',
                    gap: 0.5,
                    p: 0.5,
                    borderRadius: '999px',
                    bgcolor: 'background.surface',
                    border: '1px solid',
                    borderColor: 'page.border',
                    boxShadow: (theme) => theme.vars.palette.page.cardShadowHover,
                    backdropFilter: 'blur(12px)',
                }}
            >
                <IconButton
                    component={prev ? RouterLink : 'button'}
                    to={prev ? `/course/${course.id}/${prev.slug}` : undefined}
                    disabled={!prev}
                    aria-label="Предыдущий урок"
                    variant="plain"
                    sx={arrowSx}
                >
                    ←
                </IconButton>

                <IconButton
                    onClick={() => setOpen(true)}
                    aria-label="План курса"
                    variant="solid"
                    sx={{
                        '--IconButton-size': '48px',
                        borderRadius: '999px',
                        bgcolor: accent.solid,
                        color: '#fff',
                        fontSize: '18px',
                        '&:hover': { bgcolor: accent.solid, filter: 'brightness(0.93)' },
                    }}
                >
                    ☰
                </IconButton>

                <IconButton
                    component={next ? RouterLink : 'button'}
                    to={next ? `/course/${course.id}/${next.slug}` : undefined}
                    disabled={!next}
                    aria-label="Следующий урок"
                    variant="plain"
                    sx={arrowSx}
                >
                    →
                </IconButton>
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
                <Box sx={{ p: 2, pb: 4, overflowY: 'auto' }}>
                    <LessonSidebar
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
