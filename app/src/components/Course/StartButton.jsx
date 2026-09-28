import Button from '@mui/joy/Button'
import { useColorScheme } from '@mui/joy/styles'
import { Link as RouterLink } from 'react-router-dom'
import { shineSx } from '../Ui/shine'

/**
 * Кнопка «Начать курс». Заливка — краска курса с мягким градиентом сверху
 * вниз, при наведении по плашке быстро пробегает световая полоса.
 */
export default function StartButton({ course, accent, children = 'Начать курс', sx, ...props }) {
    const firstLesson = course.pages?.[0]?.slug ?? '1'

    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'
    const fill = resolved === 'dark' ? accent.solidDark : accent.solid

    return (
        <Button
            component={RouterLink}
            to={`/course/${course.id}/${firstLesson}`}
            {...props}
            sx={{
                ...shineSx(fill, '#fff'),
                fontWeight: 700,
                ...sx,
            }}
        >
            {children}
        </Button>
    )
}
