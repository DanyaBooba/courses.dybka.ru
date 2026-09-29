import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Snackbar from '@mui/joy/Snackbar'
import IconButton from '@mui/joy/IconButton'
import { WarningCircleIcon, XIcon } from '@phosphor-icons/react'

import AdminSidebar from './AdminSidebar'
import { isFileDrag } from '../../admin/uploads'
import { dismiss, useNotices } from '../../admin/notices'
import { hasUnsaved } from '../../admin/store'
import { useNoIndex } from '../../seo/useSeo'

/**
 * Каркас панели управления: слева список программ, справа — открытая
 * страница. На телефоне список занимает весь экран на главной панели,
 * а внутри программы прячется — туда ведёт ссылка «Все программы».
 */
export default function AdminLayout() {
    const { pathname } = useLocation()
    const home = pathname.replace(/\/$/, '') === '/admin'
    const notices = useNotices()
    useNoIndex()

    // Правки уходят на сервер через секунду — закрыть вкладку раньше значит их потерять
    useEffect(() => {
        const warn = (event) => {
            if (!hasUnsaved()) return
            event.preventDefault()
            event.returnValue = ''
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
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '300px minmax(0, 1fr)' },
            }}
        >
            <Box
                sx={{
                    display: { xs: home ? 'block' : 'none', md: 'block' },
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

            <Box component="main" sx={{ minWidth: 0, display: { xs: home ? 'none' : 'block', md: 'block' } }}>
                <Outlet />
            </Box>

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
