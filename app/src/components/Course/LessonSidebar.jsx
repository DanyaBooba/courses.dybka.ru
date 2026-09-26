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
    px: 1.25,
    py: 1,
    borderRadius: 'sm',
    fontSize: 'sm',
    textDecoration: 'none',
    color: 'text.secondary',
    transition: 'background-color 0.18s ease, color 0.18s ease',
    '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
}

/**
 * Список уроков курса. `bare` — вариант для нижней панели на телефонах:
 * без карточки-обёртки и без круглой кнопки возврата в шапке (ссылка
 * «На главную» переезжает вниз, к остальным ссылкам).
 */
export default function LessonSidebar({
    course,
    activeSlug,
    accent,
    onNavigate,
    bare = false,
}) {
    const wrapperSx = bare
        ? {}
        : {
              p: 2,
              borderRadius: 'lg',
              bgcolor: 'background.surface',
              border: '1px solid',
              borderColor: 'page.border',
              boxShadow: (theme) => theme.vars.palette.page.cardShadow,
          }

    return (
        <Box sx={wrapperSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: bare ? 0 : 1, pb: 1.5 }}>
                {!bare && (
                    <Tooltip title="На главную" variant="soft" size="sm">
                        <IconButton
                            component={RouterLink}
                            to="/"
                            aria-label="На главную"
                            variant="outlined"
                            color="neutral"
                            size="sm"
                            sx={{ borderRadius: '999px', flexShrink: 0, borderColor: 'page.border' }}
                        >
                            <CaretLeftIcon size={22} weight="bold" />
                        </IconButton>
                    </Tooltip>
                )}

                <Box sx={{ minWidth: 0 }}>
                    <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                        {course.title}
                    </Typography>
                    <Typography level="body-xs" sx={{ mt: 0.25, color: 'text.tertiary' }}>
                        {course.pages.length} уроков
                    </Typography>
                </Box>
            </Box>

            <Box
                component="nav"
                aria-label="Уроки курса"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                    maxHeight: bare ? 'none' : { md: 'calc(100vh - 300px)' },
                    overflowY: bare ? 'visible' : { md: 'auto' },
                    pr: 0.5,
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
                                {index + 1}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>{page.short}</Box>
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
                <Box component={RouterLink} to={`/course/${course.id}`} onClick={onNavigate} sx={linkSx}>
                    <InfoIcon size={22} />
                    О курсе
                </Box>

                {bare && (
                    <Box component={RouterLink} to="/" onClick={onNavigate} sx={linkSx}>
                        <ArrowLeftIcon size={22} />
                        На главную
                    </Box>
                )}

                {course.github && (
                    <Box component="a" href={course.github} target="_blank" rel="noreferrer" sx={linkSx}>
                        <GithubLogoIcon size={22} />
                        Исходники на GitHub
                    </Box>
                )}
            </Box>
        </Box>
    )
}
