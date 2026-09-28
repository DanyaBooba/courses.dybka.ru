/**
 * Заливка главной кнопки: краска с мягким градиентом (сверху чуть светлее,
 * снизу — сама краска) и световой полосой, которая пробегает по плашке
 * при наведении. `fill` и `color` (цвет текста) — любые CSS-цвета,
 * в том числе var(--…).
 */
export function fillGradient(fill) {
    return `linear-gradient(180deg, color-mix(in srgb, ${fill} 84%, #fff) 0%, ${fill} 100%)`
}

export function shineSx(fill, color = '#fff') {
    return {
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        bgcolor: fill,
        backgroundImage: fillGradient(fill),
        color,
        transition: 'filter 0.2s ease',
        // Фон Joy перебиваем, а подсветку оставляем мыши: на тач-экранах
        // :hover «залипает» после тапа
        // Цвет текста держим во всех состояниях, чтобы Joy не подменял его на свой
        '&:hover': { bgcolor: fill, color },
        '&:hover, &:active, &:focus-visible, &:visited': { color },
        '@media (hover: hover)': {
            '&:hover': { filter: 'brightness(1.12)', color },
            '&:hover::after': { animation: 'ddShine 0.75s cubic-bezier(0.25, 0.6, 0.3, 1)' },
        },
        '&:active': { filter: 'brightness(1.12)' },

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
        // Блик запускается и по наведению (выше), и когда до кнопки дошли с клавиатуры
        '&:focus-visible::after': {
            animation: 'ddShine 0.75s cubic-bezier(0.25, 0.6, 0.3, 1)',
        },
        '@media (prefers-reduced-motion: reduce)': {
            '&::after': { display: 'none' },
        },
    }
}
