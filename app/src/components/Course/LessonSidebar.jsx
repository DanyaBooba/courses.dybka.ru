import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import { Link as RouterLink } from 'react-router-dom'

const linkSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    px: 1.25,
    py: 1,
    borderRadius: 'sm',
    fontSize: 'sm',
    textDecoration: 'none',
    color: 'text.secondary',
    transition: 'background-color 0.18s ease, color 0.18s ease',
    '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
}

export default function LessonSidebar({ course, activeSlug, accent, onNavigate }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 'lg',
                bgcolor: 'background.surface',
                border: '1px solid',
                borderColor: 'page.border',
                boxShadow: (theme) => theme.vars.palette.page.cardShadow,
            }}
        >
            <Box sx={{ px: 1, pb: 1.5 }}>
                <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                    {course.title}
                </Typography>
                <Typography level="body-xs" sx={{ mt: 0.25, color: 'text.tertiary' }}>
                    {course.duration}
                </Typography>
            </Box>

            <Box
                component="nav"
                aria-label="Уроки курса"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                    maxHeight: { md: 'calc(100vh - 300px)' },
                    overflowY: { md: 'auto' },
                    pr: 0.5,
                }}
            >
                {course.pages.map((page, index) => {
                    const active = page.slug === activeSlug
                    const isEnd = page.slug === 'end'
                    return (
                        <Box
                            key={page.slug}
                            component={RouterLink}
                            to={`/course/${course.id}/${page.slug}`}
                            onClick={onNavigate}
                            aria-current={active ? 'page' : undefined}
                            sx={{
                                display: 'flex',
                                gap: 1.25,
                                alignItems: 'stretch',
                                pr: 1.25,
                                py: 1,
                                borderRadius: 'sm',
                                textDecoration: 'none',
                                fontSize: 'sm',
                                lineHeight: 1.45,
                                color: active ? 'text.primary' : 'text.secondary',
                                bgcolor: active ? 'background.level1' : 'transparent',
                                fontWeight: active ? 700 : 400,
                                transition: 'background-color 0.18s ease, color 0.18s ease',
                                '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
                            }}
                        >
                            <Box
                                aria-hidden
                                sx={{
                                    flexShrink: 0,
                                    width: '3px',
                                    ml: 0.75,
                                    borderRadius: '999px',
                                    bgcolor: active ? accent.solid : 'transparent',
                                }}
                            />
                            <Box
                                aria-hidden
                                sx={{
                                    fontSize: 'xs',
                                    minWidth: 16,
                                    color: active ? accent.solid : 'text.tertiary',
                                    fontWeight: 700,
                                }}
                            >
                                {isEnd ? '★' : index + 1}
                            </Box>
                            <Box>{page.short}</Box>
                        </Box>
                    )
                })}
            </Box>

            <Box
                sx={{
                    mt: 1.5,
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'page.border',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                }}
            >
                <Box
                    component={RouterLink}
                    to={`/course/${course.id}`}
                    onClick={onNavigate}
                    sx={linkSx}
                >
                    <Box aria-hidden sx={{ opacity: 0.7 }}>
                        ℹ
                    </Box>
                    О курсе
                </Box>

                <Box component={RouterLink} to="/" onClick={onNavigate} sx={linkSx}>
                    <Box aria-hidden sx={{ opacity: 0.7 }}>
                        ←
                    </Box>
                    На главную
                </Box>

                {course.github && (
                    <Box
                        component="a"
                        href={course.github}
                        target="_blank"
                        rel="noreferrer"
                        sx={linkSx}
                    >
                        <Box aria-hidden sx={{ opacity: 0.7 }}>
                            ↗
                        </Box>
                        Исходники на GitHub
                    </Box>
                )}
            </Box>
        </Box>
    )
}
