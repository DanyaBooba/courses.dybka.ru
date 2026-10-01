import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import FormLabel from '@mui/joy/FormLabel'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'
import {
    ArrowSquareOutIcon,
    CaretLeftIcon,
    CaretRightIcon,
    EyeIcon,
    GearIcon,
    PencilSimpleIcon,
    PlusIcon,
    TrashIcon,
} from '@phosphor-icons/react'

import AdminTopBar from './AdminTopBar'
import AdminState from './AdminState'
import SaveStatus from './SaveStatus'
import { pressedInkSx } from './adminStyles'
import AutoTextarea from '../../admin/editor/AutoTextarea'
import BlockEditor from '../../admin/editor/BlockEditor'
import { createLesson, deleteLesson, lessonSlugError, updateLesson, useAdminCourse } from '../../admin/store'
import { useHiddenChrome } from '../../admin/chrome'
import { FINAL_SLUG, getLessonHeading, getLessonNumber, getLessonTitle, getLessons, getNeighbours } from '../../data/courses'
import { getAccent, getInk } from '../../theme/accents'
import useScheme from '../../theme/useScheme'

// Ровно как заголовок на странице урока (pages/PageLesson.jsx)
const titleSx = {
    mt: 1.5,
    mb: 4,
    fontWeight: 500,
    letterSpacing: '-0.025em',
    lineHeight: 1.12,
    fontSize: { xs: '30px', sm: '38px', md: '46px' },
}

/**
 * Редактор урока. Посередине — страница урока в дизайне сайта: номер,
 * заголовок и блоки правятся прямо на ней. «Просмотр» убирает все рамки
 * и кнопки — так урок увидит читатель.
 */
export default function PageAdminLesson() {
    const { id, slug } = useParams()
    // Другой урок — новый редактор: выбранный блок и фокус не переезжают следом
    return <LessonPage key={`${id}/${slug}`} id={id} slug={slug} />
}

function LessonPage({ id, slug }) {
    const navigate = useNavigate()
    const { course, loading, error, reload, save, saveError } = useAdminCourse(id)
    const scheme = useScheme()
    const [mode, setMode] = useState('edit')
    const [settingsOpen, setSettingsOpen] = useState(false)
    // Спрятали верхнюю полосу — прячем и подсказку под ней: остаётся только урок
    const chromeHidden = useHiddenChrome().topbar

    const page = course?.pages.find((item) => item.slug === slug) ?? null

    // Новый урок открывается с курсором в заголовке
    const [titleFocus] = useState(() => (page && !page.title ? { caret: 'end', token: 1 } : null))

    useEffect(() => {
        if (page) document.title = `${page.title || 'Новый урок'} — панель управления`
    }, [page])

    // ⌘/Ctrl + Shift + P — переключить редактор и просмотр
    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'p') {
                event.preventDefault()
                setMode((current) => (current === 'edit' ? 'preview' : 'edit'))
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    if (!course || !page) {
        return (
            <AdminState
                loading={loading}
                error={error}
                onRetry={reload}
                notFound={{ title: 'Такого урока нет', text: 'Возможно, его удалили или поменяли адрес. Выберите урок слева.' }}
            />
        )
    }

    const accent = getAccent(course.accent)
    const ink = getInk(accent, scheme)
    const lessons = getLessons(course)
    const final = page.slug === FINAL_SLUG
    const number = getLessonNumber(course, page)
    const preview = mode === 'preview'

    const set = (change) => updateLesson(course.id, page.slug, change)

    const remove = () => {
        if (!window.confirm(`Удалить урок «${getLessonTitle(page)}»?`)) return
        deleteLesson(course.id, page.slug)
        navigate(`/admin/course/${course.id}`, { replace: true })
    }

    return (
        <>
            <AdminTopBar
                crumbs={[
                    { label: 'Программы', to: '/admin' },
                    { label: course.title || 'Без названия', to: `/admin/course/${course.id}` },
                    { label: page.title || 'Новый урок' },
                ]}
                // Настройки прилипают вместе с полосой: открываются там, где их позвали
                below={settingsOpen && <LessonSettings course={course} page={page} set={set} />}
            >
                <SaveStatus courseId={course.id} save={save} error={saveError} />
                <ToggleButtonGroup
                    size="sm"
                    value={mode}
                    onChange={(_, value) => value && setMode(value)}
                    aria-label="Режим"
                    sx={pressedInkSx}
                >
                    <Tooltip title="Правка на странице" size="sm" variant="soft">
                        <Button value="edit" startDecorator={<PencilSimpleIcon />} sx={{ fontWeight: 500 }}>
                            Редактор
                        </Button>
                    </Tooltip>
                    <Tooltip title="Как увидит читатель · ⌘⇧P" size="sm" variant="soft">
                        <Button value="preview" startDecorator={<EyeIcon />} sx={{ fontWeight: 500 }}>
                            Просмотр
                        </Button>
                    </Tooltip>
                </ToggleButtonGroup>

                <Tooltip title="Настройки урока" size="sm" variant="soft">
                    <IconButton
                        size="sm"
                        color="neutral"
                        variant={settingsOpen ? 'soft' : 'plain'}
                        onClick={() => setSettingsOpen((open) => !open)}
                        aria-label="Настройки урока"
                        aria-expanded={settingsOpen}
                    >
                        <GearIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Открыть на сайте" size="sm" variant="soft">
                    <IconButton
                        component="a"
                        href={`/course/${course.id}/${page.slug}`}
                        target="_blank"
                        size="sm"
                        color="neutral"
                        aria-label="Открыть на сайте"
                    >
                        <ArrowSquareOutIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Удалить урок" size="sm" variant="soft">
                    <IconButton size="sm" color="danger" onClick={remove} aria-label="Удалить урок">
                        <TrashIcon />
                    </IconButton>
                </Tooltip>
            </AdminTopBar>

            {!preview && !chromeHidden && (
                <Typography
                    sx={{
                        px: { xs: 2, md: 3 },
                        py: 1,
                        fontSize: 'xs',
                        color: 'text.tertiary',
                        borderBottom: '1px solid',
                        borderColor: 'page.border',
                        '& code': { fontFamily: 'code', fontSize: '11px', px: 0.5, bgcolor: 'background.level1' },
                    }}
                >
                    Щёлкните по блоку, чтобы править. <code>**жирный**</code> <code>_курсив_</code> <code>`код`</code>{' '}
                    <code>[ссылка](адрес)</code> · Enter — новый абзац, Shift+Enter — перенос строки · фото перетаскивайте прямо на страницу
                </Typography>
            )}

            {/* Колонка урока — той же ширины, что на сайте. Слева место под кнопки блоков */}
            <Box sx={{ px: { xs: 2.5, md: 12 }, pt: { xs: 5, md: 6 }, pb: 12 }}>
                <Box sx={{ width: '100%', maxWidth: 824, mx: 'auto' }}>
                    <Typography sx={{ fontFamily: 'code', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: ink }}>
                        {final ? 'Итог курса' : `Урок ${lessons.indexOf(page) + 1} из ${lessons.length}`}
                    </Typography>

                    <Typography component={preview ? 'h1' : 'div'} level="h1" sx={titleSx}>
                        {preview ? (
                            getLessonHeading(course, page)
                        ) : (
                            // Номер ставится сам, как на сайте: в поле — только название
                            <Box sx={{ display: 'flex' }}>
                                {number && <Box component="span" sx={{ flexShrink: 0, color: 'text.tertiary' }}>{number}.&nbsp;</Box>}
                                <AutoTextarea
                                    value={page.title}
                                    onChange={(title) => set({ title: title.replace(/\n/g, ' ') })}
                                    focus={titleFocus}
                                    placeholder="Название урока"
                                    aria-label="Название урока"
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') event.preventDefault()
                                    }}
                                />
                            </Box>
                        )}
                    </Typography>

                    <BlockEditor blocks={page.content} onChange={(content) => set({ content })} ink={ink} preview={preview} />

                    {!preview && <LessonFooter course={course} page={page} onRemove={remove} />}
                </Box>
            </Box>
        </>
    )
}

const navCaptionSx = {
    fontFamily: 'code',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'text.tertiary',
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
}

/** Соседний урок — плашкой, как навигация внизу урока на сайте. */
function NeighbourLink({ course, page, direction }) {
    const next = direction === 'next'
    return (
        <Box
            component={RouterLink}
            to={`/admin/course/${course.id}/lesson/${page.slug}`}
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'page.border',
                textDecoration: 'none',
                textAlign: next ? 'right' : 'left',
                gridColumn: next ? { sm: 2 } : undefined,
                '&:hover': { bgcolor: 'background.level1' },
            }}
        >
            <Box sx={{ ...navCaptionSx, justifyContent: next ? 'flex-end' : 'flex-start' }}>
                {!next && <CaretLeftIcon size={14} weight="bold" />}
                {next ? 'Следующий урок' : 'Предыдущий урок'}
                {next && <CaretRightIcon size={14} weight="bold" />}
            </Box>
            <Typography sx={{ mt: 0.75, fontFamily: 'display', fontWeight: 500, color: 'text.primary' }}>{getLessonTitle(page)}</Typography>
        </Box>
    )
}

/**
 * Под уроком, после «Добавить блок»: соседние уроки (если есть), новый урок
 * и удаление этого — чтобы не подниматься за ними к верхней полосе.
 */
function LessonFooter({ course, page, onRemove }) {
    const navigate = useNavigate()
    const { prev, next } = getNeighbours(course, page.slug)

    const addLesson = () => {
        const slug = createLesson(course.id)
        if (slug) navigate(`/admin/course/${course.id}/lesson/${slug}`)
    }

    return (
        <Box sx={{ mt: 7, pt: 4, borderTop: '1px solid', borderColor: 'page.border' }}>
            {(prev || next) && (
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                    {prev && <NeighbourLink course={course} page={prev} direction="prev" />}
                    {next && <NeighbourLink course={course} page={next} direction="next" />}
                </Box>
            )}

            <Box sx={{ mt: prev || next ? 2 : 0, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
                <Button startDecorator={<PlusIcon weight="bold" />} onClick={addLesson} sx={{ fontWeight: 700 }}>
                    Создать новый урок
                </Button>
                <Button color="danger" startDecorator={<TrashIcon />} onClick={onRemove} sx={{ fontWeight: 700 }}>
                    Удалить урок
                </Button>
            </Box>
        </Box>
    )
}

/** Название и адрес урока. Адрес меняется по Enter или при уходе из поля. */
function LessonSettings({ course, page, set }) {
    const navigate = useNavigate()
    const [slug, setSlug] = useState(page.slug)

    const error = lessonSlugError(course, slug, { except: page.slug })

    const commitSlug = () => {
        if (slug === page.slug || error) return
        set({ slug })
        navigate(`/admin/course/${course.id}/lesson/${slug}`, { replace: true })
    }

    return (
        <Box
            sx={{
                px: { xs: 2, md: 3 },
                py: 2,
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 260px' },
                borderBottom: '1px solid',
                borderColor: 'page.border',
                bgcolor: 'background.surface',
            }}
        >
            <FormControl>
                <FormLabel>Название</FormLabel>
                <Input
                    value={page.title ?? ''}
                    onChange={(event) => set({ title: event.target.value })}
                    placeholder="Название урока"
                    sx={{ boxShadow: 'none' }}
                />
            </FormControl>
            <FormControl error={Boolean(error)}>
                <FormLabel>Адрес</FormLabel>
                <Input
                    value={slug}
                    onChange={(event) => setSlug(event.target.value.toLowerCase())}
                    onBlur={commitSlug}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') commitSlug()
                    }}
                    startDecorator={<Box component="span" sx={{ fontFamily: 'code', fontSize: 'sm', color: 'text.tertiary' }}>/{course.id}/</Box>}
                    sx={{ boxShadow: 'none', fontFamily: 'code' }}
                />
                <FormHelperText sx={{ '& code': { fontFamily: 'code' } }}>
                    {error ??
                        (slug === FINAL_SLUG ? (
                            'Итог курса: всегда последний, без номера и не входит в счёт уроков.'
                        ) : (
                            <span>
                                Адрес <code>end</code> — итог курса: последняя страница, без номера.
                            </span>
                        ))}
                </FormHelperText>
            </FormControl>
        </Box>
    )
}
