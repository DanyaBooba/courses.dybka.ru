import Box from '@mui/joy/Box'

import Footer from './Footer'

/**
 * Общий каркас страницы: сплошной фон без градиентов и подвал.
 * Шапки нет — навигация живёт внутри страниц.
 */
export default function PageShell({ children }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.body',
            }}
        >
            <Box component="main" sx={{ flex: 1 }}>
                {children}
            </Box>

            <Footer />
        </Box>
    )
}
