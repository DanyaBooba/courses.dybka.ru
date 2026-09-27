import Box from '@mui/joy/Box'

/**
 * Клавиша на клавиатуре: `<kbd>` в виде небольшой клавишной плашки.
 * Углы прямые, как и везде на сайте, а объём даёт утолщённая нижняя линейка —
 * так плашка читается именно как кнопка, а не как выделенный текст.
 */
export default function Kbd({ children, sx }) {
    return (
        <Box
            component="kbd"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '1.9em',
                px: '0.5em',
                py: '0.15em',
                fontFamily: 'code',
                fontSize: '0.92em',
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                color: 'text.primary',
                bgcolor: 'background.surface',
                border: '1px solid',
                borderColor: 'page.border',
                borderBottomWidth: '2px',
                boxShadow: 'none',
                ...sx,
            }}
        >
            {children}
        </Box>
    )
}
