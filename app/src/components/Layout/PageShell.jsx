import Box from '@mui/joy/Box'

import Footer from './Footer'

/**
 * Общий каркас страницы: сплошной фон без градиентов и подвал.
 * Шапки нет — навигация живёт внутри страниц.
 *
 * `footerOffset` — высота фиксированной панели внизу экрана на телефонах (px):
 * на столько подвал приподнимается, чтобы панель его не закрывала.
 *
 * `centered` — содержимое стоит по центру экрана по вертикали (формы входа и т. п.).
 */
export default function PageShell({ children, footerOffset = 0, centered = false }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.body',
            }}
        >
            <Box
                component="main"
                sx={{
                    flex: 1,
                    ...(centered && { display: 'flex', flexDirection: 'column', justifyContent: 'center' }),
                }}
            >
                {children}
            </Box>

            <Footer offset={footerOffset} />
        </Box>
    )
}
