import { extendTheme } from '@mui/joy/styles'

const fontFamily = "'Geologica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

const themeVariant = extendTheme({
    cssVarPrefix: 'dd',
    fontFamily: {
        body: fontFamily,
        display: fontFamily,
        code: "'SF Mono', ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, monospace",
    },
    radius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '22px',
        xl: '28px',
    },
    colorSchemes: {
        light: {
            palette: {
                head: { themeColor: '#fbfbfe' },
                primary: {
                    50: '#eef2ff',
                    100: '#dde5ff',
                    200: '#bfcdff',
                    300: '#96acff',
                    400: '#6b86f7',
                    500: '#3b52e8',
                    600: '#3243cf',
                    700: '#2a37a8',
                    800: '#242e85',
                    900: '#1e2569',
                    softBg: '#e6ecff',
                    softColor: '#2a37a8',
                },
                background: {
                    body: '#fbfbfe',
                    surface: '#ffffff',
                    level1: '#f4f5fb',
                },
                text: {
                    primary: '#14162a',
                    secondary: '#4b5064',
                    tertiary: '#787e94',
                },
                page: {
                    glow1: 'rgba(124, 149, 251, 0.12)',
                    glow2: 'rgba(255, 176, 124, 0.10)',
                    glow3: 'rgba(120, 220, 190, 0.11)',
                    border: 'rgba(22, 24, 43, 0.11)',
                    cardShadow: '0 18px 44px -28px rgba(22, 24, 43, 0.35)',
                    cardShadowHover: '0 28px 60px -26px rgba(22, 24, 43, 0.42)',
                    headerBg: 'rgba(251, 251, 254, 0.72)',
                    noteBg: '#fcefd2',
                    noteBar: '#b07800',
                },
            },
        },
        dark: {
            palette: {
                head: { themeColor: '#12131c' },
                primary: {
                    softBg: 'rgba(107, 134, 247, 0.20)',
                    softColor: '#c3cdff',
                    solidBg: '#4457e6',
                },
                background: {
                    body: '#12131c',
                    surface: '#191b27',
                    level1: '#1f2130',
                },
                text: {
                    primary: '#f0f1f7',
                    secondary: '#b3b8cd',
                    tertiary: '#8b90a6',
                },
                page: {
                    glow1: 'rgba(91, 116, 239, 0.12)',
                    glow2: 'rgba(224, 122, 63, 0.08)',
                    glow3: 'rgba(47, 158, 126, 0.09)',
                    border: 'rgba(255, 255, 255, 0.12)',
                    cardShadow: '0 18px 44px -30px rgba(0, 0, 0, 0.9)',
                    cardShadowHover: '0 28px 60px -28px rgba(0, 0, 0, 1)',
                    headerBg: 'rgba(18, 19, 28, 0.72)',
                    noteBg: 'rgba(176, 120, 0, 0.18)',
                    noteBar: '#e0a92a',
                },
            },
        },
    },
    components: {
        JoyButton: {
            styleOverrides: {
                root: { fontWeight: 700, borderRadius: '999px' },
            },
        },
        JoyChip: {
            styleOverrides: {
                root: { fontWeight: 400 },
            },
        },
    },
})

export default themeVariant
