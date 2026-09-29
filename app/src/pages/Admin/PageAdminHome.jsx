import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'
import { BookOpenTextIcon, CaretRightIcon, EyeIcon, EyeSlashIcon, HourglassIcon, PlusIcon } from '@phosphor-icons/react'

import AdminTopBar from './AdminTopBar'
import LoadError from '../../components/Ui/LoadError'
import Bone from '../../components/Ui/Bone'
import { useAdminCourses, useCanPublish } from '../../admin/store'
import { getLessons } from '../../data/courses'
import { lessonsLabel } from '../../data/plural'
import { formatDate } from '../../admin/dates'
import sections from '../../data/sections'
import { getAccent } from '../../theme/accents'
import useScheme from '../../theme/useScheme'

const captionSx = {
    fontFamily: 'code',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'text.tertiary',
}

/** Главная панели: сводка и все программы плашками их цвета. */
export default function PageAdminHome() {
    const { courses = [], loading, error, reload } = useAdminCourses()
    const scheme = useScheme()
    const canPublish = useCanPublish()
    // Курсы авторов, которые ждут публикации, — администратору наверх
    const awaiting = canPublish ? courses.filter((course) => course.disabled && course.reviewRequestedAt) : []

    useEffect(() => {
        document.title = 'Панель управления — courses.dybka.ru'
    }, [])

    const lessons = courses.reduce((sum, course) => sum + getLessons(course).length, 0)
    const hidden = courses.filter((course) => course.disabled).length
    const views = courses.reduce((sum, course) => sum + (course.views ?? 0), 0)

    const facts = [
        { label: 'Программ', value: courses.length },
        { label: 'Уроков', value: lessons },
        { label: 'Открыто читателям', value: courses.length - hidden },
        { label: 'Просмотров', value: views },
    ]

    return (
        <>
            <AdminTopBar crumbs={[{ label: 'Программы' }]}>
                <Button component={RouterLink} to="/admin/new" size="sm" startDecorator={<PlusIcon weight="bold" />}>
                    Новая программа
                </Button>
            </AdminTopBar>

            <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 }, maxWidth: 1200 }}>
                <Typography level="h1" sx={{ fontWeight: 450, letterSpacing: '-0.03em', fontSize: { xs: '34px', md: '46px' } }}>
                    Программы
                </Typography>
                <Typography sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.65 }}>
                    Выберите программу, чтобы поправить <nobr>её страницу</nobr>, уроки и настройки.
                </Typography>

                <Box
                    component="dl"
                    sx={{
                        m: 0,
                        mt: 4,
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                        borderTop: '1px solid',
                        borderColor: 'page.border',
                    }}
                >
                    {facts.map((fact) => (
                        <Box key={fact.label} sx={{ py: 2, pr: 2 }}>
                            <Box component="dt" sx={captionSx}>
                                {fact.label}
                            </Box>
                            <Box component="dd" sx={{ m: 0, mt: 0.75, fontFamily: 'display', fontSize: '28px', lineHeight: 1.1 }}>
                                {fact.value}
                            </Box>
                        </Box>
                    ))}
                </Box>

                {awaiting.length > 0 && (
                    <Box component="section" sx={{ mt: 5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pb: 1, borderBottom: '2px solid', borderColor: 'warning.plainColor' }}>
                            <Typography level="h3" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HourglassIcon size={22} />
                                Ждут проверки
                            </Typography>
                            <Box component="span" sx={captionSx}>
                                {awaiting.length} шт.
                            </Box>
                        </Box>
                        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                            {awaiting.map((course) => (
                                <Box component="li" key={course.id} sx={{ borderBottom: '1px solid', borderColor: 'page.border' }}>
                                    <Box
                                        component={RouterLink}
                                        to={`/admin/course/${course.id}`}
                                        sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', color: 'text.primary', '&:hover': { bgcolor: 'background.level1' } }}
                                    >
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 600 }}>{course.title || 'Без названия'}</Typography>
                                            <Typography sx={{ fontSize: 'sm', color: 'text.tertiary' }}>
                                                {course.author?.name || course.author?.email || 'Автор не указан'} · отправлен {formatDate(course.reviewRequestedAt)}
                                            </Typography>
                                        </Box>
                                        <CaretRightIcon size={16} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {loading && !courses.length && (
                    <Box aria-busy sx={{ mt: 5, display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                        {Array.from({ length: 4 }, (_, index) => (
                            <Bone key={index} height={116} />
                        ))}
                    </Box>
                )}

                {error && !courses.length && <LoadError error={error} onRetry={reload} sx={{ mt: 5 }} />}

                {sections.map((section) => {
                    const items = courses.filter((course) => course.section === section.id)
                    if (!items.length) return null

                    return (
                        <Box key={section.id} component="section" sx={{ mt: 5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pb: 1, borderBottom: '2px solid', borderColor: 'page.rule' }}>
                                <Typography level="h3" sx={{ fontWeight: 500 }}>
                                    {section.title}
                                </Typography>
                                <Box component="span" sx={captionSx}>
                                    {items.length} шт.
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    mt: 2,
                                    display: 'grid',
                                    gap: 1.5,
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                                }}
                            >
                                {items.map((course) => {
                                    const accent = getAccent(course.accent)
                                    const skin = accent[scheme] || accent.light
                                    return (
                                        <Box
                                            key={course.id}
                                            component={RouterLink}
                                            to={`/admin/course/${course.id}`}
                                            sx={{
                                                p: 2.25,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                textDecoration: 'none',
                                                bgcolor: skin.bg,
                                                color: skin.text,
                                                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                                                '&:hover': { boxShadow: skin.shadow, transform: 'translateY(-2px)' },
                                            }}
                                        >
                                            <Box sx={{ ...captionSx, color: skin.text, opacity: 0.7, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                                <span>{course.chips.slice(0, 3).join(' / ') || course.id}</span>
                                                {course.disabled && (
                                                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                                        {course.reviewRequestedAt ? <HourglassIcon size={12} weight="bold" /> : <EyeSlashIcon size={12} weight="bold" />}
                                                        {course.reviewRequestedAt ? 'На проверке' : 'Скрыта'}
                                                    </Box>
                                                )}
                                            </Box>
                                            <Typography level="title-lg" sx={{ fontFamily: 'display', fontWeight: 600, color: skin.text, lineHeight: 1.25 }}>
                                                {course.title || 'Без названия'}
                                            </Typography>
                                            <Typography sx={{ mt: 'auto', pt: 1, ...captionSx, color: skin.text, opacity: 0.7, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                                                    <span>{lessonsLabel(getLessons(course).length)}</span>
                                                    <Box component="span" title="Читатели" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                                        <BookOpenTextIcon size={12} weight="bold" />
                                                        {course.readers ?? 0}
                                                    </Box>
                                                    <Box component="span" title="Просмотры" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                                        <EyeIcon size={12} weight="bold" />
                                                        {course.views ?? 0}
                                                    </Box>
                                                </Box>
                                                {course.updatedAt && (
                                                    <Box component="time" dateTime={course.updatedAt} title="Дата изменения" sx={{ flexShrink: 0 }}>
                                                        {formatDate(course.updatedAt)}
                                                    </Box>
                                                )}
                                            </Typography>
                                        </Box>
                                    )
                                })}
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </>
    )
}
