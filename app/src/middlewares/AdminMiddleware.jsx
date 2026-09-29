import { Outlet } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import CircularProgress from '@mui/joy/CircularProgress'
import Typography from '@mui/joy/Typography'
import { Link as RouterLink } from 'react-router-dom'

import PageShell from '../components/Layout/PageShell'
import LoadError from '../components/Ui/LoadError'
import { ACCESS, useProfile } from '../api/courses'
import { setToken } from '../auth/session'

/**
 * Пускает в панель управления автора и администратора. Автор видит в ней
 * только свои программы, администратор — все и ещё пользователей.
 * Кто вошёл без прав,
 * видит, почему сюда нельзя, и может выйти. Ставится внутри AuthMiddleware:
 * гостя тот уже отправил на вход.
 */
export default function AdminMiddleware() {
    const { user, loading, error, reload } = useProfile()

    if (loading) {
        return (
            <PageShell centered>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size="md" color="neutral" />
                </Box>
            </PageShell>
        )
    }

    // 401 обрабатывает useProfile: стирает токен, и AuthMiddleware уводит на вход
    if (error && error.status !== 401) {
        return (
            <PageShell centered>
                <Box sx={{ maxWidth: 560, mx: 'auto', px: 2.5, width: '100%' }}>
                    <LoadError title="Не получилось проверить доступ" error={error} onRetry={reload} />
                </Box>
            </PageShell>
        )
    }

    if (!user) return null

    if (user.access < ACCESS.AUTHOR) {
        const pending = user.access === ACCESS.NONE
        return (
            <PageShell centered>
                <Box sx={{ maxWidth: 480, mx: 'auto', px: 2.5, textAlign: 'center' }}>
                    <Typography level="h1" sx={{ fontWeight: 450, letterSpacing: '-0.03em', fontSize: { xs: '32px', md: '42px' } }}>
                        {pending ? 'Аккаунт ждёт подтверждения' : 'Нет доступа'}
                    </Typography>
                    <Typography sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.7 }}>
                        {pending
                            ? `Вы вошли как ${user.email}. Администратор получил письмо и откроет доступ — мы сообщим на почту.`
                            : 'Панель управления доступна только авторам.'}
                    </Typography>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button component={RouterLink} to="/">
                            На сайт
                        </Button>
                        <Button variant="outlined" color="neutral" onClick={() => setToken(null)}>
                            Выйти
                        </Button>
                    </Box>
                </Box>
            </PageShell>
        )
    }

    return <Outlet />
}
