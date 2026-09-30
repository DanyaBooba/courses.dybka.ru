import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'
import Tab from '@mui/joy/Tab'
import TabList from '@mui/joy/TabList'
import Tabs from '@mui/joy/Tabs'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'
import {
    ArrowDownIcon,
    ArrowSquareOutIcon,
    ArrowUpIcon,
    DotsSixVerticalIcon,
    FlagIcon,
    PlusIcon,
    TrashIcon,
} from '@phosphor-icons/react'

import AdminTopBar from './AdminTopBar'
import AdminState from './AdminState'
import SaveStatus from './SaveStatus'
import CourseForm from './CourseForm'
import CourseStatus from './CourseStatus'
import { notify } from '../../admin/notices'
import AutoTextarea from '../../admin/editor/AutoTextarea'
import BlockEditor from '../../admin/editor/BlockEditor'
import CoverDrop from '../../admin/editor/CoverDrop'
import Difficulty from '../../components/Course/Difficulty'
import {
    createLesson,
    deleteCourse,
    deleteLesson,
    moveLesson,
    setCourseDate,
    updateCourse,
    useAdminCourse,
    useCanPublish,
} from '../../admin/store'
import useDragSort, { dragSx } from '../../admin/useDragSort'
import { FINAL_SLUG, getLessons, getLessonTitle } from '../../data/courses'
import { lessonsLabel } from '../../data/plural'
import { readersLabel, viewsLabel } from '../../api/views'
import { formatDate } from '../../admin/dates'
import { getAccent, getInk } from '../../theme/accents'
import useScheme from '../../theme/useScheme'

const captionSx = {
    fontFamily: 'code',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
}

/**
 * Программа в панели управления. Вкладка «Страница курса» — это страница
 * курса как на сайте: название и описание правятся прямо в шапке, «О курсе» —
 * тем же редактором блоков, что уроки, справа — программа уроков.
 * Вкладка «Настройки» — всё остальное, с живой карточкой каталога.
 */
export default function PageAdminCourse() {
    const { id } = useParams()
    const { course, loading, error, reload, save, saveError } = useAdminCourse(id)
    const navigate = useNavigate()
    const [search, setSearch] = useSearchParams()
    const [removing, setRemoving] = useState(false)
    const canPublish = useCanPublish()
    const tab = search.get('tab') === 'settings' ? 'settings' : 'page'

    useEffect(() => {
        if (course) document.title = `${course.title || 'Программа'} — панель управления`
    }, [course])

    if (!course) {
        return (
            <AdminState
                loading={loading}
                error={error}
                onRetry={reload}
                notFound={{ title: 'Такой программы нет', text: 'Возможно, её удалили. Выберите другую слева.' }}
            />
        )
    }

    const set = (change) => updateCourse(course.id, change)

    const remove = async () => {
        if (!window.confirm(`Удалить программу «${course.title || course.id}» со всеми уроками? Это не отменить.`)) return
        setRemoving(true)
        try {
            await deleteCourse(course.id)
            navigate('/admin', { replace: true })
        } catch (removeError) {
            notify(removeError.message)
            setRemoving(false)
        }
    }

    return (
        <>
            <AdminTopBar crumbs={[{ label: 'Программы', to: '/admin' }, { label: course.title || 'Без названия' }]}>
                <SaveStatus courseId={course.id} save={save} error={saveError} />
                <CourseStatus course={course} set={set} canPublish={canPublish} />
                <Tooltip title="Открыть на сайте" size="sm" variant="soft">
                    <IconButton component="a" href={`/course/${course.id}`} target="_blank" size="sm" color="neutral" aria-label="Открыть на сайте">
                        <ArrowSquareOutIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Удалить программу" size="sm" variant="soft">
                    <IconButton size="sm" color="danger" onClick={remove} loading={removing} aria-label="Удалить программу">
                        <TrashIcon />
                    </IconButton>
                </Tooltip>
            </AdminTopBar>

            <Tabs
                value={tab}
                onChange={(_, value) => setSearch(value === 'settings' ? { tab: 'settings' } : {}, { replace: true })}
                sx={{ bgcolor: 'transparent' }}
            >
                <TabList
                    sx={{
                        px: { xs: 2, md: 3 },
                        bgcolor: 'transparent',
                        // У активной вкладки — черта полного цвета, у остальных — бледная
                        '--Tab-indicatorThickness': '2px',
                        '--Tab-indicatorColor': 'var(--dd-palette-text-primary)',
                        '& .MuiTab-root': {
                            py: 1.25,
                            fontWeight: 500,
                            bgcolor: 'transparent',
                            color: 'text.tertiary',
                            boxShadow: 'inset 0 -2px 0 var(--dd-palette-page-border)',
                        },
                        '& .MuiTab-root:hover': {
                            bgcolor: 'transparent',
                            color: 'text.primary',
                            boxShadow: 'inset 0 -2px 0 var(--dd-palette-text-tertiary)',
                        },
                        '& .MuiTab-root.Mui-selected': { bgcolor: 'transparent', color: 'text.primary' },
                    }}
                >
                    <Tab value="page">
                        Страница курса
                    </Tab>
                    <Tab value="settings">Настройки</Tab>
                </TabList>
            </Tabs>

            {tab === 'settings' ? (
                <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 4 }, maxWidth: 1200 }}>
                    <CourseForm course={course} onChange={(next) => set(next)} canPublish={canPublish} onDateChange={(date) => setCourseDate(course.id, date)} />
                </Box>
            ) : (
                <CoursePageEditor course={course} set={set} />
            )}
        </>
    )
}

/** Страница курса в дизайне сайта, но с полями вместо текста. */
function CoursePageEditor({ course, set }) {
    const scheme = useScheme()
    const navigate = useNavigate()
    const accent = getAccent(course.accent)
    const skin = accent[scheme] || accent.light
    const ink = getInk(accent, scheme)
    const lessons = getLessons(course)
    // Итоговая страница всегда последняя: тащить можно только уроки
    const sort = useDragSort(course.pages.length, lessons.length, (from, to) =>
        moveLesson(course.id, course.pages[from].slug, to),
    )

    const addLesson = () => {
        const slug = createLesson(course.id)
        if (slug) navigate(`/admin/course/${course.id}/lesson/${slug}`)
    }

    return (
        <Box sx={{ px: { xs: 2, md: 5 }, pt: { xs: 3, md: 4 }, pb: 10, maxWidth: 1260 }}>
            {/* Шапка курса — плашка его цвета, как на сайте */}
            <Box sx={{ p: { xs: 2.5, md: 4.5 }, bgcolor: skin.bg }}>
                <Box
                    sx={{
                        display: 'grid',
                        gap: { xs: 3, md: 4.5 },
                        // Рядом с левым меню места мало: обложка встаёт сбоку с той же
                        // ширины, что и программа курса, — с 1200px
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) minmax(0, 340px)' },
                        alignItems: 'start',
                    }}
                >
                    <Box sx={{ minWidth: 0, maxWidth: 760 }}>
                        <Typography sx={{ ...captionSx, fontSize: '11px', letterSpacing: '0.1em', color: skin.text, opacity: 0.7 }}>
                            {course.chips.length ? course.chips.join(' / ') : 'Теги — в настройках'}
                        </Typography>

                        <Typography
                            component="div"
                            level="h1"
                            sx={{
                                mt: 2,
                                fontWeight: 500,
                                letterSpacing: '-0.03em',
                                color: skin.text,
                                fontSize: { xs: '32px', sm: '44px', md: '56px' },
                                lineHeight: 1.06,
                            }}
                        >
                            <AutoTextarea
                                value={course.title}
                                onChange={(title) => set({ title: title.replace(/\n/g, ' ') })}
                                placeholder="Название программы"
                                aria-label="Название программы"
                            />
                        </Typography>

                        <Typography component="div" sx={{ mt: 2, color: skin.text, opacity: 0.82, fontSize: 'lg', lineHeight: 1.65 }}>
                            <AutoTextarea
                                value={course.subtitle}
                                onChange={(subtitle) => set({ subtitle: subtitle.replace(/\n/g, ' ') })}
                                placeholder="Одна-две фразы о том, что получится в конце"
                                aria-label="Описание программы"
                            />
                        </Typography>

                        <Box sx={{ mt: 3.5, pt: 3, borderTop: '1px solid', borderColor: skin.rule, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <Meta label="Уровень" color={skin.text}>
                                {course.level || '—'}
                            </Meta>
                            <Meta label="Объём" color={skin.text}>
                                {lessonsLabel(lessons.length)}
                            </Meta>
                            <Meta label="Сложность" color={skin.text}>
                                <Difficulty value={course.difficulty} color={skin.text} size={17} sx={{ mt: '2px' }} />
                            </Meta>
                            <Meta label="Читатели" color={skin.text}>
                                {readersLabel(course.readers)}
                            </Meta>
                            <Meta label="Просмотры" color={skin.text}>
                                {viewsLabel(course.views)}
                            </Meta>
                            {course.updatedAt && (
                                <Meta label="Обновлён" color={skin.text}>
                                    <time dateTime={course.updatedAt}>{formatDate(course.updatedAt)}</time>
                                </Meta>
                            )}
                        </Box>
                    </Box>

                    <CoverDrop src={course.image} onChange={(image) => set({ image })} ratio="4 / 3" sx={{ order: { xs: -1, lg: 0 } }} />
                </Box>
            </Box>

            <Box
                sx={{
                    mt: { xs: 4, md: 6 },
                    display: 'grid',
                    gap: { xs: 4, md: 6 },
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' },
                    alignItems: 'start',
                }}
            >
                <Box sx={{ minWidth: 0, pl: { md: 9, lg: 9 } }}>
                    <Typography
                        level="h2"
                        sx={{ fontWeight: 500, letterSpacing: '-0.02em', pb: 1.25, mb: 2.5, borderBottom: '2px solid', borderColor: 'page.rule' }}
                    >
                        О курсе
                    </Typography>
                    <BlockEditor blocks={course.about} onChange={(about) => set({ about })} ink={ink} />
                </Box>

                <Box sx={{ minWidth: 0, position: { lg: 'sticky' }, top: { lg: 80 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', pb: 1.25, borderBottom: '2px solid', borderColor: 'page.rule' }}>
                        <Typography level="title-md" sx={{ fontFamily: 'display', fontWeight: 600 }}>
                            Программа
                        </Typography>
                        <Box component="span" sx={{ ...captionSx, fontSize: '11px', color: 'text.tertiary' }}>
                            {lessonsLabel(lessons.length)}
                        </Box>
                    </Box>

                    <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                        {course.pages.map((page, index) => (
                            <LessonRow
                                key={page.slug}
                                course={course}
                                page={page}
                                index={index}
                                number={lessons.indexOf(page) + 1}
                                ink={ink}
                                isLast={index === lessons.length - 1}
                                sort={sort}
                            />
                        ))}
                    </Box>

                    <Button
                        variant="outlined"
                        color="neutral"
                        startDecorator={<PlusIcon />}
                        onClick={addLesson}
                        sx={{ mt: 2, width: '100%', borderColor: 'page.border', color: 'text.primary', bgcolor: 'background.body' }}
                    >
                        Новый урок
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

function Meta({ label, color, children }) {
    return (
        <Box sx={{ minWidth: 120 }}>
            <Typography sx={{ ...captionSx, opacity: 0.6, color }}>{label}</Typography>
            <Typography component="div" sx={{ mt: 0.5, fontWeight: 500, color }}>
                {children}
            </Typography>
        </Box>
    )
}

/**
 * Строка программы: ссылка в редактор урока. Урок перетаскивается мышью
 * (за «⠿» или за саму строку), при наведении — сдвиг кнопками и удаление.
 * Место урока — его номер: после перестановки уроки нумеруются заново.
 */
function LessonRow({ course, page, index, number, ink, isLast, sort }) {
    const final = page.slug === FINAL_SLUG

    const remove = () => {
        if (!window.confirm(`Удалить урок «${getLessonTitle(page)}»?`)) return
        deleteLesson(course.id, page.slug)
    }

    return (
        <Box
            component="li"
            {...sort.itemProps(index)}
            sx={{
                ...dragSx(sort.dropLine(index), sort.dragging(index), ink),
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'page.border',
                '&:hover .lesson-tools, &:focus-within .lesson-tools, &:hover .lesson-grip': { opacity: 1 },
            }}
        >
            <Box
                className="lesson-grip"
                aria-hidden
                sx={{
                    // На телефоне уроки двигают кнопки: перетаскивание там неудобно
                    display: { xs: 'none', md: 'flex' },
                    ml: -2.5,
                    width: 20,
                    color: 'text.tertiary',
                    cursor: final ? 'default' : 'grab',
                    visibility: final ? 'hidden' : 'visible',
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                }}
            >
                <DotsSixVerticalIcon size={16} weight="bold" />
            </Box>
            <Box
                component={RouterLink}
                to={`/admin/course/${course.id}/lesson/${page.slug}`}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'baseline',
                    py: 1.25,
                    textDecoration: 'none',
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' },
                }}
            >
                <Box sx={{ fontFamily: 'code', fontSize: '11px', color: ink, minWidth: 22 }}>
                    {final ? <FlagIcon size={13} weight="fill" /> : String(number).padStart(2, '0')}
                </Box>
                <Box sx={{ fontSize: 'sm', lineHeight: 1.5, overflowWrap: 'anywhere' }}>{getLessonTitle(page)}</Box>
            </Box>

            <Box className="lesson-tools" sx={{ display: 'flex', opacity: { xs: 1, md: 0 }, transition: 'opacity 0.15s ease' }}>
                <IconButton size="sm" color="neutral" disabled={final || index === 0} onClick={() => moveLesson(course.id, page.slug, index - 1)} aria-label="Выше">
                    <ArrowUpIcon size={15} />
                </IconButton>
                <IconButton size="sm" color="neutral" disabled={final || isLast} onClick={() => moveLesson(course.id, page.slug, index + 1)} aria-label="Ниже">
                    <ArrowDownIcon size={15} />
                </IconButton>
                <IconButton size="sm" color="neutral" onClick={remove} aria-label="Удалить урок">
                    <TrashIcon size={15} />
                </IconButton>
            </Box>
        </Box>
    )
}
