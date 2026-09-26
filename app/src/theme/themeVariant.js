import { extendTheme } from '@mui/joy/styles'

const bodyFont = "'Geologica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
const displayFont = "'Literata', 'PT Serif', Georgia, 'Times New Roman', serif"
const codeFont = "'SF Mono', ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, monospace"

/**
 * Язык оформления — печатный справочник, а не «лендинг»:
 * плотная бумага вместо белизны, чернила вместо серого, тонкие линейки
 * вместо теней, углы почти прямые, кнопки — прямоугольные плашки.
 * Градиентов нет нигде: ни в фоне, ни в тексте, ни в плашках.
 */
const themeVariant = extendTheme({
    cssVarPrefix: 'dd',
    fontFamily: {
        body: bodyFont,
        display: displayFont,
        code: codeFont,
    },
    // Скруглений нет нигде: только прямые углы
    radius: {
        xs: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
    },
    colorSchemes: {
        light: {
            palette: {
                head: { themeColor: '#f4f1ea' },
                primary: {
                    50: '#f0eee9',
                    100: '#e2ded4',
                    200: '#c9c3b4',
                    300: '#a49b85',
                    400: '#6e6552',
                    500: '#2c2a24',
                    600: '#24221d',
                    700: '#1c1b16',
                    800: '#151410',
                    900: '#0e0d0a',
                    solidBg: '#24221d',
                    solidHoverBg: '#0e0d0a',
                    softBg: '#e6e2d8',
                    softColor: '#24221d',
                    plainColor: '#24221d',
                },
                background: {
                    body: '#f4f1ea',
                    surface: '#faf8f3',
                    level1: '#e9e5db',
                },
                text: {
                    primary: '#1b1a15',
                    secondary: '#403d35',
                    tertiary: '#736e60',
                },
                page: {
                    border: '#d5cfc0',
                    rule: '#1b1a15',
                    cardShadow: '0 8px 18px -12px rgba(27, 26, 21, 0.4)',
                    cardShadowHover: '0 10px 22px -12px rgba(27, 26, 21, 0.5)',
                    headerBg: '#f4f1ea',
                    noteBg: '#ede3c6',
                    noteBar: '#8f6508',
                    codeBg: '#ebe7dc',
                },
            },
        },
        dark: {
            palette: {
                head: { themeColor: '#16150f' },
                primary: {
                    50: '#141309',
                    100: '#1e1c13',
                    200: '#2c2921',
                    300: '#4c483c',
                    400: '#8c8574',
                    500: '#d8d2c2',
                    600: '#e4dfd2',
                    700: '#efebe1',
                    800: '#f5f2ea',
                    900: '#faf8f3',
                    solidBg: '#e4dfd2',
                    solidHoverBg: '#faf8f3',
                    solidColor: '#16150f',
                    softBg: '#262319',
                    softColor: '#e4dfd2',
                    plainColor: '#e4dfd2',
                },
                background: {
                    body: '#16150f',
                    surface: '#1d1c14',
                    level1: '#262419',
                },
                text: {
                    primary: '#f2efe6',
                    secondary: '#c3bead',
                    tertiary: '#8d8776',
                },
                page: {
                    border: '#33301f',
                    rule: '#f2efe6',
                    cardShadow: '0 8px 18px -12px rgba(0, 0, 0, 0.8)',
                    cardShadowHover: '0 10px 22px -12px rgba(0, 0, 0, 0.9)',
                    headerBg: '#16150f',
                    noteBg: '#2e2712',
                    noteBar: '#d9a938',
                    codeBg: '#201e15',
                },
            },
        },
    },
    components: {
        JoyTypography: {
            styleOverrides: {
                // Заголовки набираем антиквой, остальной текст — Geologica
                root: ({ ownerState }) =>
                    ['h1', 'h2', 'h3', 'h4'].includes(ownerState.level)
                        ? { fontFamily: displayFont, letterSpacing: '-0.015em' }
                        : {},
            },
        },
        JoyButton: {
            styleOverrides: {
                // Прямоугольная плашка без тени и без скруглений
                root: {
                    fontWeight: 600,
                    borderRadius: 0,
                    letterSpacing: '0.005em',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                },
            },
        },
        JoyIconButton: {
            styleOverrides: {
                root: { borderRadius: 0 },
            },
        },
        JoyChip: {
            styleOverrides: {
                // Теги — как пометки на полях: моноширинные, углы прямые
                root: {
                    fontWeight: 400,
                    borderRadius: 0,
                    fontFamily: codeFont,
                    letterSpacing: '0.01em',
                },
            },
        },
        JoySheet: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            },
        },
    },
})

export default themeVariant
