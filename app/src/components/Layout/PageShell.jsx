import Box from '@mui/joy/Box'

import Footer from './Footer'

/**
 * Общий каркас страницы: мягкие цветные пятна на фоне и подвал.
 * Шапки нет — навигация живёт внутри страниц.
 */
export default function PageShell({ children }) {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Воздушный цветной фон */}
            <Box
                aria-hidden
                sx={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: -1,
                    pointerEvents: 'none',
                    background: (theme) => `
                        radial-gradient(62vw 50vw at 6% -8%, ${theme.vars.palette.page.glow1}, transparent 64%),
                        radial-gradient(54vw 46vw at 98% 2%, ${theme.vars.palette.page.glow2}, transparent 62%),
                        radial-gradient(58vw 52vw at 50% 38%, ${theme.vars.palette.page.glow3}, transparent 64%)
                    `,
                }}
            />

            <Box component="main" sx={{ flex: 1 }}>
                {children}
            </Box>

            <Footer />
        </Box>
    )
}
