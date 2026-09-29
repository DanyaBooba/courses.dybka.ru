import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Snackbar from '@mui/joy/Snackbar'
import IconButton from '@mui/joy/IconButton'
import Tooltip from '@mui/joy/Tooltip'
import { ArrowLineDownIcon, SidebarSimpleIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react'

import AdminSidebar from './AdminSidebar'
import { isFileDrag } from '../../admin/uploads'
import { dismiss, useNotices } from '../../admin/notices'
import { hasUnsaved } from '../../admin/store'
import { setChromeHidden, useHiddenChrome } from '../../admin/chrome'
import { useNoIndex } from '../../seo/useSeo'

// Кнопка в углу экрана, которая возвращает спрятанную панель
const restoreSx = {
    position: 'fixed',
    top: 12,
    zIndex: 30,
    bgcolor: 'background.surface',
    borderColor: 'page.border',
    color: 'text.secondary',
    boxShadow: 'sm',
    opacity: 0.85,
    transition: 'opacity 0.15s ease',
    '&:hover': { opacity: 1, bgcolor: 'background.level1', color: 'text.primary' },
}

/**
 * Каркас панели управления: слева список программ, справа — открытая
 * страница. На телефоне список занимает весь экран на главной панели,
 * а внутри программы прячется — туда ведёт ссылка «Все программы».
 *
 * Левое меню и верхнюю полосу можно спрятать, чтобы писать урок на весь
 * экран; вернуть их — кнопками в углах.
 */
export default function AdminLayout() {
    const { pathname } = useLocation()
    const home = pathname.replace(/\/$/, '') === '/admin'
    const notices = useNotices()
    const hidden = useHiddenChrome()
    useNoIndex()

    // Правки уходят на сервер через секунду, а сохранение может и не пройти —
    // закрыть или перезагрузить вкладку тогда значит их потерять. Браузер
    // спросит своим окном; текст в нём он всё равно пишет сам
    useEffect(() => {
        const warn = (event) => {
            if (!hasUnsaved()) return
            event.preventDefault()
            // Старые Chrome, Safari и Firefox смотрят не на preventDefault, а сюда
            event.returnValue = 'Есть несохранённые правки'
            return event.returnValue
        }
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [])

    // Файл, брошенный мимо зоны загрузки, браузер открыл бы вместо панели —
    // и все правки пропали бы. Такие броски просто гасим
    useEffect(() => {
        const swallow = (event) => {
            if (isFileDrag(event)) event.preventDefault()
        }
        window.addEventListener('dragover', swallow)
        window.addEventListener('drop', swallow)
        return () => {
            window.removeEventListener('dragover', swallow)
            window.removeEventListener('drop', swallow)
        }
    }, [])

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.body',
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: hidden.sidebar ? 'minmax(0, 1fr)' : '300px minmax(0, 1fr)' },
            }}
        >
            <Box
                sx={{
                    display: { xs: home ? 'block' : 'none', md: hidden.sidebar ? 'none' : 'block' },
                    position: { md: 'sticky' },
                    top: 0,
                    height: { md: '100vh' },
                    borderRight: { md: '1px solid' },
                    borderColor: { md: 'page.border' },
                    bgcolor: 'background.surface',
                }}
            >
                <AdminSidebar />
            </Box>

            <Box
                component="main"
                // Слева место под кнопку «Показать меню», чтобы она не легла на крошки
                sx={{ minWidth: 0, display: { xs: home ? 'none' : 'block', md: 'block' }, pl: { md: hidden.sidebar ? 7 : 0 } }}
            >
                <Outlet />
            </Box>

            {hidden.sidebar && (
                <Tooltip title="Показать меню" size="sm" variant="soft" placement="right">
                    <IconButton
                        variant="outlined"
                        size="sm"
                        onClick={() => setChromeHidden('sidebar', false)}
                        aria-label="Показать меню"
                        sx={{ ...restoreSx, left: 12, display: { xs: 'none', md: 'inline-flex' } }}
                    >
                        <SidebarSimpleIcon />
                    </IconButton>
                </Tooltip>
            )}

            {hidden.topbar && (
                <Tooltip title="Показать верхнюю панель" size="sm" variant="soft" placement="left">
                    <IconButton
                        variant="outlined"
                        size="sm"
                        onClick={() => setChromeHidden('topbar', false)}
                        aria-label="Показать верхнюю панель"
                        sx={{ ...restoreSx, right: 12 }}
                    >
                        <ArrowLineDownIcon />
                    </IconButton>
                </Tooltip>
            )}

            {/* Одно сообщение за раз: следующее всплывёт, когда закроют это */}
            {notices[0] && (
                <Snackbar
                    key={notices[0].id}
                    open
                    color="danger"
                    variant="soft"
                    autoHideDuration={6000}
                    onClose={(_, reason) => reason !== 'clickaway' && dismiss(notices[0].id)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    startDecorator={<WarningCircleIcon size={20} />}
                    endDecorator={
                        <IconButton size="sm" variant="plain" color="danger" onClick={() => dismiss(notices[0].id)} aria-label="Закрыть">
                            <XIcon />
                        </IconButton>
                    }
                >
                    {notices[0].message}
                </Snackbar>
            )}
        </Box>
    )
}
