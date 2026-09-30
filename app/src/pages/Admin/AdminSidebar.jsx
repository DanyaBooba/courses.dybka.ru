import { useState } from 'react'
import { Link as RouterLink, useMatch, useNavigate } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'
import {
    ArrowSquareOutIcon,
    EyeSlashIcon,
    FlagIcon,
    HourglassIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    SidebarSimpleIcon,
    SignOutIcon,
    UsersIcon,
} from '@phosphor-icons/react'

import { createLesson, deleteLesson, hasUnsaved, moveLesson, useAdminCourse, useAdminCourses } from '../../admin/store'
import LessonMenu from './LessonMenu'
import { setChromeHidden } from '../../admin/chrome'
import { useAdminUsers } from '../../admin/users'
import useDragSort, { dragSx } from '../../admin/useDragSort'
import Bone from '../../components/Ui/Bone'
import { groupBySection } from '../../data/sections'
import { FINAL_SLUG, getLessons, getLessonTitle } from '../../data/courses'
import { lessonsLabel } from '../../data/plural'
import { getAccent } from '../../theme/accents'
import { ACCESS, useProfile } from '../../api/courses'
import { setToken } from '../../auth/session'

const captionSx = {
    fontFamily: 'code',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'text.tertiary',
}

/**
 * Левая панель: все программы по разделам, у открытой — её уроки.
 * Отсюда же создаются новая программа и новый урок.
 */
export default function AdminSidebar() {
    const { courses = [], loading, error, reload } = useAdminCourses()
    const navigate = useNavigate()
    const { user } = useProfile()
    const [query, setQuery] = useState('')
    const admin = Boolean(user) && user.access >= ACCESS.ADMIN
    // Сколько новых пользователей ждут доступа — счётчик у «Пользователей»
    const { users = [] } = useAdminUsers()
    const waiting = users.filter((item) => item.access === ACCESS.NONE).length
    const usersMatch = useMatch('/admin/users')

    const courseMatch = useMatch('/admin/course/:id/*')
    const lessonMatch = useMatch('/admin/course/:id/lesson/:slug')
    const activeId = courseMatch?.params.id
    const activeSlug = lessonMatch?.params.slug
    // Урок добавляется в загруженную программу — до загрузки кнопка неактивна
    const { course: activeCourse } = useAdminCourse(activeId)

    // Уроки открытой программы перетаскиваются мышью. Номер урока — его адрес:
    // если открытый урок сменил номер, переходим на новый адрес
    const activePages = activeCourse?.pages ?? []
    const activeLessons = getLessons(activeCourse)
    const follow = (renamed) => {
        if (renamed[activeSlug]) navigate(`/admin/course/${activeId}/lesson/${renamed[activeSlug]}`, { replace: true })
    }
    const sort = useDragSort(activePages.length, activeLessons.length, (from, to) =>
        follow(moveLesson(activeId, activePages[from].slug, to)),
    )

    const removeLesson = (page) => {
        if (!window.confirm(`Удалить урок «${getLessonTitle(page)}»?`)) return
        const renamed = deleteLesson(activeId, page.slug)
        // Удалили открытый урок — возвращаемся на страницу программы
        if (page.slug === activeSlug) navigate(`/admin/course/${activeId}`, { replace: true })
        else follow(renamed)
    }

    const needle = query.trim().toLowerCase()
    const found = needle
        ? courses.filter((course) => `${course.title} ${course.id} ${course.chips.join(' ')}`.toLowerCase().includes(needle))
        : courses
    const sections = groupBySection(found)

    const addLesson = (courseId) => {
        const slug = createLesson(courseId)
        if (slug) navigate(`/admin/course/${courseId}/lesson/${slug}`)
    }

    return (
        <Box
            component="nav"
            aria-label="Программы"
            sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
        >
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 28 }}>
                    <Typography component={RouterLink} to="/admin" sx={{ ...captionSx, textDecoration: 'none', color: 'text.primary', fontWeight: 600 }}>
                        courses.dybka.ru
                    </Typography>
                    {/* На телефоне меню и так прячется внутри программы */}
                    <Tooltip title="Скрыть меню" size="sm" variant="soft">
                        <IconButton
                            size="sm"
                            color="neutral"
                            onClick={() => setChromeHidden('sidebar', true)}
                            aria-label="Скрыть меню"
                            sx={{ display: { xs: 'none', md: 'inline-flex' }, mr: -1, color: 'text.tertiary' }}
                        >
                            <SidebarSimpleIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography level="h3" sx={{ mt: 0.5, fontWeight: 500, letterSpacing: '-0.02em' }}>
                    Панель управления
                </Typography>

                <Button
                    component={RouterLink}
                    to="/admin/new"
                    startDecorator={<PlusIcon weight="bold" />}
                    sx={{ mt: 2, width: '100%', fontWeight: 700 }}
                >
                    Новая программа
                </Button>

                {admin && (
                    <Button
                        component={RouterLink}
                        to="/admin/users"
                        variant={usersMatch ? 'soft' : 'outlined'}
                        color="neutral"
                        startDecorator={<UsersIcon />}
                        endDecorator={
                            waiting > 0 && (
                                <Box
                                    component="span"
                                    title="Ждут доступа"
                                    sx={{ px: 0.75, minWidth: 20, fontSize: '11px', fontWeight: 700, lineHeight: '20px', textAlign: 'center', bgcolor: 'warning.solidBg', color: 'warning.solidColor' }}
                                >
                                    {waiting}
                                </Box>
                            )
                        }
                        sx={{ mt: 1, width: '100%', fontWeight: 500, justifyContent: 'flex-start', '& .MuiButton-endDecorator': { ml: 'auto' }, borderColor: 'page.border', bgcolor: usersMatch ? undefined : 'background.body' }}
                    >
                        Пользователи
                    </Button>
                )}

                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Найти программу"
                    startDecorator={<MagnifyingGlassIcon />}
                    size="sm"
                    sx={{ mt: 1.5, boxShadow: 'none', bgcolor: 'background.body' }}
                />
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, pb: 2 }}>
                {loading && !courses.length && (
                    <Box aria-busy sx={{ px: 1, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {Array.from({ length: 6 }, (_, index) => (
                            <Bone key={index} height={36} />
                        ))}
                    </Box>
                )}

                {error && !courses.length && (
                    <Box sx={{ px: 1, py: 2 }}>
                        <Typography sx={{ fontSize: 'sm', color: 'text.secondary' }}>{error.message}</Typography>
                        <Button size="sm" variant="outlined" color="neutral" onClick={reload} sx={{ mt: 1 }}>
                            Повторить
                        </Button>
                    </Box>
                )}

                {!loading && !error && sections.length === 0 && (
                    <Typography sx={{ px: 1, py: 2, fontSize: 'sm', color: 'text.tertiary' }}>Ничего не нашлось</Typography>
                )}

                {sections.map((section) => (
                    <Box key={section.id} component="section" sx={{ mt: 1.5 }}>
                        <Typography sx={{ ...captionSx, px: 1, py: 1 }}>{section.title}</Typography>

                        {section.courses.map((course) => {
                            const active = course.id === activeId
                            const accent = getAccent(course.accent)
                            const lessons = getLessons(course)

                            return (
                                <Box key={course.id}>
                                    <Box
                                        component={RouterLink}
                                        to={`/admin/course/${course.id}`}
                                        aria-current={active && !activeSlug ? 'page' : undefined}
                                        sx={{
                                            display: 'flex',
                                            gap: 1.25,
                                            px: 1,
                                            py: 1,
                                            textDecoration: 'none',
                                            color: 'text.primary',
                                            bgcolor: active ? 'background.level1' : 'transparent',
                                            '&:hover': { bgcolor: 'background.level1' },
                                        }}
                                    >
                                        <Box aria-hidden sx={{ width: 4, flexShrink: 0, alignSelf: 'stretch', bgcolor: accent.solid }} />
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: 'sm',
                                                    fontWeight: active ? 600 : 500,
                                                    lineHeight: 1.35,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {course.title || 'Без названия'}
                                            </Typography>
                                            <Typography sx={{ mt: 0.25, fontSize: 'xs', color: 'text.tertiary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                {lessonsLabel(lessons.length)}
                                                {course.disabled && course.reviewRequestedAt && (
                                                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'warning.plainColor' }}>
                                                        <span>·</span>
                                                        <HourglassIcon size={12} />
                                                        на проверке
                                                    </Box>
                                                )}
                                                {course.disabled && !course.reviewRequestedAt && (
                                                    <>
                                                        <span>·</span>
                                                        <EyeSlashIcon size={12} />
                                                        скрыта
                                                    </>
                                                )}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {active && (
                                        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, pl: 2.25, pb: 1 }}>
                                            {course.pages.map((page, index) => {
                                                const current = page.slug === activeSlug
                                                const number = lessons.indexOf(page) + 1
                                                return (
                                                    <Box
                                                        component="li"
                                                        key={page.slug}
                                                        {...(activeCourse ? sort.itemProps(index) : {})}
                                                        sx={{
                                                            ...dragSx(sort.dropLine(index), sort.dragging(index), accent.solid),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            '& .lesson-menu': { opacity: { xs: 1, md: 0 }, transition: 'opacity 0.15s ease' },
                                                            '&:hover .lesson-menu, &:focus-within .lesson-menu, & .lesson-menu[aria-expanded="true"]': { opacity: 1 },
                                                        }}
                                                    >
                                                        <Box
                                                            component={RouterLink}
                                                            to={`/admin/course/${course.id}/lesson/${page.slug}`}
                                                            aria-current={current ? 'page' : undefined}
                                                            sx={{
                                                                flex: 1,
                                                                minWidth: 0,
                                                                display: 'flex',
                                                                alignItems: 'baseline',
                                                                gap: 1,
                                                                px: 1,
                                                                py: 0.625,
                                                                fontSize: 'sm',
                                                                lineHeight: 1.4,
                                                                textDecoration: 'none',
                                                                color: current ? 'text.primary' : 'text.secondary',
                                                                fontWeight: current ? 600 : 400,
                                                                borderLeft: '2px solid',
                                                                borderColor: current ? accent.solid : 'page.border',
                                                                '&:hover': { color: 'text.primary' },
                                                            }}
                                                        >
                                                            <Box component="span" sx={{ fontFamily: 'code', fontSize: '11px', color: 'text.tertiary', minWidth: 18 }}>
                                                                {page.slug === FINAL_SLUG ? <FlagIcon size={11} weight="fill" /> : String(number).padStart(2, '0')}
                                                            </Box>
                                                            <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                                                                {getLessonTitle(page)}
                                                            </Box>
                                                        </Box>
                                                        {activeCourse && (
                                                            <LessonMenu
                                                                className="lesson-menu"
                                                                title={getLessonTitle(page)}
                                                                canUp={page.slug !== FINAL_SLUG && index > 0}
                                                                canDown={page.slug !== FINAL_SLUG && index < activeLessons.length - 1}
                                                                onMove={(step) => follow(moveLesson(activeId, page.slug, index + step))}
                                                                onRemove={() => removeLesson(page)}
                                                            />
                                                        )}
                                                    </Box>
                                                )
                                            })}
                                            <Box component="li">
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    color="neutral"
                                                    startDecorator={<PlusIcon />}
                                                    onClick={() => addLesson(course.id)}
                                                    disabled={!activeCourse}
                                                    sx={{ mt: 0.5, fontWeight: 500, color: 'text.tertiary', '&:hover': { color: 'text.primary' } }}
                                                >
                                                    Новый урок
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )
                        })}
                    </Box>
                ))}
            </Box>

            <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'page.border' }}>
                {user && (
                    <Typography sx={{ fontFamily: 'code', fontSize: '12px', color: 'text.secondary', overflowWrap: 'anywhere' }}>
                        {user.email}
                    </Typography>
                )}
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, ml: -1 }}>
                    <Button
                        component={RouterLink}
                        to="/"
                        target="_blank"
                        size="sm"
                        variant="plain"
                        color="neutral"
                        startDecorator={<ArrowSquareOutIcon />}
                        sx={{ fontWeight: 500 }}
                    >
                        На сайт
                    </Button>
                    <Button
                        size="sm"
                        variant="plain"
                        color="neutral"
                        startDecorator={<SignOutIcon />}
                        onClick={() => {
                            // Без токена сервер не примет несохранённые правки
                            if (hasUnsaved() && !window.confirm('Есть несохранённые правки — после выхода они пропадут. Выйти?')) return
                            setToken(null)
                        }}
                        sx={{ fontWeight: 500 }}
                    >
                        Выйти
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
