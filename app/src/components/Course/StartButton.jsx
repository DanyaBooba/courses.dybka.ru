import Button from '@mui/joy/Button'
import { useColorScheme } from '@mui/joy/styles'
import { Link as RouterLink } from 'react-router-dom'

/**
 * Кнопка «Начать курс». Заливка — краска курса, при наведении по плашке
 * быстро пробегает световая полоса: единственное место на сайте, где
 * допускается градиент, и то как короткий блик, а не как фон.
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
                position: 'relative',
                overflow: 'hidden',
                isolation: 'isolate',
                bgcolor: fill,
                color: '#fff',
                '&:hover': { bgcolor: fill, filter: 'brightness(1.15)' },
                fontWeight: 700,

                // Полоса выезжает из-за левого края, пробегает по кнопке и
                // полностью уходит за правый — в конце от неё не остаётся следа
                '@keyframes ddShine': {
                    '0%': { transform: 'translateX(0) skewX(-22deg)', opacity: 0 },
                    '15%': { opacity: 1 },
                    '85%': { opacity: 1 },
                    '100%': { transform: 'translateX(420%) skewX(-22deg)', opacity: 0 },
                },

                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '-60%',
                    width: '45%',
                    pointerEvents: 'none',
                    transform: 'translateX(0) skewX(-22deg)',
                    background:
                        'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
                    opacity: 0,
                },
                // Блик запускается и по наведению, и когда до кнопки дошли с клавиатуры
                '&:hover::after, &:focus-visible::after': {
                    animation: 'ddShine 0.75s cubic-bezier(0.25, 0.6, 0.3, 1)',
                },
                '@media (prefers-reduced-motion: reduce)': {
                    '&::after': { display: 'none' },
                },

                ...sx,
            }}
        >
            {children}
        </Button>
    )
}
