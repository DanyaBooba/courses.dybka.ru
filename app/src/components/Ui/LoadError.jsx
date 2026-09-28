import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { ArrowClockwiseIcon, WarningCircleIcon } from '@phosphor-icons/react'

/** Данные не загрузились: объясняем по-человечески и даём попробовать ещё раз. */
export default function LoadError({ title = 'Не получилось загрузить курсы', error, onRetry, sx }) {
    return (
        <Box
            role="alert"
            sx={{
                py: { xs: 5, md: 7 },
                px: 2.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: '1px dashed',
                borderColor: 'page.border',
                ...sx,
            }}
        >
            <Box sx={{ color: 'text.tertiary', display: 'flex' }}>
                <WarningCircleIcon size={32} />
            </Box>
            <Typography level="title-lg" sx={{ mt: 1.5, fontFamily: 'display', fontWeight: 500 }}>
                {title}
            </Typography>
            <Typography sx={{ mt: 1, maxWidth: 440, color: 'text.secondary', lineHeight: 1.6 }}>
                {error?.message || 'Что-то пошло не так. Попробуйте ещё раз.'}
            </Typography>
            {onRetry && (
                <Button
                    variant="outlined"
                    color="neutral"
                    startDecorator={<ArrowClockwiseIcon />}
                    onClick={onRetry}
                    sx={{ mt: 2.5 }}
                >
                    Повторить
                </Button>
            )}
        </Box>
    )
}
