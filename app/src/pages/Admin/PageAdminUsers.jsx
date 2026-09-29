import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Input from '@mui/joy/Input'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Tab from '@mui/joy/Tab'
import TabList from '@mui/joy/TabList'
import Tabs from '@mui/joy/Tabs'
import Typography from '@mui/joy/Typography'
import { EyeIcon, EyeSlashIcon, HourglassIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

import AdminTopBar from './AdminTopBar'
import Bone from '../../components/Ui/Bone'
import LoadError from '../../components/Ui/LoadError'
import { notify } from '../../admin/notices'
import { formatDate } from '../../admin/dates'
import { ACCESS_LABELS, setUserAccess, useAdminUsers } from '../../admin/users'
import { ACCESS, useProfile } from '../../api/courses'

const captionSx = {
    fontFamily: 'code',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'text.tertiary',
}

const FILTERS = [
    { value: 'all', label: 'Все', test: () => true },
    { value: 'pending', label: 'Ждут доступа', test: (user) => user.access === ACCESS.NONE },
    { value: 'authors', label: 'Авторы', test: (user) => user.access === ACCESS.AUTHOR },
    { value: 'admins', label: 'Администраторы', test: (user) => user.access >= ACCESS.ADMIN },
]

/**
 * Пользователи — только для администратора: кто зарегистрирован, когда
 * заходил, какие курсы написал. Здесь же выдаётся доступ: новый
 * пользователь ждёт его с уровнем «Ждёт доступа», автор пишет свои курсы.
 */
export default function PageAdminUsers() {
    const { user: me } = useProfile()
    const { users = [], loading, error, reload } = useAdminUsers()
    const [filter, setFilter] = useState('all')
    const [query, setQuery] = useState('')

    useEffect(() => {
        document.title = 'Пользователи — панель управления'
    }, [])

    if (me && me.access < ACCESS.ADMIN) {
        return (
            <>
                <AdminTopBar crumbs={[{ label: 'Пользователи' }]} />
                <Box sx={{ p: 5 }}>
                    <Typography level="h2">Нет доступа</Typography>
                    <Typography sx={{ mt: 1, color: 'text.secondary' }}>Пользователями управляет администратор.</Typography>
                </Box>
            </>
        )
    }

    const needle = query.trim().toLowerCase()
    const { test } = FILTERS.find((item) => item.value === filter)
    const shown = users.filter(
        (user) => test(user) && (!needle || `${user.email} ${user.name}`.toLowerCase().includes(needle)),
    )

    return (
        <>
            <AdminTopBar crumbs={[{ label: 'Пользователи' }]} />

            <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 }, maxWidth: 1100 }}>
                <Typography level="h1" sx={{ fontWeight: 450, letterSpacing: '-0.03em', fontSize: { xs: '34px', md: '46px' } }}>
                    Пользователи
                </Typography>
                <Typography sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.65 }}>
                    Кто зарегистрировался и что написал. Выдайте доступ «Автор» — и человек сможет писать свои курсы; открыть их читателям сможете только вы.
                </Typography>

                <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Tabs value={filter} onChange={(_, value) => setFilter(value)} sx={{ bgcolor: 'transparent' }}>
                        <TabList
                            disableUnderline
                            sx={{
                                gap: 0.5,
                                bgcolor: 'transparent',
                                flexWrap: 'wrap',
                                '& .MuiTab-root': { fontWeight: 500, color: 'text.tertiary', bgcolor: 'transparent' },
                                '& .MuiTab-root.Mui-selected': { color: 'text.primary', bgcolor: 'background.level1' },
                            }}
                        >
                            {FILTERS.map((item) => {
                                const count = users.filter(item.test).length
                                return (
                                    <Tab key={item.value} value={item.value} disableIndicator>
                                        {item.label}
                                        <Box component="span" sx={{ ml: 0.75, fontFamily: 'code', fontSize: '11px', color: item.value === 'pending' && count ? 'warning.plainColor' : 'text.tertiary' }}>
                                            {count}
                                        </Box>
                                    </Tab>
                                )
                            })}
                        </TabList>
                    </Tabs>
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Почта или имя"
                        startDecorator={<MagnifyingGlassIcon />}
                        size="sm"
                        sx={{ width: { xs: '100%', sm: 260 }, boxShadow: 'none', bgcolor: 'background.body' }}
                    />
                </Box>

                {loading && !users.length && (
                    <Box aria-busy sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {Array.from({ length: 5 }, (_, index) => (
                            <Bone key={index} height={72} />
                        ))}
                    </Box>
                )}

                {error && !users.length && <LoadError error={error} onRetry={reload} sx={{ mt: 4 }} />}

                {!loading && !error && !shown.length && (
                    <Typography sx={{ mt: 4, color: 'text.tertiary' }}>Никого не нашлось</Typography>
                )}

                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, mt: 3, borderTop: '2px solid', borderColor: 'page.rule' }}>
                    {shown.map((user) => (
                        <UserRow key={user.id} user={user} self={user.id === me?.id} />
                    ))}
                </Box>
            </Box>
        </>
    )
}

function UserRow({ user, self }) {
    const [saving, setSaving] = useState(false)

    const change = async (access) => {
        if (access === user.access) return
        if (access >= ACCESS.ADMIN && !window.confirm(`Сделать ${user.email} администратором? Появится право править и публиковать любые курсы и выдавать доступ.`)) return
        if (access === ACCESS.NONE && user.courses.length && !window.confirm(`Забрать доступ у ${user.email}? Курсы останутся, но править их будет нельзя.`)) return
        setSaving(true)
        try {
            await setUserAccess(user.id, access)
        } catch (error) {
            notify(error.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Box
            component="li"
            sx={{
                py: 2,
                display: 'grid',
                gap: { xs: 1.5, md: 3 },
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.2fr) 200px' },
                alignItems: 'start',
                borderBottom: '1px solid',
                borderColor: 'page.border',
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                    {user.name || user.email}
                    {self && (
                        <Box component="span" sx={{ ml: 1, fontWeight: 400, fontSize: 'sm', color: 'text.tertiary' }}>
                            это вы
                        </Box>
                    )}
                </Typography>
                {user.name && <Typography sx={{ fontSize: 'sm', color: 'text.secondary', overflowWrap: 'anywhere' }}>{user.email}</Typography>}
                <Typography sx={{ mt: 0.5, fontSize: 'xs', color: 'text.tertiary' }}>
                    С {formatDate(user.createdAt)}
                    {user.lastLoginAt ? ` · последний вход ${formatDate(user.lastLoginAt)}` : ' · входа ещё не было'}
                </Typography>
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography sx={captionSx}>Курсы · {user.courses.length}</Typography>
                {user.courses.length ? (
                    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, mt: 0.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {user.courses.map((course) => (
                            <Box component="li" key={course.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                <CourseBadge course={course} />
                                <Typography
                                    component={RouterLink}
                                    to={`/admin/course/${course.id}`}
                                    sx={{ fontSize: 'sm', color: 'text.primary', textDecoration: 'none', overflowWrap: 'anywhere', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    {course.title || course.id}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography sx={{ mt: 0.75, fontSize: 'sm', color: 'text.tertiary' }}>Пока ничего</Typography>
                )}
            </Box>

            <Select
                size="sm"
                value={user.access}
                onChange={(_, access) => access !== null && change(access)}
                disabled={self || saving}
                color={user.access === ACCESS.NONE ? 'warning' : 'neutral'}
                aria-label={`Доступ ${user.email}`}
                sx={{ boxShadow: 'none', bgcolor: 'background.body' }}
            >
                {[ACCESS.NONE, ACCESS.AUTHOR, ACCESS.ADMIN].map((access) => (
                    <Option key={access} value={access}>
                        {ACCESS_LABELS[access]}
                    </Option>
                ))}
            </Select>
        </Box>
    )
}

/** Состояние курса значком: открыт, скрыт или ждёт проверки. */
function CourseBadge({ course }) {
    if (course.disabled && course.reviewRequestedAt) {
        return (
            <Chip size="sm" variant="soft" color="warning" startDecorator={<HourglassIcon size={12} />} sx={{ flexShrink: 0, fontSize: '11px' }}>
                проверка
            </Chip>
        )
    }
    const Icon = course.disabled ? EyeSlashIcon : EyeIcon
    return (
        <Box component="span" title={course.disabled ? 'Скрыт' : 'Открыт'} sx={{ display: 'inline-flex', flexShrink: 0, color: course.disabled ? 'text.tertiary' : 'success.plainColor' }}>
            <Icon size={14} />
        </Box>
    )
}
