import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import IconButton from '@mui/joy/IconButton'
import Tooltip from '@mui/joy/Tooltip'
import { ArrowLeftIcon, CaretLeftIcon, GithubLogoIcon, InfoIcon } from '@phosphor-icons/react'
import { Link as RouterLink } from 'react-router-dom'

const linkSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    py: 1,
    fontSize: 'sm',
    textDecoration: 'none',
    color: 'text.secondary',
    transition: 'color 0.15s ease, padding-left 0.15s ease',
    '&:hover': { color: 'text.primary', pl: 0.75 },
}

/**
 * План курса. Без карточки-обёртки и обводки — только линейки, как в
 * оглавлении книги. `bare` — вариант для нижней панели на телефонах: там
 * кнопка возврата не нужна, «На главную» переезжает вниз к остальным ссылкам.
 */
export default function LessonSidebar({
    course,
    activeSlug,
    accent,
    ink,
    onNavigate,
    bare = false,
}) {
    const mark = ink || accent.solid

    return (
        <Box>
            {/* Шапка: кнопка возврата прижата к верхнему краю, не по центру */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    pb: 1.25,
                    borderBottom: '2px solid',
                    borderColor: 'page.rule',
                }}
            >
                {!bare && (
                    <Tooltip title="На главную" variant="soft" size="sm">
                        <IconButton
                            component={RouterLink}
                            to="/"
                            aria-label="На главную"
                            variant="plain"
                            size="sm"
                            sx={{
                                flexShrink: 0,
                                borderRadius: 0,
                                bgcolor: 'background.level1',
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'primary.softBg', color: 'text.primary' },
                            }}
                        >
                            <CaretLeftIcon size={20} weight="bold" />
                        </IconButton>
                    </Tooltip>
                )}

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        level="title-sm"
                        sx={{ fontFamily: 'display', fontWeight: 600, lineHeight: 1.3 }}
                    >
                        {course.title}
                    </Typography>
                </Box>
            </Box>

            <Box
                component="nav"
                aria-label="Уроки курса"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: bare ? 'none' : { md: 'calc(100vh - 260px)' },
                    overflowY: bare ? 'visible' : { md: 'auto' },
                }}
            >
                {course.pages.map((page, index) => {
                    const active = page.slug === activeSlug
                    return (
                        <Box
                            key={page.slug}
                            component={RouterLink}
                            to={`/course/${course.id}/${page.slug}`}
                            onClick={onNavigate}
                            aria-current={active ? 'page' : undefined}
                            sx={{
                                display: 'flex',
                                gap: 1.5,
                                alignItems: 'baseline',
                                py: 1.15,
                                borderBottom: '1px solid',
                                borderColor: 'page.border',
                                textDecoration: 'none',
                                fontSize: 'sm',
                                lineHeight: 1.45,
                                color: active ? 'text.primary' : 'text.secondary',
                                fontWeight: active ? 600 : 400,
                                transition: 'color 0.15s ease, padding-left 0.15s ease',
                                '&:hover': { color: 'text.primary', pl: 0.75 },
                            }}
                        >
                            <Box
                                aria-hidden
                                sx={{
                                    fontFamily: 'code',
                                    fontSize: '11px',
                                    minWidth: 22,
                                    color: active ? mark : 'text.tertiary',
                                }}
                            >
                                {String(index + 1).padStart(2, '0')}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>{page.short}</Box>
                            {active && (
                                <Box
                                    aria-hidden
                                    sx={{
                                        flexShrink: 0,
                                        width: 6,
                                        height: 6,
                                        borderRadius: 0,
                                        bgcolor: mark,
                                    }}
                                />
                            )}
                        </Box>
                    )
                })}
            </Box>

            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column' }}>
                <Box component={RouterLink} to={`/course/${course.id}`} onClick={onNavigate} sx={linkSx}>
                    <InfoIcon size={20} />
                    О курсе
                </Box>

                {bare && (
                    <Box component={RouterLink} to="/" onClick={onNavigate} sx={linkSx}>
                        <ArrowLeftIcon size={20} />
                        На главную
                    </Box>
                )}

                {course.github && (
                    <Box component="a" href={course.github} target="_blank" rel="noreferrer" sx={linkSx}>
                        <GithubLogoIcon size={20} />
                        Исходники на GitHub
                    </Box>
                )}
            </Box>
        </Box>
    )
}
