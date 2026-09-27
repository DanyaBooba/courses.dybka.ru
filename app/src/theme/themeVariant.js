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
                head: { themeColor: '#fbfaf6' },
                primary: {
                    50: '#f6f4ef',
                    100: '#eceade',
                    200: '#d4cfc0',
                    300: '#aca48f',
                    400: '#6e6552',
                    500: '#2c2a24',
                    600: '#24221d',
                    700: '#1c1b16',
                    800: '#151410',
                    900: '#0e0d0a',
                    solidBg: '#24221d',
                    solidHoverBg: '#0e0d0a',
                    softBg: '#efece2',
                    softColor: '#24221d',
                    plainColor: '#24221d',
                },
                // Бумага почти белая: тепло в фоне угадывается, но не бьёт в глаза
                background: {
                    body: '#fbfaf6',
                    surface: '#ffffff',
                    level1: '#f2f0e8',
                },
                text: {
                    primary: '#1b1a15',
                    secondary: '#403d35',
                    tertiary: '#736e60',
                },
                page: {
                    border: '#e3dfd2',
                    rule: '#1b1a15',
                    cardShadow: '0 8px 18px -12px rgba(27, 26, 21, 0.4)',
                    cardShadowHover: '0 10px 22px -12px rgba(27, 26, 21, 0.5)',
                    headerBg: '#fbfaf6',
                    noteBg: '#f6ecd2',
                    noteBar: '#8f6508',
                    codeBg: '#f3f1e8',
                    // Краска для смысловых акцентов в тексте страницы
                    accentInk: '#b4531f',
                },
                // Подсветка кода — как в редакторе, но красками этой бумаги
                code: {
                    comment: '#8a8474',
                    punctuation: '#6e6552',
                    keyword: '#9b2c6f',
                    string: '#0b7280',
                    number: '#b13760',
                    fn: '#155f97',
                    tag: '#c1551d',
                    attrName: '#8f6508',
                    variable: '#a1481b',
                    builtin: '#6338c4',
                    classname: '#3a44b0',
                    deleted: '#a8324f',
                    inserted: '#2f7a3f',
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
                    accentInk: '#e79463',
                },
                code: {
                    comment: '#7e7868',
                    punctuation: '#a49b85',
                    keyword: '#e08bc0',
                    string: '#6fc9c8',
                    number: '#e79bb5',
                    fn: '#86b9e6',
                    tag: '#e79463',
                    attrName: '#d9a938',
                    variable: '#e7a07c',
                    builtin: '#b49ceb',
                    classname: '#9aa1ea',
                    deleted: '#e78a9f',
                    inserted: '#8ecf9b',
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
